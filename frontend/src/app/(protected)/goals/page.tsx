'use client';

import dynamic from 'next/dynamic';

const Goals = dynamic(() => import('@/pages/Goals'), { ssr: false });

export default function GoalsPage() {
  return <Goals />;
}
