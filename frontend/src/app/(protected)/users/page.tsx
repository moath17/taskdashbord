'use client';

import dynamic from 'next/dynamic';

const UserManagement = dynamic(() => import('@/pages/UserManagement'), { ssr: false });

export default function UsersPage() {
  return <UserManagement />;
}
