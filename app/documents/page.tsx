import { redirect } from 'next/navigation';
export default function DocumentsRoute() {
  redirect('/dashboard?tab=analyzer');
}
