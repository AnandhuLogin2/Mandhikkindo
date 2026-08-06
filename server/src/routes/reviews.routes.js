import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema, reviewQuerySchema } from '../validators/reviews.validator.js';
import {
  handleGetReviews,
  handleCreateReview,
  handleDeleteReview,
} from '../controllers/reviews.controller.js';

const router = Router();

router.get('/', validate(reviewQuerySchema), handleGetReviews);
router.post('/', verifyAuth, validate(createReviewSchema), handleCreateReview);
router.delete('/:id', verifyAuth, handleDeleteReview);

export default router;
