import { notFound } from 'next/navigation';

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function FriendDetailPage() {
  notFound();
}
