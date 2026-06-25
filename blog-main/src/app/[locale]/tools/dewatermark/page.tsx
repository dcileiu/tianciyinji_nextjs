import { redirect } from 'next/navigation';
import { dewatermarkToolUrl } from '@/lib/site-config';

export default function DewatermarkRedirectPage() {
  redirect(dewatermarkToolUrl);
}
