
import React from 'react';
import type { Breakdown } from '../types';
import { formatCurrency } from '../utils/format';

interface BreakdownCardProps {
  title: string;
  data: Breakdown & { total: number; tax?: number };
  isEmployer?: boolean;
}

// 使用全局格式化工具

const BreakdownCard: React.FC<BreakdownCardProps> = ({ title, data, isEmployer = false }) => {
  const items = [
    { label: '养老保险', value: data.pension },
    { label: '医疗保险', value: data.medical },
    { label: '失业保险', value: data.unemployment },
    { label: '住房公积金', value: data.housingFund },
  ];

  if (isEmployer && data.workInjury !== undefined) {
    items.push({ label: '工伤保险', value: data.workInjury });
  }
  
  if (!isEmployer && data.tax !== undefined) {
    items.push({ label: '个人所得税', value: data.tax });
  }

  return (
    <div className="glass-card p-6 h-full hover-lift">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-white/20 pb-2">{title}</h3>
      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-mono font-medium text-slate-700 tabular-nums">¥ {formatCurrency(item.value)}</span>
          </div>
        ))}
        <div className="border-t pt-3 mt-3 flex justify-between items-center font-bold">
          <span className="text-slate-800">合计</span>
          <span className="text-emerald-600 font-mono text-base tabular-nums">¥ {formatCurrency(data.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default BreakdownCard;
