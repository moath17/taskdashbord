'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Owner without ownerAlsoAdmin: redirect to /owner only (no dashboard access)
  // Owner with ownerAlsoAdmin: can access both /owner and /dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'owner' && !user?.ownerAlsoAdmin) {
      if (pathname !== '/owner') {
        router.replace('/owner');
      }
    }
  }, [loading, isAuthenticated, user?.role, user?.ownerAlsoAdmin, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Owner without ownerAlsoAdmin: no Layout wrapper (OwnerScreen only)
  // Owner with ownerAlsoAdmin: gets full Layout with dashboard access
  if (user?.role === 'owner' && !user?.ownerAlsoAdmin) {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
