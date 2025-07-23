import Joi from 'joi';

const bugSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').default('open'),
  assignee: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const validateBug = (req, res, next) => {
  const { error } = bugSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message,
    });
  }
  next();
};

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details[0].message,
    });
  }
  next();
};