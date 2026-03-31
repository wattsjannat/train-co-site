'use client';

import dynamic from 'next/dynamic';

// Dynamically import Trainco App to avoid SSR issues
const TraincoApp = dynamic(() => import('@/App'), { ssr: false });

export default function Home() {
  return <TraincoApp />;
}
