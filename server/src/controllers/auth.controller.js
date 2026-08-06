import { upsertUser, getUserById } from '../services/firestore.service.js';

export const handleSessionBootstrap = async (req, res, next) => {
  try {
    const userProfile = await upsertUser(req.user);
    res.status(200).json({
      data: userProfile,
      message: 'Session bootstrapped successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMe = async (req, res, next) => {
  try {
    const profile = await getUserById(req.user.uid);
    if (!profile) {
      return res.status(404).json({
        error: {
          message: 'User profile not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.status(200).json({ data: profile });
  } catch (error) {
    next(error);
  }
};
