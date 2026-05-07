import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { challengeRoutes } from './challenge.routes';
import { healthRoutes } from './health.routes';
import { notificationRoutes } from './notification.routes';
import { userRoutes } from './user.routes';
import { vehicleRoutes } from './vehicle.routes';

export const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/vehicles', vehicleRoutes);
apiRoutes.use('/challenges', challengeRoutes);
apiRoutes.use('/notifications', notificationRoutes);
