import {
  getGroups as fetchGroupsService,
  createGroup as createGroupService,
  getGroupById as fetchGroupByIdService,
  joinGroup as joinGroupService,
  leaveGroup as leaveGroupService,
  getGroupMessages as fetchGroupMessagesService,
} from '../services/firestore.service.js';

export const handleGetGroups = async (req, res, next) => {
  try {
    const { district, category, date } = req.query;
    const groups = await fetchGroupsService({ district, category, date });
    res.status(200).json({ data: groups });
  } catch (error) {
    next(error);
  }
};

export const handleCreateGroup = async (req, res, next) => {
  try {
    const group = await createGroupService(req.body, req.user.uid);
    res.status(201).json({
      data: group,
      message: 'Group created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetGroupById = async (req, res, next) => {
  try {
    const group = await fetchGroupByIdService(req.params.id);
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.status(200).json({ data: group });
  } catch (error) {
    next(error);
  }
};

export const handleJoinGroup = async (req, res, next) => {
  try {
    const updatedGroup = await joinGroupService(req.params.id, req.user.uid);
    res.status(200).json({
      data: updatedGroup,
      message: 'Joined group successfully',
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

export const handleLeaveGroup = async (req, res, next) => {
  try {
    const updatedGroup = await leaveGroupService(req.params.id, req.user.uid);
    res.status(200).json({
      data: updatedGroup,
      message: 'Left group successfully',
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

export const handleGetGroupMessages = async (req, res, next) => {
  try {
    const messages = await fetchGroupMessagesService(req.params.id);
    res.status(200).json({ data: messages });
  } catch (error) {
    next(error);
  }
};
