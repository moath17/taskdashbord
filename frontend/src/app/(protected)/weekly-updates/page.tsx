'use client';

import dynamic from 'next/dynamic';

const WeeklyUpdates = dynamic(() => import('@/pages/WeeklyUpdates'), { ssr: false });

export default function WeeklyUpdatesPage() {
  return <WeeklyUpdates />;
}
