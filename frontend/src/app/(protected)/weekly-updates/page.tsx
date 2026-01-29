'use client';

import dynamic from 'next/dynamic';

const WeeklyUpdates = dynamic(() => import('@/views/WeeklyUpdates'), { ssr: false });

export default function WeeklyUpdatesPage() {
  return <WeeklyUpdates />;
}
