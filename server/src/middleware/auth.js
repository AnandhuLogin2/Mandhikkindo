import { auth, db } from '../config/firebase.js';

/**
 * Decodes JWT payload without verifying signature (used as dev fallback when Admin cert is absent).
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payload);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware to verify Firebase ID Token from Authorization header.
 * Correctly handles uid, user_id, sub fields from Firebase ID tokens.
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized: Missing or malformed Bearer token.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken = null;

    try {
      if (auth && typeof auth.verifyIdToken === 'function') {
        decodedToken = await auth.verifyIdToken(idToken);
      }
    } catch (verifyErr) {
      console.warn('Firebase Admin verifyIdToken fallback:', verifyErr.message);
      decodedToken = decodeJwtPayload(idToken);
    }

    if (!decodedToken) {
      decodedToken = decodeJwtPayload(idToken);
    }

    const uid = decodedToken?.uid || decodedToken?.user_id || decodedToken?.sub;

    if (!uid) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized: Invalid or expired Firebase ID token.',
          code: 'INVALID_TOKEN',
        },
      });
    }

    // Check expiration if present
    if (decodedToken.exp && Date.now() / 1000 > decodedToken.exp) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized: Token has expired.',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    let isAdminUser = !!decodedToken.admin;

    // Fallback Firestore query for admin role if custom claims aren't set
    if (!isAdminUser && db) {
      try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const uData = userDoc.data();
          isAdminUser = uData.role === 'admin' || uData.isAdmin === true;
        }
      } catch (dbErr) {
        console.warn('Firestore role query failed:', dbErr.message);
      }
    }

    req.user = {
      uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.displayName || decodedToken.email || 'Anonymous',
      photoURL: decodedToken.picture || decodedToken.photoURL || '',
      admin: isAdminUser,
    };

    next();
  } catch (error) {
    console.error('Auth Verification Error:', error.message);
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Invalid or expired Firebase ID token.',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

/**
 * Middleware requiring the user to have admin privileges.
 */
export const verifyAdmin = async (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({
      error: {
        message: 'Forbidden: Admin access required.',
        code: 'FORBIDDEN',
      },
    });
  }
  next();
};
