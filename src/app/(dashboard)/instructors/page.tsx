import { Suspense } from 'react';
import Instructors from '@/src/components/instructors/Instructors';

export default function InstructorsPage() {
  return (
    <Suspense fallback={
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading...
      </div>
    }>
      <Instructors />
    </Suspense>
  );
}
