import { server } from './app';
import { env } from './config/env';

const PORT = Number(env.PORT) || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://0.0.0.0:${PORT}/health\n`);
});
