import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sessionSchema } from '../validators/auth.validator.js';
import { handleSessionBootstrap, handleGetMe } from '../controllers/auth.controller.js';

const router = Router();

router.post('/session', verifyAuth, validate(sessionSchema), handleSessionBootstrap);
router.get('/me', verifyAuth, handleGetMe);

export default router;
