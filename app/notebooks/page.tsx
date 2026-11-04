import { redirect } from 'next/navigation';
export default function NotebooksRoute() {
  redirect('/dashboard?tab=notebooks');
}
