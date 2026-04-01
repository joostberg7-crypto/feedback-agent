import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';

const router = Router();

router.get('/', chatController.getAllSessions);
router.post('/', chatController.createSession);
router.post('/:id/chat', chatController.sendMessage);

export default router;