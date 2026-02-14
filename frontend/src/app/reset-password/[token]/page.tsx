import type { Metadata, Viewport } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Reset Password - CareOps',
  description: 'Create a new password for your CareOps account',
};

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordClient token={params.token} />;
}