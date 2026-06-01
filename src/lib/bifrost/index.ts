import { BifrostDecision, BifrostRouteResult } from './types';
import { detect } from './detector';
import { bus } from '@/lib/bus/orchestrator';
import { MessageContext } from '@/lib/bus/types';

export { type BifrostDecision, type BifrostRouteResult } from './types';

class Bifrost {
  async detectAndRoute(
    message: string,
    context: Partial<MessageContext> & { agentName?: string; role?: string } = {}
  ): Promise<BifrostRouteResult> {
    const msgCtx: MessageContext = {
      message,
      history: context.history || [],
      sessionId: context.sessionId,
      userId: context.userId,
    };

    // 1. Lightning detection (0 LLM calls, keyword-based)
    const lightningDecision = await detect(message, 'lightning', {
      agentName: context.agentName,
      role: context.role,
    });

    if (lightningDecision && lightningDecision.moduleId) {
      const module = bus.getModule(lightningDecision.moduleId);
      if (module) {
        try {
          const result = await module.execute({
            ...msgCtx,
            intent: lightningDecision.intent,
          });

          return {
            handled: true,
            response: result.content,
            moduleId: lightningDecision.moduleId,
            decision: lightningDecision,
          };
        } catch (e: any) {
          return {
            handled: false,
            response: undefined,
            decision: {
              ...lightningDecision,
              confidence: 'low',
              reasoning: `Module error: ${e.message}`,
            },
          };
        }
      }
    }

    // 2. Deep detection (1 LLM call for ambiguous queries)
    if (lightningDecision === null) {
      const deepDecision = await detect(message, 'deep', {
        agentName: context.agentName,
        role: context.role,
      });

      if (deepDecision && deepDecision.moduleId) {
        const module = bus.getModule(deepDecision.moduleId);
        if (module) {
          try {
            const result = await module.execute({
              ...msgCtx,
              intent: deepDecision.intent,
            });

            return {
              handled: true,
              response: result.content,
              moduleId: deepDecision.moduleId,
              decision: deepDecision,
            };
          } catch (e: any) {
            return {
              handled: false,
              response: undefined,
              decision: {
                ...deepDecision,
                confidence: 'low',
                reasoning: `Module error: ${e.message}`,
              },
            };
          }
        }
      }
    }

    return {
      handled: false,
      decision: lightningDecision || undefined,
    };
  }
}

export const bifrost = new Bifrost();
