"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import CourseForm from '@/src/components/courses/CourseForm';
import { courseService } from '@/src/services/courseService';

function CourseFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const res = await courseService.findCourseById(id);
          if (res) {
            // Map backend difficulty and pricingModel to frontend values
            let difficulty = 'Beginner';
            if (res.difficulty === 'BEGINNER') difficulty = 'Beginner';
            else if (res.difficulty === 'INTERMEDIATE') difficulty = 'Intermediate';
            else if (res.difficulty === 'ADVANCED') difficulty = 'Advanced';

            let pricingModel = 'Fixed';
            if (res.pricingModel === 'FREE') pricingModel = 'Free';
            else if (res.pricingModel === 'PAID') pricingModel = 'Fixed'; // default to Fixed

            setInitialData({
              ...res,
              difficulty,
              pricingModel,
              skillsGained: res.skillsGained || [],
              expectedExperience: res.expectedExperience || []
            });
          }
        } catch (err) {
          console.error("Failed to fetch course:", err);
          alert("Failed to load course details.");
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  const handleSave = async (data: any) => {
    try {
      // Map frontend difficulty and pricingModel to backend values
      let difficulty = 'BEGINNER';
      if (data.difficulty === 'Beginner') difficulty = 'BEGINNER';
      else if (data.difficulty === 'Intermediate') difficulty = 'INTERMEDIATE';
      else if (data.difficulty === 'Advanced') difficulty = 'ADVANCED';

      let pricingModel = 'PAID';
      if (data.pricingModel === 'Free') pricingModel = 'FREE';

      const defaultThumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV8xReQkX3qL9qsYVEoSDsSB4G95Vwyr472ZqUO-1uBIbW0AxkCP6eIsxKPoUH0capZjM5Gp6lUUl1MqWdSrtMcJV0mUwfgi-Pk4qyAIvPyERSWBoVK5iqaX45-_gHcfrs9xK8MHVwldGiIZbx1ZC7f20MM7VrIkKJAwT851iBhV6SAFB4jbK0tgYdIGECbdrJQ5Ltgf-nob5zJeqc-t71A6Q9YhDkGeDuC8krSk8wpzY6_ufFXdyff9HgXXx3ENef1eW_cO6OyJ8a';

      // backend course creation expects specific body fields.
      // If we are editing, backend PATCH '/course/:id' expects: title, description, thumbnail, isPopular
      if (id) {
        const patchData = {
          title: data.title,
          description: data.description,
          thumbnail: (typeof data.thumbnail === 'string' && data.thumbnail) ? data.thumbnail : defaultThumbnail,
          isPopular: !!data.isPopular,
          skillsGained: data.skillsGained || [],
          expectedExperience: data.expectedExperience || [],
          instructorId: data.instructorId || null
        };
        await courseService.updateCourse(id, patchData);
      } else {
        const createData = {
          title: data.title,
          description: data.description,
          thumbnail: (typeof data.thumbnail === 'string' && data.thumbnail) ? data.thumbnail : defaultThumbnail,
          isPopular: !!data.isPopular,
          difficulty,
          pricingModel,
          price: Number(data.price) || 0,
          specialization: data.specialization || undefined,
          enrolledCount: Number(data.enrolledCount) || 0,
          approvalRate: Number(data.approvalRate) || 100,
          languages: data.languages || ['English'],
          skillsGained: data.skillsGained || [],
          expectedExperience: data.expectedExperience || [],
          instructorId: data.instructorId || null
        };
        await courseService.createCourse(createData);
      }
      router.push('/courses');
    } catch (err) {
      console.error("Failed to save course:", err);
      alert("Failed to save course. Make sure all fields are valid.");
    }
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading course form...
      </div>
    );
  }

  // If in edit mode, wait until initialData is loaded
  if (id && !initialData) {
    return (
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading course data...
      </div>
    );
  }

  return (
    <CourseForm 
      onCancel={handleCancel}
      onSave={handleSave}
      initialData={initialData}
    />
  );
}

export default function CourseFormPage() {
  return (
    <Suspense fallback={
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading...
      </div>
    }>
      <CourseFormContent />
    </Suspense>
  );
}
