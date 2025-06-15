import { useAuth } from './useAuth';

type UserRole = 'DEVELOPER' | 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'TECHNICIAN' | 'VIEWER';

interface Permissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canManageUsers: boolean;
  canApproveTests: boolean;
  canExportReports: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  DEVELOPER: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canManageUsers: true,
    canApproveTests: true,
    canExportReports: true,
  },
  ADMIN: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canManageUsers: true,
    canApproveTests: true,
    canExportReports: true,
  },
  MANAGER: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canManageUsers: true,
    canApproveTests: true,
    canExportReports: true,
  },
  SUPERVISOR: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canManageUsers: false,
    canApproveTests: true,
    canExportReports: true,
  },
  TECHNICIAN: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canManageUsers: false,
    canApproveTests: false,
    canExportReports: false,
  },
  VIEWER: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canManageUsers: false,
    canApproveTests: false,
    canExportReports: false,
  },
};

export function usePermissions() {
  const { userProfile } = useAuth();
  
  const userRole = (userProfile?.role || 'VIEWER') as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole];



  return {
    ...permissions,
    userRole,
    isDeveloper: userRole === 'DEVELOPER',
    isAdmin: userRole === 'ADMIN',
    isManager: userRole === 'MANAGER',
    isSupervisor: userRole === 'SUPERVISOR',
    isTechnician: userRole === 'TECHNICIAN',
    isViewer: userRole === 'VIEWER',
  };
}