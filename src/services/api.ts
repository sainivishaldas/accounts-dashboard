import { supabase } from '@/lib/supabase';
import type {
  Property,
  PropertyInsert,
  PropertyUpdate,
  DbResident,
  ResidentInsert,
  ResidentUpdate,
  Disbursement,
  DisbursementInsert,
  Repayment,
  RepaymentInsert,
  RepaymentUpdate,
  DashboardStats,
  ResidentWithRelations,
  PaymentStatus,
} from '@/types/database';

// Logger utility
const log = {
  info: (method: string, message: string, data?: unknown) => {
    console.log(`[API:${method}] ${message}`, data !== undefined ? data : '');
  },
  error: (method: string, message: string, error: unknown) => {
    console.error(`[API:${method}] ERROR: ${message}`, error);
  },
  success: (method: string, message: string, data?: unknown) => {
    console.log(`[API:${method}] SUCCESS: ${message}`, data !== undefined ? data : '');
  },
};

// =============================================
// PROPERTIES API
// =============================================

export const propertiesApi = {
  async getAll(): Promise<Property[]> {
    log.info('propertiesApi.getAll', 'Fetching all properties...');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      log.error('propertiesApi.getAll', 'Failed to fetch properties', error);
      throw error;
    }
    log.success('propertiesApi.getAll', `Fetched ${data?.length || 0} properties`, data);
    return data || [];
  },

  async getById(id: string): Promise<Property | null> {
    log.info('propertiesApi.getById', `Fetching property ${id}`);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id);

    if (error) {
      log.error('propertiesApi.getById', `Failed to fetch property ${id}`, error);
      throw error;
    }
    log.success('propertiesApi.getById', `Found property`, data?.[0]);
    return data?.[0] || null;
  },

  async create(property: PropertyInsert): Promise<Property> {
    log.info('propertiesApi.create', 'Creating property', property);
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select();

    if (error) {
      log.error('propertiesApi.create', 'Failed to create property', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create property - no data returned');
    }
    
    log.success('propertiesApi.create', 'Created property', data[0]);
    return data[0];
  },

  async update(id: string, updates: PropertyUpdate): Promise<Property> {
    log.info('propertiesApi.update', `Updating property ${id}`, updates);
    
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      log.error('propertiesApi.update', `Failed to update property ${id}`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      log.error('propertiesApi.update', `No property found with id ${id}`, null);
      throw new Error(`Property not found: ${id}`);
    }
    
    log.success('propertiesApi.update', `Updated property ${id}`, data[0]);
    return data[0];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCities(): Promise<string[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('city')
      .order('city');

    if (error) throw error;
    const cities = [...new Set(data?.map(p => p.city) || [])];
    return cities;
  },
};

// =============================================
// RESIDENTS API
// =============================================

export const residentsApi = {
  async getAll(): Promise<ResidentWithRelations[]> {
    log.info('residentsApi.getAll', 'Fetching all residents with relations...');
    const { data, error } = await supabase
      .from('residents')
      .select(`
        *,
        property:properties(*),
        disbursements(*),
        repayments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      log.error('residentsApi.getAll', 'Failed to fetch residents', error);
      throw error;
    }
    log.success('residentsApi.getAll', `Fetched ${data?.length || 0} residents`, data);
    return (data || []) as ResidentWithRelations[];
  },

  async getById(id: string): Promise<ResidentWithRelations | null> {
    log.info('residentsApi.getById', `Fetching resident ${id}`);
    const { data, error } = await supabase
      .from('residents')
      .select(`
        *,
        property:properties(*),
        disbursements(*),
        repayments(*)
      `)
      .eq('id', id);

    if (error) {
      log.error('residentsApi.getById', `Failed to fetch resident ${id}`, error);
      throw error;
    }
    log.success('residentsApi.getById', `Found resident`, data?.[0]);
    return (data?.[0] as ResidentWithRelations) || null;
  },

  async create(resident: ResidentInsert): Promise<DbResident> {
    log.info('residentsApi.create', 'Creating resident', resident);
    const { data, error } = await supabase
      .from('residents')
      .insert(resident)
      .select();

    if (error) {
      log.error('residentsApi.create', 'Failed to create resident', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create resident - no data returned');
    }
    
    log.success('residentsApi.create', 'Created resident', data[0]);
    return data[0];
  },

  async update(id: string, updates: ResidentUpdate): Promise<DbResident> {
    log.info('residentsApi.update', `Updating resident ${id}`, updates);
    const { data, error } = await supabase
      .from('residents')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      log.error('residentsApi.update', `Failed to update resident ${id}`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Resident not found: ${id}`);
    }
    
    log.success('residentsApi.update', `Updated resident ${id}`, data[0]);
    return data[0];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =============================================
// DISBURSEMENTS API
// =============================================

export const disbursementsApi = {
  async getByResidentId(residentId: string): Promise<Disbursement[]> {
    log.info('disbursementsApi.getByResidentId', `Fetching disbursements for resident ${residentId}`);
    const { data, error } = await supabase
      .from('disbursements')
      .select('*')
      .eq('resident_id', residentId)
      .order('date', { ascending: false });

    if (error) {
      log.error('disbursementsApi.getByResidentId', `Failed to fetch disbursements`, error);
      throw error;
    }
    log.success('disbursementsApi.getByResidentId', `Fetched ${data?.length || 0} disbursements`);
    return data || [];
  },

  async create(disbursement: DisbursementInsert): Promise<Disbursement> {
    log.info('disbursementsApi.create', 'Creating disbursement', disbursement);
    const { data, error } = await supabase
      .from('disbursements')
      .insert(disbursement)
      .select();

    if (error) {
      log.error('disbursementsApi.create', 'Failed to create disbursement', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create disbursement - no data returned');
    }
    
    log.success('disbursementsApi.create', 'Created disbursement', data[0]);
    return data[0];
  },
};

// =============================================
// REPAYMENTS API
// =============================================

export const repaymentsApi = {
  async getByResidentId(residentId: string): Promise<Repayment[]> {
    log.info('repaymentsApi.getByResidentId', `Fetching repayments for resident ${residentId}`);
    const { data, error } = await supabase
      .from('repayments')
      .select('*')
      .eq('resident_id', residentId)
      .order('due_date', { ascending: false });

    if (error) {
      log.error('repaymentsApi.getByResidentId', 'Failed to fetch repayments', error);
      throw error;
    }
    log.success('repaymentsApi.getByResidentId', `Fetched ${data?.length || 0} repayments`);
    return data || [];
  },

  async create(repayment: RepaymentInsert): Promise<Repayment> {
    log.info('repaymentsApi.create', 'Creating repayment', repayment);
    const { data, error } = await supabase
      .from('repayments')
      .insert(repayment)
      .select();

    if (error) {
      log.error('repaymentsApi.create', 'Failed to create repayment', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create repayment - no data returned');
    }
    
    log.success('repaymentsApi.create', 'Created repayment', data[0]);
    return data[0];
  },

  async updateStatus(id: string, status: PaymentStatus, amountPaid?: number, actualPaymentDate?: string): Promise<Repayment> {
    log.info('repaymentsApi.updateStatus', `Updating repayment ${id} status to ${status}`);
    const { data, error } = await supabase
      .from('repayments')
      .update({
        status,
        amount_paid: amountPaid,
        actual_payment_date: actualPaymentDate,
      })
      .eq('id', id)
      .select();

    if (error) {
      log.error('repaymentsApi.updateStatus', `Failed to update repayment ${id}`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Repayment not found: ${id}`);
    }
    
    log.success('repaymentsApi.updateStatus', `Updated repayment ${id}`, data[0]);
    return data[0];
  },
};

// =============================================
// DASHBOARD STATS API
// =============================================

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    log.info('dashboardApi.getStats', 'Fetching dashboard statistics...');
    
    // Always calculate from residents directly (more reliable than view)
    try {
      const residents = await residentsApi.getAll();
      log.info('dashboardApi.getStats', `Calculating stats from ${residents.length} residents`);
      
      const totalDisbursed = residents.reduce((sum, r) => sum + Number(r.total_advance_disbursed || 0), 0);
      const totalCollected = residents.reduce((sum, r) => 
        sum + (r.repayments || [])
          .filter(p => p.status === 'paid' || p.status === 'advance')
          .reduce((s, p) => s + Number(p.amount_paid || 0), 0), 0
      );
      const totalOutstanding = residents.reduce((sum, r) => 
        sum + (r.repayments || [])
          .filter(p => p.status === 'pending' || p.status === 'failed')
          .reduce((s, p) => s + Number(p.rent_amount || 0), 0), 0
      );
      
      const overdueCount = residents.filter(r => r.repayment_status === 'overdue').length;
      const advanceCount = residents.filter(r => r.repayment_status === 'advance_paid').length;
      const today = new Date();
      const activeCount = residents.filter(r => r.lease_end_date && new Date(r.lease_end_date) >= today).length;
      
      const stats: DashboardStats = {
        total_disbursed: totalDisbursed,
        total_collected: totalCollected,
        total_outstanding: totalOutstanding,
        total_residents: residents.length,
        overdue_count: overdueCount,
        advance_count: advanceCount,
        on_time_count: residents.length - overdueCount - advanceCount,
        active_count: activeCount,
        inactive_count: residents.length - activeCount,
      };
      
      log.success('dashboardApi.getStats', 'Dashboard stats calculated', stats);
      return stats;
    } catch (error) {
      log.error('dashboardApi.getStats', 'Failed to calculate stats', error);
      // Return empty stats on error
      return {
        total_disbursed: 0,
        total_collected: 0,
        total_outstanding: 0,
        total_residents: 0,
        overdue_count: 0,
        advance_count: 0,
        on_time_count: 0,
        active_count: 0,
        inactive_count: 0,
      };
    }
  },

  async getCities(): Promise<string[]> {
    log.info('dashboardApi.getCities', 'Fetching cities...');
    const { data, error } = await supabase
      .from('properties')
      .select('city');

    if (error) {
      log.error('dashboardApi.getCities', 'Failed to fetch cities', error);
      return [];
    }
    const cities = [...new Set(data?.map(p => p.city) || [])];
    log.success('dashboardApi.getCities', `Fetched ${cities.length} cities`, cities);
    return cities;
  },

  async getPropertyNames(): Promise<string[]> {
    log.info('dashboardApi.getPropertyNames', 'Fetching property names...');
    const { data, error } = await supabase
      .from('properties')
      .select('name');

    if (error) {
      log.error('dashboardApi.getPropertyNames', 'Failed to fetch property names', error);
      return [];
    }
    const names = data?.map(p => p.name) || [];
    log.success('dashboardApi.getPropertyNames', `Fetched ${names.length} property names`, names);
    return names;
  },
};
