import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { apiRoutes } from './routes';

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/api/docs.json',
    },
  }),
);

app.use('/api', apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
