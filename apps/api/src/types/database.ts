import type { IdeaStatus } from '@horizon/shared'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: {
          id?: string
          email: string
          name?: string | null
          password_hash: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password_hash?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: SessionRow
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ideas: {
        Row: IdeaRow
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: IdeaStatus
          origin?: string | null
          user_id: string
          raw_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: IdeaStatus
          origin?: string | null
          user_id?: string
          raw_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      context_area_content: {
        Row: ContextAreaContentRow
        Insert: {
          id?: string
          idea_id: string
          area_key: string
          raw_content?: string
          sections?: unknown[]
          gaps?: unknown[]
          structured_at?: string | null
          completeness?: number
          updated_at?: string
        }
        Update: {
          raw_content?: string
          sections?: unknown[]
          gaps?: unknown[]
          structured_at?: string | null
          completeness?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_area_content_idea_id_fkey"
            columns: ["idea_id"]
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      idea_status: IdeaStatus
    }
    CompositeTypes: Record<never, never>
  }
}

export interface UserRow {
  id: string
  email: string
  name: string | null
  password_hash: string
  role: string
  created_at: string
  updated_at: string
}

export interface SessionRow {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface SessionWithUser extends SessionRow {
  users: UserRow
}

export interface IdeaRow {
  id: string
  name: string
  description: string | null
  status: IdeaStatus
  origin: string | null
  user_id: string
  last_analysis: string | null
  last_analysed_at: string | null
  raw_notes: string | null
  created_at: string
  updated_at: string
}

export interface ContextAreaContentRow {
  id: string
  idea_id: string
  area_key: string
  raw_content: string
  sections: unknown[]
  gaps: unknown[]
  structured_at: string | null
  completeness: number
  updated_at: string
}
