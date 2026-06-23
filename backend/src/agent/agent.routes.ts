import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleAgentMessage, handleConfirmAction } from './agent.controller';

const router = Router();

// todas las rutas del agente requieren autenticación
router.use(authMiddleware);

// POST /api/agent/message — enviar mensaje al agente
router.post('/message', handleAgentMessage);

// POST /api/agent/confirm-action — confirmar o cancelar acción pendiente (HITL)
router.post('/confirm-action', handleConfirmAction);

export default router;
