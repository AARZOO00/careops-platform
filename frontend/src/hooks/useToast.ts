import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'loading' | 'info';

export function useToast() {
  const showToast = (type: ToastType, message: string) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'loading':
        toast.loading(message);
        break;
      case 'info':
        toast(message);
        break;
      default:
        toast(message);
    }
  };

  return { showToast };
}