import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID Token from Authorization header.
 * Formats attached user: { uid, email, name, photoURL, admin }
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
    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email || 'Anonymous',
      photoURL: decodedToken.picture || '',
      admin: !!decodedToken.admin,
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
 * Middleware requiring the user to have admin claim (req.user.admin === true).
 */
export const verifyAdmin = (req, res, next) => {
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
