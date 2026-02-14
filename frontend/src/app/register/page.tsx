import type { Metadata, Viewport } from 'next';
import RegisterForm from './RegisterForm';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Create Workspace - CareOps',
  description: 'Create a new CareOps workspace for your business',
  openGraph: {
    title: 'Create Workspace - CareOps',
    description: 'Start your 14-day free trial. No credit card required.',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}