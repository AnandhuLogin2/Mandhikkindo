import { Router } from 'express';
import { verifyAuth, verifyAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createShopSchema,
  updateShopSchema,
  shopQuerySchema,
} from '../validators/shops.validator.js';
import {
  handleGetShops,
  handleGetShopById,
  handleCreateShop,
  handleUpdateShop,
  handleDeleteShop,
} from '../controllers/shops.controller.js';

const router = Router();

router.get('/', validate(shopQuerySchema), handleGetShops);
router.get('/:id', handleGetShopById);

// Admin-only endpoints
router.post('/', verifyAuth, verifyAdmin, validate(createShopSchema), handleCreateShop);
router.patch('/:id', verifyAuth, verifyAdmin, validate(updateShopSchema), handleUpdateShop);
router.delete('/:id', verifyAuth, verifyAdmin, handleDeleteShop);

export default router;
