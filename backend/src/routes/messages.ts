// src/routes/messages.ts
import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { sendMessage, getRecentMessages } from '../controllers/messagesController';

const router = Router();

// Pública — usada pelo polling do aquário (qualquer visitante vê as mensagens recentes)
router.get('/recent', getRecentMessages);

// Protegida — só usuário logado pode enviar.
// O cast abaixo evita um erro de overload do TS/Express: o `authenticate` exige
// `req: AuthRequest` (com `user` obrigatório), e o Express não consegue unificar
// isso automaticamente com o handler seguinte no mesmo router.post(...).
router.post('/', authenticate as RequestHandler, sendMessage);

export default router;