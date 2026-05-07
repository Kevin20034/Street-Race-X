import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { configureSockets } from './sockets';

const server = http.createServer(app);

configureSockets(server);

server.listen(env.port, () => {
  console.log(`Street Race X API running on http://localhost:${env.port}`);
});
