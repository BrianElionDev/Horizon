export type IdeaStatus = 'NEW' | 'EXPLORING' | 'VALIDATED' | 'ARCHIVED' | 'DISMISSED'

export interface Idea {
  id: string
  name: string
  description: string | null
  status: IdeaStatus
  origin: string | null
  userId: string
  createdAt: string
  updatedAt: string
}
