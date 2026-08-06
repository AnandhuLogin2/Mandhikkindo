import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createGroupSchema, groupQuerySchema } from '../validators/groups.validator.js';
import {
  handleGetGroups,
  handleCreateGroup,
  handleGetGroupById,
  handleJoinGroup,
  handleLeaveGroup,
  handleGetGroupMessages,
} from '../controllers/groups.controller.js';

const router = Router();

router.get('/', validate(groupQuerySchema), handleGetGroups);
router.post('/', verifyAuth, validate(createGroupSchema), handleCreateGroup);
router.get('/:id', handleGetGroupById);
router.post('/:id/join', verifyAuth, handleJoinGroup);
router.post('/:id/leave', verifyAuth, handleLeaveGroup);
router.get('/:id/messages', handleGetGroupMessages);

export default router;
