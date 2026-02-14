import type { Metadata, Viewport } from 'next';
import InventoryClient from './InventoryClient';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Inventory - CareOps',
  description: 'Manage your inventory and stock levels',
};

export default function InventoryPage() {
  return <InventoryClient />;
}