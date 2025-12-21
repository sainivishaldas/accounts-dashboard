export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'advance';
export type DisbursementStatus = 'fully_disbursed' | 'partial';
export type RepaymentStatus = 'on_time' | 'overdue' | 'advance_paid';
export type CurrentStatus = 'active' | 'move_out' | 'early_move_out' | 'extended';
export type PropertyStatus = 'active' | 'inactive';
export type DisbursementType = '1st Tranche' | '2nd Tranche' | 'Final';
export type PaymentMode = 'Manual' | 'NACH';
export type UserRole = 'admin' | 'viewer';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          address: string;
          city: string;
          number_of_units: number;
          property_manager_name: string | null;
          property_manager_number: string | null;
          status: PropertyStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          address: string;
          city: string;
          number_of_units?: number;
          property_manager_name?: string | null;
          property_manager_number?: string | null;
          status?: PropertyStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          address?: string;
          city?: string;
          number_of_units?: number;
          property_manager_name?: string | null;
          property_manager_number?: string | null;
          status?: PropertyStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      residents: {
        Row: {
          id: string;
          resident_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          property_id: string | null;
          room_number: string | null;
          relationship_manager: string | null;
          rm_contact: string | null;
          lease_start_date: string | null;
          lease_end_date: string | null;
          lock_in_period: number;
          monthly_rent: number;
          security_deposit: number;
          total_advance_disbursed: number;
          disbursement_status: DisbursementStatus;
          repayment_status: RepaymentStatus;
          current_status: CurrentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          property_id?: string | null;
          room_number?: string | null;
          relationship_manager?: string | null;
          rm_contact?: string | null;
          lease_start_date?: string | null;
          lease_end_date?: string | null;
          lock_in_period?: number;
          monthly_rent?: number;
          security_deposit?: number;
          total_advance_disbursed?: number;
          disbursement_status?: DisbursementStatus;
          repayment_status?: RepaymentStatus;
          current_status?: CurrentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resident_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          property_id?: string | null;
          room_number?: string | null;
          relationship_manager?: string | null;
          rm_contact?: string | null;
          lease_start_date?: string | null;
          lease_end_date?: string | null;
          lock_in_period?: number;
          monthly_rent?: number;
          security_deposit?: number;
          total_advance_disbursed?: number;
          disbursement_status?: DisbursementStatus;
          repayment_status?: RepaymentStatus;
          current_status?: CurrentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      disbursements: {
        Row: {
          id: string;
          disbursement_id: string;
          resident_id: string | null;
          date: string;
          amount: number;
          utr_number: string | null;
          type: DisbursementType;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          disbursement_id: string;
          resident_id?: string | null;
          date: string;
          amount: number;
          utr_number?: string | null;
          type: DisbursementType;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          disbursement_id?: string;
          resident_id?: string | null;
          date?: string;
          amount?: number;
          utr_number?: string | null;
          type?: DisbursementType;
          created_at?: string;
          updated_at?: string;
        };
      };
      repayments: {
        Row: {
          id: string;
          repayment_id: string;
          resident_id: string | null;
          month: string;
          due_date: string;
          rent_amount: number;
          payment_mode: PaymentMode;
          status: PaymentStatus;
          actual_payment_date: string | null;
          amount_paid: number;
          is_advance: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          repayment_id: string;
          resident_id?: string | null;
          month: string;
          due_date: string;
          rent_amount: number;
          payment_mode?: PaymentMode;
          status?: PaymentStatus;
          actual_payment_date?: string | null;
          amount_paid?: number;
          is_advance?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          repayment_id?: string;
          resident_id?: string | null;
          month?: string;
          due_date?: string;
          rent_amount?: number;
          payment_mode?: PaymentMode;
          status?: PaymentStatus;
          actual_payment_date?: string | null;
          amount_paid?: number;
          is_advance?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_disbursed: number;
          total_collected: number;
          total_outstanding: number;
          total_residents: number;
          overdue_count: number;
          advance_count: number;
          on_time_count: number;
          active_count: number;
          inactive_count: number;
        };
      };
    };
  };
}

// Convenience types
export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type DbResident = Database['public']['Tables']['residents']['Row'];
export type ResidentInsert = Database['public']['Tables']['residents']['Insert'];
export type ResidentUpdate = Database['public']['Tables']['residents']['Update'];

export type Disbursement = Database['public']['Tables']['disbursements']['Row'];
export type DisbursementInsert = Database['public']['Tables']['disbursements']['Insert'];
export type DisbursementUpdate = Database['public']['Tables']['disbursements']['Update'];

export type Repayment = Database['public']['Tables']['repayments']['Row'];
export type RepaymentInsert = Database['public']['Tables']['repayments']['Insert'];
export type RepaymentUpdate = Database['public']['Tables']['repayments']['Update'];

export type DashboardStats = Database['public']['Views']['dashboard_stats']['Row'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// Extended resident type with relations
export interface ResidentWithRelations extends DbResident {
  property?: Property | null;
  disbursements: Disbursement[];
  repayments: Repayment[];
}
