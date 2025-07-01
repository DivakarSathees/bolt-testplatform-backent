const Group = require('../models/group.model');

// Create Group
const createGroup = async (data) => {
  const { name, batchId, candidateIds, createdBy, lastUpdatedBy } = data;

  if (!name || !batchId || !createdBy) {
    const err = new Error('Missing required fields');
    err.status = 400;
    throw err;
  }

  const group = new Group({
    name,
    batchId,
    candidateIds: candidateIds || [],
    isActive: true,
    createdBy,
    lastUpdatedBy
  });

  await group.save();

  return {
    message: 'Group created successfully',
    groupId: group._id
  };
};

// Get All Groups
const getAllGroups = async () => {
  return await Group.find(); // includes active & inactive
};

// Get Group by ID
const getGroupById = async (id) => {
  const group = await Group.findById(id);
  if (!group) {
    const err = new Error('Group not found');
    err.status = 404;
    throw err;
  }
  return group;
};

// Update Group
const updateGroup = async (id, updateData) => {
  updateData.updatedAt = new Date();

  const updatedGroup = await Group.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedGroup) {
    const err = new Error('Group not found or update failed');
    err.status = 404;
    throw err;
  }

  return updatedGroup;
};

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup
};
