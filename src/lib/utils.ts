import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function exportToWhatsApp(message: string, phoneNumber?: string) {
  const url = `https://wa.me/${phoneNumber || ''}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
