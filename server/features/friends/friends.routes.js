import express from 'express';
import { body, param } from 'express-validator';
import { listFriends, sendRequest, acceptRequest, deleteRequest, removeFriend } from './friends.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { protect } from '../auth/auth.middleware.js';

const router = express.Router();

const idParam = (name) => param(name).isMongoId().withMessage('Invalid id');

router.get('/', protect, listFriends);
router.post(
  '/requests',
  protect,
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Enter a username'),
  validate,
  sendRequest
);
router.post('/requests/:id/accept', protect, idParam('id'), validate, acceptRequest);
router.delete('/requests/:id', protect, idParam('id'), validate, deleteRequest);
router.delete('/:userId', protect, idParam('userId'), validate, removeFriend);

export default router;
