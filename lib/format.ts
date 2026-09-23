// lib/format.ts

// Format number (1000 → 1k, 1000000 → 1M)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

// Format price
export function formatPrice(price: number): string {
  return '$' + price.toFixed(2);
}

// Calculate discount
export function calculateDiscount(price: number, salePrice: number): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// Calculate save amount
export function calculateSaveAmount(price: number, salePrice: number): number {
  if (!salePrice || salePrice >= price) return 0;
  return price - salePrice;
}