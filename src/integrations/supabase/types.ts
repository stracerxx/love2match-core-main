export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          full_name: string | null
          bio: string | null
          role: 'member' | 'admin' | 'moderator'
          photos: string[] | null
          tags: string[] | null
          demographics: Json | null
          love_balance: number
          love2_balance: number
          is_suspended: boolean
          is_online: boolean
          membership_tier: 'standard' | 'plus' | 'premium'
          membership_expires_at: string | null
          daily_likes_used: number
          last_like_date: string | null
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          full_name?: string | null
          bio?: string | null
          role?: 'member' | 'admin' | 'moderator'
          photos?: string[] | null
          tags?: string[] | null
          demographics?: Json | null
          love_balance?: number
          love2_balance?: number
          is_suspended?: boolean
          is_online?: boolean
          membership_tier?: 'standard' | 'plus' | 'premium'
          membership_expires_at?: string | null
          daily_likes_used?: number
          last_like_date?: string | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          full_name?: string | null
          bio?: string | null
          role?: 'member' | 'admin' | 'moderator'
          photos?: string[] | null
          tags?: string[] | null
          demographics?: Json | null
          love_balance?: number
          love2_balance?: number
          is_suspended?: boolean
          is_online?: boolean
          membership_tier?: 'standard' | 'plus' | 'premium'
          membership_expires_at?: string | null
          daily_likes_used?: number
          last_like_date?: string | null
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: number
          auth_user_id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          love_token_balance: number
          love2_token_balance: number
          membership_tier: string | null
          membership_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          auth_user_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          love_token_balance?: number
          love2_token_balance?: number
          membership_tier?: string | null
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          auth_user_id?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          love_token_balance?: number
          love2_token_balance?: number
          membership_tier?: string | null
          membership_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          value: string
          description: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          description?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string | null
          type: 'earn' | 'spend' | 'adjust' | 'swap' | 'gift' | 'purchase' | 'referral' | 'creator_earnings' | 'faucet'
          token_type: 'LOVE' | 'LOVE2'
          amount: number
          balance_before: number | null
          balance_after: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'earn' | 'spend' | 'adjust' | 'swap' | 'gift' | 'purchase' | 'referral' | 'creator_earnings' | 'faucet'
          token_type: 'LOVE' | 'LOVE2'
          amount: number
          balance_before?: number | null
          balance_after?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: 'earn' | 'spend' | 'adjust' | 'swap' | 'gift' | 'purchase' | 'referral' | 'creator_earnings' | 'faucet'
          token_type?: 'LOVE' | 'LOVE2'
          amount?: number
          balance_before?: number | null
          balance_after?: number | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      swap_requests: {
        Row: {
          id: string
          user_id: string | null
          from_token_type: string
          to_token_type: string
          amount: number
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          from_token_type: string
          to_token_type: string
          amount: number
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          from_token_type?: string
          to_token_type?: string
          amount?: number
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          user_id: string | null
          target_user_id: string | null
          status: 'like' | 'pass'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          target_user_id?: string | null
          status: 'like' | 'pass'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          target_user_id?: string | null
          status?: 'like' | 'pass'
          created_at?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          id: string
          initial_fee_paid: boolean
          escrow_amount: number
          escrow_sender_id: string | null
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          initial_fee_paid?: boolean
          escrow_amount?: number
          escrow_sender_id?: string | null
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          initial_fee_paid?: boolean
          escrow_amount?: number
          escrow_sender_id?: string | null
          last_message_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      thread_participants: {
        Row: {
          id: string
          thread_id: string | null
          user_id: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          user_id?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          user_id?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          thread_id: string | null
          sender_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          sender_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          sender_id?: string | null
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system'
          title: string
          body: string
          action_url: string | null
          related_user_id: string | null
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          read_at: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system'
          title: string
          body: string
          action_url?: string | null
          related_user_id?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          read_at?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system'
          title?: string
          body?: string
          action_url?: string | null
          related_user_id?: string | null
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          read_at?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          icon: string
          image_url: string | null
          price_love: number
          redemption_value: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          icon: string
          image_url?: string | null
          price_love: number
          redemption_value: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          icon?: string
          image_url?: string | null
          price_love?: number
          redemption_value?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      gift_transactions: {
        Row: {
          id: string
          gift_id: string
          sender_id: string
          receiver_id: string
          message: string | null
          tokens_spent: number
          tokens_redeemed: number | null
          is_redeemed: boolean
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          gift_id: string
          sender_id: string
          receiver_id: string
          message?: string | null
          tokens_spent: number
          tokens_redeemed?: number | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          gift_id?: string
          sender_id?: string
          receiver_id?: string
          message?: string | null
          tokens_spent?: number
          tokens_redeemed?: number | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      faucet_claims: {
        Row: {
          id: string
          user_id: string
          amount: number
          claimed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          claimed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          claimed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_thread: {
        Args: {
          other_user_id: string
        }
        Returns: string
      }
      list_threads: {
        Args: Record<string, never>
        Returns: {
          thread_id: string
          partner_id: string
          partner_email: string
          partner_display_name: string
          last_message_at: string | null
        }[]
      }
      list_messages: {
        Args: {
          p_thread_id: string
        }
        Returns: {
          id: string
          thread_id: string
          sender_id: string
          content: string
          created_at: string
        }[]
      }
      escrow_v13_final: {
        Args: {
          p_tid: string
          p_sid: string
          p_content: string
        }
        Returns: string
      }
      get_admin_users: {
        Args: Record<string, never>
        Returns: {
          id: string
          auth_user_id: string
          email: string
          role: string
          full_name: string
          created_at: string
          last_sign_in_at: string
          love_balance: number
          love2_balance: number
          membership_tier: string
          membership_expires_at: string | null
        }[]
      }
      get_mutual_matches: {
        Args: Record<string, never>
        Returns: {
          id: string
          email: string
          display_name: string
          full_name: string
          photos: string[]
          bio: string
        }[]
      }
      increment_likes: {
        Args: {
          user_id_param: string
        }
        Returns: void
      }
      claim_daily_faucet: {
        Args: Record<string, never>
        Returns: Json
      }
    }
    Enums: {
      user_role: 'member' | 'admin' | 'moderator'
      membership_tier: 'standard' | 'plus' | 'premium'
      transaction_type: 'earn' | 'spend' | 'adjust' | 'swap' | 'gift' | 'purchase' | 'referral' | 'creator_earnings' | 'faucet'
      token_type: 'LOVE' | 'LOVE2'
      like_status: 'like' | 'pass'
      swap_status: 'pending' | 'approved' | 'rejected'
      notification_type: 'message' | 'match' | 'event_reminder' | 'event_rsvp' | 'like' | 'gift' | 'token' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      user_role: ['member', 'admin', 'moderator'] as const,
      membership_tier: ['standard', 'plus', 'premium'] as const,
      transaction_type: ['earn', 'spend', 'adjust', 'swap', 'gift', 'purchase', 'referral', 'creator_earnings', 'faucet'] as const,
      token_type: ['LOVE', 'LOVE2'] as const,
      like_status: ['like', 'pass'] as const,
      swap_status: ['pending', 'approved', 'rejected'] as const,
      notification_type: ['message', 'match', 'event_reminder', 'event_rsvp', 'like', 'gift', 'token', 'system'] as const,
    },
  },
} as const
