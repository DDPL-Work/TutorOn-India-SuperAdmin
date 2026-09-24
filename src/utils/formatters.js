/**
 * Format currency in Indian Rupee (INR)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format numbers with Indian commas
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format standard date (e.g. 23 Sep 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format timestamp (e.g. 23 Sep 2026, 03:45 PM)
 */
export function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format relative time (e.g. 5m ago, 2h ago)
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '-';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Convert numeric amount to Indian Rupee words (e.g. 14500 -> "Fourteen Thousand Five Hundred Rupees Only")
 */
export function numberToWordsINR(amount) {
  if (amount === undefined || amount === null) return 'Zero Rupees Only';
  
  // Extract clean number if string like '₹14,500' is passed
  let num = typeof amount === 'number' 
    ? amount 
    : parseFloat(String(amount).replace(/[^0-9.]/g, ''));

  if (isNaN(num) || num === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n === 0) return '';
    if (n < 20) return singleDigits[n] + ' ';
    return tensDigits[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '') + ' ';
  }

  function convertNumber(n) {
    if (n === 0) return '';
    if (n < 100) return convertTwoDigits(n);
    if (n < 1000) return singleDigits[Math.floor(n / 100)] + ' Hundred ' + convertNumber(n % 100);
    if (n < 100000) return convertNumber(Math.floor(n / 1000)) + 'Thousand ' + convertNumber(n % 1000);
    if (n < 10000000) return convertNumber(Math.floor(n / 100000)) + 'Lakh ' + convertNumber(n % 100000);
    return convertNumber(Math.floor(n / 10000000)) + 'Crore ' + convertNumber(n % 10000000);
  }

  const integerPart = Math.floor(num);
  const words = convertNumber(integerPart).trim().replace(/\s+/g, ' ');
  return words ? `Indian Rupees ${words} Only` : 'Zero Rupees Only';
}

