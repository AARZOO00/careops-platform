import type { Metadata, Viewport } from 'next';
import InboxClient from './InboxClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Inbox - CareOps',
  description: 'Unified communication hub for your business',
};

export default function InboxPage() {
  return <InboxClient />;
}