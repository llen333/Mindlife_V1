export type BifrostConfidence = 'high' | 'medium' | 'low';

export interface BifrostDecision {
  intent: string;
  moduleId: string | null;
  confidence: BifrostConfidence;
  reasoning?: string;
}

export interface BifrostRouteResult {
  handled: boolean;
  response?: string;
  moduleId?: string;
  decision?: BifrostDecision;
}

export type DetectionMode = 'lightning' | 'deep';
