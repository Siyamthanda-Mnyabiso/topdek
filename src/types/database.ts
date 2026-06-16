export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface User {
  id: string
  email: string
  role: string
  created_at: string
}

export interface ProviderProfile {
  id: string
  user_id: string
  business_name: string
  description: string | null
  location: string | null
  phone: string | null
  logo_url: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  provider_id: string
  title: string
  description: string | null
  price: number
  duration: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_id: string
  provider_id: string
  service_id: string
  status: BookingStatus
  created_at: string
  updated_at: string
}

export interface SavedProvider {
  id: string
  client_id: string
  provider_id: string
  created_at: string
}

export interface Review {
  id: string
  client_id: string
  provider_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Ticket {
  id: string
  user_id: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  subject: string
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  created_at: string
}

type DefaultSchema = {
  Enums: {
    booking_status: BookingStatus
    ticket_status: TicketStatus
    ticket_priority: TicketPriority
  }
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: {
          id: string
          email: string
          role: string
          created_at?: string
        }
        Update: {
          email?: string
          role?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: ProviderProfile
        Insert: {
          id?: string
          user_id: string
          business_name: string
          description?: string | null
          location?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          description?: string | null
          location?: string | null
          phone?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: Service
        Insert: {
          id?: string
          provider_id: string
          title: string
          description?: string | null
          price: number
          duration: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          price?: number
          duration?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: {
          id?: string
          client_id: string
          provider_id: string
          service_id: string
          status?: BookingStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: BookingStatus
          updated_at?: string
        }
        Relationships: []
      }
      saved_providers: {
        Row: SavedProvider
        Insert: {
          id?: string
          client_id: string
          provider_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      reviews: {
        Row: Review
        Insert: {
          id?: string
          client_id: string
          provider_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: Ticket
        Insert: {
          id?: string
          user_id: string
          status?: TicketStatus
          priority?: TicketPriority
          assigned_to?: string | null
          subject: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: TicketStatus
          priority?: TicketPriority
          assigned_to?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: TicketMessage
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          message: string
          created_at?: string
        }
        Update: {
          message?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: DefaultSchema['Enums']
    CompositeTypes: Record<string, never>
  }
}
