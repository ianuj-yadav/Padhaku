import { redirect } from 'next/navigation';
export default function QuizzesRoute() {
  redirect('/dashboard?tab=quizzes');
}
