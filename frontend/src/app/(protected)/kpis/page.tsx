'use client';

import dynamic from 'next/dynamic';

const KPIs = dynamic(() => import('@/views/KPIs'), { ssr: false });

export default function KPIsPage() {
  return <KPIs />;
}
