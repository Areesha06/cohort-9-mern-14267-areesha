import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';

const PORT = Number(process.env.PORT ?? 5000);

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535');
}

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
