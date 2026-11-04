import { redirect } from 'next/navigation';
export default function MeetingsRoute() {
  redirect('/dashboard?tab=rooms');
}
