import {
  getReviewsByShopId,
  createReviewTransaction,
  deleteReviewTransaction,
} from '../services/firestore.service.js';

export const handleGetReviews = async (req, res, next) => {
  try {
    const { shopId } = req.query;
    const reviews = await getReviewsByShopId(shopId);
    res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};

export const handleCreateReview = async (req, res, next) => {
  try {
    const { shopId, rating, text } = req.body;
    const result = await createReviewTransaction({
      shopId,
      authorUid: req.user.uid,
      authorName: req.user.name || 'Anonymous',
      rating,
      text,
    });
    res.status(201).json({
      data: result.review,
      updatedShop: result.updatedShop,
      message: 'Review created successfully',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: { message: error.message, code: error.code },
      });
    }
    next(error);
  }
};

export const handleDeleteReview = async (req, res, next) => {
  try {
    await deleteReviewTransaction(req.params.id, req.user.uid);
    res.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        error: { message: error.message, code: error.code },
      });
    }
    next(error);
  }
};
