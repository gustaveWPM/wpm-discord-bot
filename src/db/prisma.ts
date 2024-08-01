import { PrismaInstrumentation } from '@prisma/instrumentation';
import initializeTracing from '#@/config/otel';
initializeTracing({ instrumentations: [new PrismaInstrumentation()], serviceName: 'wpm-bot-prisma', serviceVersion: '1' });

// eslint-disable-next-line import/first
import { PrismaClient } from '@prisma/client';

export default new PrismaClient();
