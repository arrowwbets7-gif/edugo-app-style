export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          attachment_url: string | null
          content: string | null
          grade: number | null
          id: string
          student_id: string
          submitted_at: string
          teacher_feedback: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachment_url?: string | null
          content?: string | null
          grade?: number | null
          id?: string
          student_id: string
          submitted_at?: string
          teacher_feedback?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachment_url?: string | null
          content?: string | null
          grade?: number | null
          id?: string
          student_id?: string
          submitted_at?: string
          teacher_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_url: string | null
          class_filter: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          class_filter?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          class_filter?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          joined_at: string
          stream_id: string
          student_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          stream_id: string
          student_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          stream_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_chat_messages: {
        Row: {
          created_at: string
          id: string
          is_pinned: boolean
          message: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_pinned?: boolean
          message: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_pinned?: boolean
          message?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          class_filter: string | null
          created_at: string
          id: string
          scheduled_at: string | null
          started_by: string
          status: string
          subject: string | null
          title: string
          updated_at: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          class_filter?: string | null
          created_at?: string
          id?: string
          scheduled_at?: string | null
          started_by: string
          status?: string
          subject?: string | null
          title: string
          updated_at?: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          class_filter?: string | null
          created_at?: string
          id?: string
          scheduled_at?: string | null
          started_by?: string
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          poll_id: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          poll_id: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          poll_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          post_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          post_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          post_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          author_id: string
          class_filter: string | null
          content: string
          created_at: string
          id: string
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          author_id: string
          class_filter?: string | null
          content?: string
          created_at?: string
          id?: string
          subject?: string | null
          title: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          author_id?: string
          class_filter?: string | null
          content?: string
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_verified: boolean
          updated_at: string
          user_id: string
          verification_code: string
        }
        Insert: {
          class?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id: string
          verification_code?: string
        }
        Update: {
          class?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean
          updated_at?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          id: string
          quiz_id: string
          score: number
          student_id: string
          submitted_at: string
          total_marks: number
        }
        Insert: {
          answers?: Json | null
          id?: string
          quiz_id: string
          score?: number
          student_id: string
          submitted_at?: string
          total_marks?: number
        }
        Update: {
          answers?: Json | null
          id?: string
          quiz_id?: string
          score?: number
          student_id?: string
          submitted_at?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_option: string
          created_at: string
          id: string
          marks: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          correct_option: string
          created_at?: string
          id?: string
          marks?: number
          option_a: string
          option_b: string
          option_c?: string
          option_d?: string
          question_text: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          correct_option?: string
          created_at?: string
          id?: string
          marks?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          class_filter: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          subject: string | null
          time_limit_minutes: number | null
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          class_filter?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          subject?: string | null
          time_limit_minutes?: number | null
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          class_filter?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          subject?: string | null
          time_limit_minutes?: number | null
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          avatar_reward: string | null
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_reward?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_reward?: string | null
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          subject: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          subject?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          subject?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      post_type: "announcement" | "discussion" | "note"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student"],
      post_type: ["announcement", "discussion", "note"],
    },
  },
} as const
