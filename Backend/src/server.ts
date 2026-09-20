import { server } from './app';
import { env } from './config/env';

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health\n`);
});
