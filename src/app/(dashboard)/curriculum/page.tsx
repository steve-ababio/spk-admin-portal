"use client";

import { Suspense } from 'react';
import CurriculumBuilder from '@/src/components/curriculum/CurriculumBuilder';

export default function CurriculumPage() {
  return (
    <Suspense fallback={
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading curriculum builder...
      </div>
    }>
      <CurriculumBuilder />
    </Suspense>
  );
}
