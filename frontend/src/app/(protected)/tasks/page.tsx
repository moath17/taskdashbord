'use client';

import dynamic from 'next/dynamic';

const Tasks = dynamic(() => import('@/views/Tasks'), { ssr: false });

export default function TasksPage() {
  return <Tasks />;
}
