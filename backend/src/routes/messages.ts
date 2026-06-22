// src/routes/messages.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { sendMessage, getRecentMessages } from '../controllers/messagesController';

const router = Router();

// Pública — usada pelo polling do aquário (qualquer visitante vê as mensagens recentes)
router.get('/recent', getRecentMessages);

// Protegida — só usuário logado pode enviar
router.post('/', authenticate, sendMessage);

export default router;
