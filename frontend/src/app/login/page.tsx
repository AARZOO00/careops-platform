import type { Metadata, Viewport } from 'next';
import LoginForm from './loginForm';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Sign In - CareOps',
  description: 'Sign in to your CareOps workspace',
  openGraph: {
    title: 'Sign In - CareOps',
    description: 'Access your unified operations platform',
    type: 'website',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}