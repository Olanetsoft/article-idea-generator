// Supabase Database Types
// Run `npx supabase gen types typescript` to regenerate after schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      short_urls: {
        Row: {
          id: string;
          user_id: string | null;
          code: string;
          original_url: string;
          title: string | null;
          created_at: string;
          expires_at: string | null;
          is_active: boolean;
          total_clicks: number;
          unique_clicks: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          code: string;
          original_url: string;
          title?: string | null;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
          total_clicks?: number;
          unique_clicks?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          code?: string;
          original_url?: string;
          title?: string | null;
          created_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
          total_clicks?: number;
          unique_clicks?: number;
        };
      };
      click_events: {
        Row: {
          id: string;
          short_url_id: string;
          timestamp: string;
          ip_hash: string | null;
          user_agent: string | null;
          fingerprint: string | null;
          country: string | null;
          country_name: string | null;
          city: string | null;
          region: string | null;
          device_type: string | null;
          browser: string | null;
          browser_version: string | null;
          os: string | null;
          os_version: string | null;
          referrer: string | null;
          referrer_domain: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          source_type: string | null;
        };
        Insert: {
          id?: string;
          short_url_id: string;
          timestamp?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          fingerprint?: string | null;
          country?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          device_type?: string | null;
          browser?: string | null;
          browser_version?: string | null;
          os?: string | null;
          os_version?: string | null;
          referrer?: string | null;
          referrer_domain?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          source_type?: string | null;
        };
        Update: {
          id?: string;
          short_url_id?: string;
          timestamp?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          fingerprint?: string | null;
          country?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          device_type?: string | null;
          browser?: string | null;
          browser_version?: string | null;
          os?: string | null;
          os_version?: string | null;
          referrer?: string | null;
          referrer_domain?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          source_type?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_click_count: {
        Args: {
          url_id: string;
          is_unique: boolean;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ShortUrl = Database["public"]["Tables"]["short_urls"]["Row"];
export type ClickEvent = Database["public"]["Tables"]["click_events"]["Row"];
export type InsertShortUrl =
  Database["public"]["Tables"]["short_urls"]["Insert"];
export type InsertClickEvent =
  Database["public"]["Tables"]["click_events"]["Insert"];
