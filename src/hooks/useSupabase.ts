import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi, residentsApi, dashboardApi, disbursementsApi, documentsApi, repaymentsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateResident, canEditResident, canDeleteResident, canCreateProperty, canEditProperty, canDeleteProperty } from '@/lib/permissions';
import type { PropertyInsert, PropertyUpdate, ResidentInsert, ResidentUpdate, DisbursementInsert, DisbursementUpdate, RepaymentInsert, RepaymentUpdate, DocumentInsert } from '@/types/database';
import { toast } from 'sonner';

// =============================================
// DASHBOARD HOOKS
// =============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const data = await dashboardApi.getStats();
        console.log('Dashboard stats:', data);
        return data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
      }
    },
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => dashboardApi.getCities(),
  });
}

export function usePropertyNames() {
  return useQuery({
    queryKey: ['property-names'],
    queryFn: () => dashboardApi.getPropertyNames(),
  });
}

// =============================================
// RESIDENTS HOOKS
// =============================================

export function useResidents() {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      try {
        const data = await residentsApi.getAll();
        console.log('Residents data:', data);
        return data;
      } catch (error) {
        console.error('Error fetching residents:', error);
        throw error;
      }
    },
  });
}

export function useResident(id: string) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: () => residentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateResident() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (resident: ResidentInsert) => {
      if (!canCreateResident(userRole)) {
        throw new Error('You do not have permission to create cases');
      }
      return residentsApi.create(resident);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Case created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create case', { description: error.message });
    },
  });
}

export function useUpdateResident() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ResidentUpdate }) => {
      if (!canEditResident(userRole)) {
        throw new Error('You do not have permission to edit cases');
      }
      return residentsApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Resident updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update resident', { description: error.message });
    },
  });
}

export function useDeleteResident() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!canDeleteResident(userRole)) {
        throw new Error('You do not have permission to delete cases');
      }
      return residentsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Resident deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete resident', { description: error.message });
    },
  });
}

// =============================================
// PROPERTIES HOOKS
// =============================================

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (property: PropertyInsert) => {
      if (!canCreateProperty(userRole)) {
        throw new Error('You do not have permission to create properties');
      }
      return propertiesApi.create(property);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['property-names'] });
      toast.success('Property created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create property', { description: error.message });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PropertyUpdate }) => {
      if (!canEditProperty(userRole)) {
        throw new Error('You do not have permission to edit properties');
      }
      return propertiesApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['property-names'] });
      toast.success('Property updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update property', { description: error.message });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!canDeleteProperty(userRole)) {
        throw new Error('You do not have permission to delete properties');
      }
      return propertiesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['property-names'] });
      toast.success('Property deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete property', { description: error.message });
    },
  });
}

// =============================================
// DISBURSEMENTS HOOKS
// =============================================

export function useCreateDisbursement() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (disbursement: DisbursementInsert) => {
      if (!canCreateResident(userRole)) {
        throw new Error('You do not have permission to create disbursements');
      }
      return disbursementsApi.create(disbursement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add transaction', { description: error.message });
    },
  });
}

export function useUpdateDisbursement() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DisbursementInsert> }) => {
      if (!canEditResident(userRole)) {
        throw new Error('You do not have permission to edit disbursements');
      }
      return disbursementsApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update transaction', { description: error.message });
    },
  });
}

export function useDeleteDisbursement() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!canDeleteResident(userRole)) {
        throw new Error('You do not have permission to delete disbursements');
      }
      return disbursementsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete transaction', { description: error.message });
    },
  });
}

// =============================================
// REPAYMENTS HOOKS
// =============================================

export function useCreateRepayment() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (repayment: RepaymentInsert) => {
      if (!canCreateResident(userRole)) {
        throw new Error('You do not have permission to create repayments');
      }
      return repaymentsApi.create(repayment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Repayment added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add repayment', { description: error.message });
    },
  });
}

export function useUpdateRepayment() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RepaymentInsert> }) => {
      if (!canEditResident(userRole)) {
        throw new Error('You do not have permission to edit repayments');
      }
      return repaymentsApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Repayment updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update repayment', { description: error.message });
    },
  });
}

export function useDeleteRepayment() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!canDeleteResident(userRole)) {
        throw new Error('You do not have permission to delete repayments');
      }
      return repaymentsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Repayment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete repayment', { description: error.message });
    },
  });
}

// =============================================
// DOCUMENTS HOOKS
// =============================================

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ file, residentId }: { file: File; residentId: string }) => {
      if (!canCreateResident(userRole)) {
        throw new Error('You do not have permission to upload documents');
      }

      // Upload file to storage
      const fileUrl = await documentsApi.uploadFile(file, residentId);

      // Create document record
      const documentData: DocumentInsert = {
        resident_id: residentId,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        document_type: 'other',
      };

      return documentsApi.create(documentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload document', { description: error.message });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { userRole } = useAuth();

  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string; fileUrl: string }) => {
      if (!canCreateResident(userRole)) {
        throw new Error('You do not have permission to delete documents');
      }
      return documentsApi.delete(id, fileUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete document', { description: error.message });
    },
  });
}
