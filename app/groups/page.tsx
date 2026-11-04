import { redirect } from 'next/navigation';
export default function GroupsRoute() {
  redirect('/dashboard?tab=chat');
}
