import type { UserRole } from '@/types/database';

/**
 * Permission checks for role-based access control
 */

export const canCreateResident = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canEditResident = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canDeleteResident = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canCreateProperty = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canEditProperty = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canDeleteProperty = (role: UserRole | null): boolean => {
  return role === 'admin';
};

export const canViewData = (role: UserRole | null): boolean => {
  return role === 'admin' || role === 'viewer';
};

/**
 * Generic permission check for any admin action
 */
export const isAdmin = (role: UserRole | null): boolean => {
  return role === 'admin';
};

/**
 * Generic permission check for viewer role
 */
export const isViewer = (role: UserRole | null): boolean => {
  return role === 'viewer';
};
