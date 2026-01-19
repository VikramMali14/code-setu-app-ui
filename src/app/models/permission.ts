export interface Permission {
  key: string;
  label: string;
}

export const PERMISSIONS: Permission[] = [
  { key: 'CREATE_USER', label: 'Create User' },
  { key: 'EDIT_USER', label: 'Edit User' },
  { key: 'DELETE_USER', label: 'Delete User' },
  { key: 'VIEW_REPORTS', label: 'View Reports' }
];
