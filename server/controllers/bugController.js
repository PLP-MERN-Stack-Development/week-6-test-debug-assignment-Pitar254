import { createClient } from '@supabase/supabase-js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Public
export const getBugs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('bugs')
    .select('*, users(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limit - 1);

  const { data: bugs, error, count } = await query;

  if (error) {
    logger.error('Error fetching bugs:', error);
    res.status(400);
    throw new Error('Failed to fetch bugs');
  }

  res.json({
    bugs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit),
    },
  });
});

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Public
export const getBugById = asyncHandler(async (req, res) => {
  const { data: bug, error } = await supabase
    .from('bugs')
    .select('*, users(name, email)')
    .eq('id', req.params.id)
    .single();

  if (error || !bug) {
    res.status(404);
    throw new Error('Bug not found');
  }

  res.json(bug);
});

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Private
export const createBug = asyncHandler(async (req, res) => {
  const { title, description, priority, assignee, tags } = req.body;

  const { data: bug, error } = await supabase
    .from('bugs')
    .insert([
      {
        title,
        description,
        priority,
        status: 'open',
        reporter_id: req.user.id,
        assignee_id: assignee,
        tags,
      },
    ])
    .select('*, users(name, email)')
    .single();

  if (error) {
    logger.error('Error creating bug:', error);
    res.status(400);
    throw new Error('Failed to create bug');
  }

  logger.info(`Bug created: ${bug.id} by user ${req.user.id}`);
  res.status(201).json(bug);
});

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Private
export const updateBug = asyncHandler(async (req, res) => {
  const { title, description, priority, status, assignee, tags } = req.body;

  const { data: bug, error } = await supabase
    .from('bugs')
    .update({
      title,
      description,
      priority,
      status,
      assignee_id: assignee,
      tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select('*, users(name, email)')
    .single();

  if (error) {
    logger.error('Error updating bug:', error);
    res.status(400);
    throw new Error('Failed to update bug');
  }

  if (!bug) {
    res.status(404);
    throw new Error('Bug not found');
  }

  logger.info(`Bug updated: ${bug.id} by user ${req.user.id}`);
  res.json(bug);
});

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Private
export const deleteBug = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('bugs')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    logger.error('Error deleting bug:', error);
    res.status(400);
    throw new Error('Failed to delete bug');
  }

  logger.info(`Bug deleted: ${req.params.id} by user ${req.user.id}`);
  res.json({ message: 'Bug removed' });
});

// @desc    Get bug statistics
// @route   GET /api/bugs/stats
// @access  Public
export const getBugStats = asyncHandler(async (req, res) => {
  const { data: stats, error } = await supabase
    .from('bugs')
    .select('status, priority');

  if (error) {
    logger.error('Error fetching bug stats:', error);
    res.status(400);
    throw new Error('Failed to fetch statistics');
  }

  const statusCounts = stats.reduce((acc, bug) => {
    acc[bug.status] = (acc[bug.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = stats.reduce((acc, bug) => {
    acc[bug.priority] = (acc[bug.priority] || 0) + 1;
    return acc;
  }, {});

  res.json({
    total: stats.length,
    statusBreakdown: statusCounts,
    priorityBreakdown: priorityCounts,
  });
});