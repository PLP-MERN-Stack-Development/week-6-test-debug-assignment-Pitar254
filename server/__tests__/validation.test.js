import { validateBug, validateUser } from '../middleware/validationMiddleware.js';

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('validateBug', () => {
    it('should pass with valid bug data', () => {
      req.body = {
        title: 'Valid Bug Title',
        description: 'This is a valid bug description with enough characters',
        priority: 'medium',
      };

      validateBug(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid title', () => {
      req.body = {
        title: 'AB', // Too short
        description: 'This is a valid bug description with enough characters',
        priority: 'medium',
      };

      validateBug(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid priority', () => {
      req.body = {
        title: 'Valid Bug Title',
        description: 'This is a valid bug description with enough characters',
        priority: 'invalid-priority',
      };

      validateBug(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUser', () => {
    it('should pass with valid user data', () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      validateUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid email', () => {
      req.body = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});