import express from 'express';
import { 
  getBugs, 
  getBugById, 
  createBug, 
  updateBug, 
  deleteBug,
  getBugStats 
} from '../controllers/bugController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBug } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBugs)
  .post(protect, validateBug, createBug);

router.get('/stats', getBugStats);

router.route('/:id')
  .get(getBugById)
  .put(protect, validateBug, updateBug)
  .delete(protect, deleteBug);

export default router;