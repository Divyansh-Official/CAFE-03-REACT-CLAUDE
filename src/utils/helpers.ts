// formatCurrency.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// formatDate.ts
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const timeAgo = (dateString: string): string => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// generateOrderId.ts
export const generateOrderId = (): string => {
  const prefix = 'BB';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// debounce
export const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Slug helpers
export const toSlug = (str: string): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export const fromSlug = (slug: string): string =>
  slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Calculate discounted price
export const applyDiscount = (price: number, offerType: string, value: number): number => {
  if (offerType === 'percentage') return Math.round(price * (1 - value / 100));
  if (offerType === 'flat') return Math.max(0, price - value);
  return price;
};

// GST calculation
export const calculateGST = (subtotal: number, rate = 5): number =>
  Math.round(subtotal * (rate / 100));

// Initials from name
export const getInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
