import initializeOtel from '#@/config/otel';
initializeOtel();

// eslint-disable-next-line import/first
import { PrismaClient } from '@prisma/client';

export default new PrismaClient();
