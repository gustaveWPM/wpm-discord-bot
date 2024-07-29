import { TraceIdRatioBasedSampler, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Resource } from '@opentelemetry/resources';
import * as api from '@opentelemetry/api';

function initializeOtel() {
  const traceRatio = process.env.NODE_ENV === 'production' ? 0.1 : 1.0;

  const contextManager = new AsyncHooksContextManager().enable();

  api.context.setGlobalContextManager(contextManager);

  const exporter = new OTLPTraceExporter({
    hostname: 'http://jaeger:4318/v1/traces'
  });

  const tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: 'wpm-discord-bot',
      [SEMRESATTRS_SERVICE_VERSION]: '0.1.0'
    }),

    sampler: new TraceIdRatioBasedSampler(traceRatio)
  });

  if (process.env.NODE_ENV?.startsWith('prod')) {
    tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));
  } else {
    tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  }

  registerInstrumentations({
    instrumentations: [new PrismaInstrumentation()],
    tracerProvider
  });

  tracerProvider.register();
}

export default initializeOtel;
