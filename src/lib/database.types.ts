export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'technician' | 'receptionist' | 'customer'
          full_name: string
          rut: string | null
          phone: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'technician' | 'receptionist' | 'customer'
          full_name: string
          rut?: string | null
          phone?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'technician' | 'receptionist' | 'customer'
          full_name?: string
          rut?: string | null
          phone?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}