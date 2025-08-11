export function formatCurrency(value: number | undefined, locale: string = 'zh-CN'): string {
  if (value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(value: number | undefined, digits: number = 2, locale: string = 'zh-CN'): string {
  if (value === undefined || Number.isNaN(value)) return 'N/A';
  return (value * 100).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }) + '%';
}


