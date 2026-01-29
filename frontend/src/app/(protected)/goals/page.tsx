'use client';

import dynamic from 'next/dynamic';

const Goals = dynamic(() => import('@/views/Goals'), { ssr: false });

export default function GoalsPage() {
  return <Goals />;
}
