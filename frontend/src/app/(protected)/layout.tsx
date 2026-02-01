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

  // Owner: redirect to /owner and show OwnerScreen only (no full nav)
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'owner') {
      if (pathname !== '/owner') {
        router.replace('/owner');
      }
    }
  }, [loading, isAuthenticated, user?.role, pathname, router]);

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

  // Owner gets OwnerScreen (rendered by /owner page) - no Layout wrapper
  if (user?.role === 'owner') {
    return <>{children}</>;
  }

  return <Layout>{children}</Layout>;
}
