const currencyConfig: Record<string, { code: string; locale: string }> = {
  usd: { code: 'USD', locale: 'en-US' },
  eur: { code: 'EUR', locale: 'de-DE' },
  cop: { code: 'COP', locale: 'es-CO' }
};

export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
  const config = currencyConfig[currencyCode.toLowerCase()] ?? currencyConfig['usd'];
  const num = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code
  }).format(num);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
