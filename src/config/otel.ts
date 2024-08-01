import type { AutoLoaderOptions } from '@opentelemetry/instrumentation';
import type { Tracer } from '@opentelemetry/api';

import { TraceIdRatioBasedSampler, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { trace } from '@opentelemetry/api';

function initializeTracing({
  instrumentations,
  serviceVersion,
  serviceName
}: {
  instrumentations?: AutoLoaderOptions['instrumentations'];
  serviceVersion: string;
  serviceName: string;
}): Tracer {
  const isProd = process.env.NODE_ENV?.startsWith('prod') ?? true;
  const traceRatio = isProd ? 0.1 : 1.0;

  const tracerProvider = new NodeTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
      [SEMRESATTRS_SERVICE_NAME]: serviceName
    }),

    sampler: new TraceIdRatioBasedSampler(traceRatio)
  });

  const exporter = new OTLPTraceExporter({
    url: 'http://jaeger:4318/v1/traces'
  });

  if (isProd) {
    tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));
  } else {
    tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  }

  registerInstrumentations({
    instrumentations,
    tracerProvider
  });

  tracerProvider.register();

  return trace.getTracer(serviceName);
}

export default initializeTracing;
