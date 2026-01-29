'use client';

import dynamic from 'next/dynamic';

const Tasks = dynamic(() => import('@/pages/Tasks'), { ssr: false });

export default function TasksPage() {
  return <Tasks />;
}
