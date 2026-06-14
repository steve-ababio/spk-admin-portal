export type ViewId = 'dashboard' | 'courses' | 'curriculum' | 'course-form' | 'instructors' | 'resources';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: string;
}
