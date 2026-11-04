import { redirect } from 'next/navigation';
export default function PlannerRoute() {
  redirect('/dashboard?tab=quizzes');
}
