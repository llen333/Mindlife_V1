import { BifrostDecision, BifrostRouteResult } from './types';
import { detect } from './detector';
import { bus } from '@/lib/bus/orchestrator';
import { MessageContext } from '@/lib/bus/types';

export { type BifrostDecision, type BifrostRouteResult } from './types';

type BifrostContext = Partial<MessageContext> & {
  agentName?: string;
  role?: string;
  capabilities?: string[];
};

class Bifrost {
  async detectAndRoute(
    message: string,
    context: BifrostContext = {}
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
      const result = await this.executeModule(lightningDecision.moduleId, msgCtx, lightningDecision);
      if (result) return result;
    }

    // 2. Deep detection (1 LLM call for ambiguous queries)
    if (lightningDecision === null) {
      const deepDecision = await detect(message, 'deep', {
        agentName: context.agentName,
        role: context.role,
        capabilities: context.capabilities,
      });

      if (deepDecision && deepDecision.moduleId) {
        const result = await this.executeModule(deepDecision.moduleId, msgCtx, deepDecision);
        if (result) return result;
      }
    }

    return {
      handled: false,
      decision: lightningDecision || undefined,
    };
  }

  private async executeModule(
    moduleId: string,
    context: MessageContext,
    decision: BifrostDecision
  ): Promise<BifrostRouteResult | null> {
    const module = bus.getModule(moduleId);
    if (!module) return null;

    try {
      const result = await module.execute({
        ...context,
        intent: decision.intent,
      });
      return {
        handled: true,
        response: result.content,
        moduleId,
        decision,
      };
    } catch (e: any) {
      return {
        handled: false,
        response: undefined,
        decision: {
          ...decision,
          confidence: 'low' as const,
          reasoning: `Module error: ${e.message}`,
        },
      };
    }
  }
}

export const bifrost = new Bifrost();
