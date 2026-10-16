// Motohelp SCM — Enterprise Authentication & Role-Based Access Control (RBAC)
// Uses official Clerk Express token verification and enforces zero trust in client headers

import { getAuth, clerkClient } from '@clerk/express';

export const SUPER_ADMIN_EMAIL = 'ronak.naik019@gmail.com';

// In-memory cache for Clerk user profiles with 5-minute TTL
const userCache = new Map();
const USER_CACHE_TTL_MS = 5 * 60 * 1000;

export const getCachedClerkUser = async (userId) => {
  if (!userId) return null;
  const cached = userCache.get(userId);
  if (cached && (Date.now() - cached.timestamp < USER_CACHE_TTL_MS)) {
    return cached.data;
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    userCache.set(userId, { data: user, timestamp: Date.now() });
    return user;
  } catch (err) {
    console.error(`[Auth] Failed to fetch Clerk user ${userId}:`, err?.message || err);
    return null;
  }
};

/**
 * Resolves verified user context server-side.
 * Strictly ignores unverified request headers like X-User-Role and X-User-Email.
 */
export const resolveUserContext = async (req) => {
  // 1. Verify Clerk JWT Session Token via @clerk/express
  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      const clerkUser = await getCachedClerkUser(auth.userId);
      if (clerkUser) {
        const primaryEmail = (
          clerkUser.primaryEmailAddress?.emailAddress ||
          clerkUser.emailAddresses?.[0]?.emailAddress ||
          ''
        ).trim().toLowerCase();

        const isSuperAdmin = primaryEmail === SUPER_ADMIN_EMAIL.toLowerCase();
        const metadataRole = clerkUser.publicMetadata?.role;

        // Role determination: only superadmin email can have 'admin' role
        const role = isSuperAdmin ? 'admin' : (metadataRole === 'admin' ? 'customer' : (metadataRole || 'customer'));

        return {
          id: clerkUser.id,
          name: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail.split('@')[0],
          email: primaryEmail,
          role,
          isSuperAdmin,
          source: 'clerk_jwt',
          isAuthenticated: true
        };
      }
    }
  } catch (err) {
    console.error('[Auth] Error verifying Clerk token:', err?.message || err);
  }

  // 2. Development-Only Offline Demo Token (Isolated to non-production environments)
  const isDev = process.env.NODE_ENV !== 'production';
  const authHeader = req.headers['authorization'];
  if (isDev && authHeader && authHeader.startsWith('Bearer SCM-DEMO-')) {
    const raw = authHeader.replace('Bearer SCM-DEMO-', '');
    const parts = raw.split('-');
    const email = decodeURIComponent(parts[0] || '').trim().toLowerCase();
    const roleCandidate = decodeURIComponent(parts[1] || 'customer');
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL.toLowerCase();
    const role = isSuperAdmin ? 'admin' : (roleCandidate === 'admin' ? 'customer' : roleCandidate);

    return {
      id: `DEMO-${email || 'ANON'}`,
      name: isSuperAdmin ? 'Ronak Naik' : 'Demo User',
      email,
      role,
      isSuperAdmin,
      source: 'dev_demo',
      isAuthenticated: true
    };
  }

  // 3. Unauthenticated / Anonymous
  return {
    id: null,
    name: 'Anonymous',
    email: null,
    role: 'anonymous',
    isSuperAdmin: false,
    source: 'unauthenticated',
    isAuthenticated: false
  };
};

/**
 * Middleware: Enforces that the request is authenticated.
 * Returns 401 Unauthorized if missing or invalid token.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const user = await resolveUserContext(req);
    if (!user.isAuthenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', message: err.message });
  }
};

/**
 * Middleware: Enforces that the authenticated user has one of the allowed roles.
 * Super Admin (ronak.naik019@gmail.com) is universally authorized.
 */
export const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = await resolveUserContext(req);
      if (!user.isAuthenticated) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.'
        });
      }
      req.user = user;

      // Super Admin bypasses role checks
      if (user.isSuperAdmin) {
        return next();
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Permitted roles: [${allowedRoles.join(', ')}]. Current role: '${user.role}'.`
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  };
};

/**
 * Middleware: Strictly requires Super Admin privileges.
 * Validates that primary email is ronak.naik019@gmail.com and role is admin.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const user = await resolveUserContext(req);
    if (!user.isAuthenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required for administrative operations.'
      });
    }
    req.user = user;

    if (!user.isSuperAdmin || user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Administrative access restricted: Only ${SUPER_ADMIN_EMAIL} is authorized for administrator privileges.`
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

/**
 * Middleware: Restricts dangerous administrative endpoints to development environments only.
 */
export const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Direct database management and destructive operations are disabled in production.'
    });
  }
  next();
};
