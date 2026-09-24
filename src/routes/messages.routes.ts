import { Router } from 'express';

import { verifyTenantToken } from '../middlewares/auth.js';
import { sendWhatsappMessage } from '../controllers/whatsapp-message.controller.js';

const router = Router();

router.post('/', verifyTenantToken, sendWhatsappMessage);

export default router;
