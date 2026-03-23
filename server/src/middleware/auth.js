const admin = require('firebase-admin');
const User = require('../models/User');

const hasFirebaseCreds = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

const allowInsecureAuth =
  process.env.ALLOW_INSECURE_AUTH === 'true' ||
  (!hasFirebaseCreds && process.env.NODE_ENV !== 'production');

if (hasFirebaseCreds && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
} else if (!hasFirebaseCreds) {
  console.warn('[auth] Firebase Admin credentials missing.');
  if (allowInsecureAuth) {
    console.warn('[auth] Insecure auth fallback is enabled for local development.');
  }
}

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json);
}

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decoded;
    if (hasFirebaseCreds) {
      decoded = await admin.auth().verifyIdToken(idToken);
    } else if (allowInsecureAuth) {
      decoded = decodeJwtPayload(idToken);
      if (!decoded?.user_id && !decoded?.sub) {
        return res.status(401).json({ error: 'Invalid token payload.' });
      }
      decoded = {
        uid: decoded.user_id || decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
    } else {
      return res.status(500).json({
        error: 'Firebase Admin credentials are missing on server.',
      });
    }

    const adminEmails = String(process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const shouldBeAdmin = decoded?.email && adminEmails.includes(String(decoded.email).toLowerCase());

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || 'MockMate User',
        email: decoded.email || '',
        photoURL: decoded.picture || null,
        role: shouldBeAdmin ? 'admin' : 'candidate',
      });
      console.log(`[auth] New user created: ${user.email}`);
    }

    if (shouldBeAdmin && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};
