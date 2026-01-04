import { type UserRole } from '@/types';

export function getDashboardLink(role: UserRole | null | undefined) {
  const rolePaths: Record<string, string> = {
    default: '/vectix/dashboard',
    superuser: '/vectix/dashboard/admin',
    user: '/vectix/dashboard/user',
  };

  return role && rolePaths[role] ? rolePaths[role] : '/';
}
