import { redirect } from 'next/navigation'

export default function RolesRedirect() {
  redirect('/settings/members?tab=roles')
}
