import type { Metadata, Viewport } from 'next';
import BookingsClient from './BookingsClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Bookings - CareOps',
  description: 'Manage your appointments and bookings',
};

export default function BookingsPage() {
  return <BookingsClient />;
}