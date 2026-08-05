import { Router } from 'express';
import { loginRateLimiter } from '../../middleware/rateLimiter';
import { authenticateToken } from '../../middleware/authenticateToken';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from './auth.controller';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginRateLimiter, loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticateToken, getMeHandler);

export default router;
