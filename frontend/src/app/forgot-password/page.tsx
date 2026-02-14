import type { Metadata, Viewport } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Forgot Password - CareOps',
  description: 'Reset your CareOps account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}