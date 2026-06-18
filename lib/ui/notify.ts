import { toast } from '@/hooks/use-toast';

type NotifyOptions = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function notifySuccess(title: string, description?: string) {
  toast({ title, description });
}

export function notifyError(title: string, description?: string) {
  toast({ title, description, variant: 'destructive' });
}

export function notify({ title, description, variant = 'default' }: NotifyOptions) {
  toast({ title, description, variant });
}
