import type { IdeaStatus } from '../types/idea'

export const IDEA_STATUSES: Record<
  IdeaStatus,
  { label: string; color: string }
> = {
  NEW: { label: 'New', color: 'status-new' },
  EXPLORING: { label: 'Exploring', color: 'status-exploring' },
  VALIDATED: { label: 'Validated', color: 'status-validated' },
  ARCHIVED: { label: 'Archived', color: 'status-archived' },
  DISMISSED: { label: 'Dismissed', color: 'status-dismissed' },
} as const
