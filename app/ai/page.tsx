import { redirect } from 'next/navigation';
export default function AiRoute() {
  redirect('/dashboard?tab=rag');
}
