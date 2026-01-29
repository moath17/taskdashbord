'use client';

import dynamic from 'next/dynamic';

const UserManagement = dynamic(() => import('@/views/UserManagement'), { ssr: false });

export default function UsersPage() {
  return <UserManagement />;
}
