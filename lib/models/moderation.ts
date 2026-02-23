// Moderation and quality control models for DebateMe
// Used to track argument quality, fallacies, and rule violations during debates

export interface QualityFlag {
  type: string        // e.g. 'Ad Hominem', 'Strawman', 'Logical Fallacy'
  description: string // saved for post-debate summary, never shown during debate
}

export interface DebateMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  flags?: QualityFlag[] // travels with message into history for post-debate summary
}

export interface ModerationResult {
  verdict: 'pass' | 'warn' | 'block'
  violationType: string       // e.g. 'Hate Speech', 'Off-topic'
  feedback: string            // shown to user only on warn/block
  suggestedCorrection: string
  scoreImpact: number         // 0 for pass/block, -10 for warn
  qualityFlags: QualityFlag[] // silently recorded, never interrupts debate
}
