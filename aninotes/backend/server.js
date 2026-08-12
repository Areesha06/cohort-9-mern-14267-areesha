import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';

const rawPort = process.env.PORT;

if (rawPort !== undefined && rawPort.trim() === '') {
  throw new Error('PORT must not be empty');
}

const PORT = rawPort === undefined ? 5000 : Number(rawPort);

if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (
  !JWT_SECRET ||
  JWT_SECRET.trim() === '' ||
  JWT_SECRET === 'your_jwt_secret_here'
) {
  throw new Error('JWT_SECRET must be configured with a valid secret');
}

if (!JWT_EXPIRES_IN || JWT_EXPIRES_IN.trim() === '') {
  throw new Error('JWT_EXPIRES_IN must be configured');
}

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
