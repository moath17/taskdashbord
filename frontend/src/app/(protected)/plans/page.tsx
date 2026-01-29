'use client';

import dynamic from 'next/dynamic';

const Plans = dynamic(() => import('@/pages/Plans'), { ssr: false });

export default function PlansPage() {
  return <Plans />;
}
