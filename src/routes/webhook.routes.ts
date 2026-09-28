import { Router } from 'express';
import {
  facebookWebhookHandler,
  facebookWebhookPostHandler,
} from '../controllers/facebookWehbook.controller.js';

const router = Router();

router.get('/fb', facebookWebhookHandler);
router.post('/fb', facebookWebhookPostHandler);

export default router;
