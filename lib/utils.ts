// lib/utils.ts

// Format price to currency
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

// Calculate commission
export function calculateCommission(
  price: number,
  commissionRate: number
): {
  totalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  vendorAmount: number;
} {
  const commissionAmount = (price * commissionRate) / 100;
  const vendorAmount = price - commissionAmount;
  
  return {
    totalPrice: price,
    commissionRate,
    commissionAmount: Math.round(commissionAmount * 100) / 100,
    vendorAmount: Math.round(vendorAmount * 100) / 100,
  };
}

// Generate slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

// Generate random string
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}