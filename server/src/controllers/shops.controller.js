import {
  getShops as fetchShopsService,
  getShopById as fetchShopByIdService,
  createShop as createShopService,
  updateShop as updateShopService,
  deleteShop as deleteShopService,
} from '../services/firestore.service.js';

export const handleGetShops = async (req, res, next) => {
  try {
    const { district, type, search, sort, page, limit } = req.query;
    const result = await fetchShopsService({
      district,
      type,
      search,
      sort,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleGetShopById = async (req, res, next) => {
  try {
    const shop = await fetchShopByIdService(req.params.id);
    if (!shop) {
      return res.status(404).json({
        error: {
          message: 'Shop not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.status(200).json({ data: shop });
  } catch (error) {
    next(error);
  }
};

export const handleCreateShop = async (req, res, next) => {
  try {
    const shop = await createShopService(req.body);
    res.status(201).json({
      data: shop,
      message: 'Shop created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateShop = async (req, res, next) => {
  try {
    const shop = await updateShopService(req.params.id, req.body);
    if (!shop) {
      return res.status(404).json({
        error: {
          message: 'Shop not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.status(200).json({
      data: shop,
      message: 'Shop updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteShop = async (req, res, next) => {
  try {
    const success = await deleteShopService(req.params.id);
    if (!success) {
      return res.status(404).json({
        error: {
          message: 'Shop not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.status(200).json({
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
