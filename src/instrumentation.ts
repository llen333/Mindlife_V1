export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { setup } = await import('@frontman-ai/nextjs/Instrumentation');
    const [logProcessor, spanProcessor] = setup();
    new NodeSDK({
      logRecordProcessors: [logProcessor],
      spanProcessors: [spanProcessor],
    }).start();

    const { initKernel } = await import('@/lib/kernel/main');
    initKernel();
  }
}
