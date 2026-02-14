import type { Metadata, Viewport } from 'next';
import FormsClient from './FormsClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Forms - CareOps',
  description: 'Create and manage customer forms',
};

export default function FormsPage() {
  return <FormsClient />;
}