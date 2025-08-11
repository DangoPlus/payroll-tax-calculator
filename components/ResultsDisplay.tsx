
import React from 'react';
import type { SalaryDetails } from '../types';
import BreakdownCard from './BreakdownCard';
import { formatCurrency, formatPercent } from '../utils/format';

interface ResultsDisplayProps {
  results: SalaryDetails | null;
}

const ResultCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="glass-card p-6 text-center flex flex-col justify-center hover-lift">
    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
    <p className={`mt-1 text-3xl font-extrabold font-mono tabular-nums tracking-tight ${color}`}>
      <span className="text-2xl">¥</span>{formatCurrency(value)}
    </p>
  </div>
);


const RateChip: React.FC<{ label: string; amount: number; base: number }> = ({ label, amount, base }) => {
  const active = amount > 0 && base > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-400 border-slate-200'
      }`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">
        {formatPercent(amount / (base || 1), 2)}
      </span>
    </span>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) {
    return (
        <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h3m-3-10h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h.01M15 17h.01M5 7h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-800">等待计算</h3>
            <p className="mt-1 text-sm text-slate-500">请输入薪资信息并点击“开始计算”以查看结果。</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ResultCard title="税前月薪" value={results.preTaxSalary} color="text-blue-600" />
        <ResultCard title="税后月薪" value={results.postTaxSalary} color="text-green-600" />
        <ResultCard title="企业总成本" value={results.totalEmployerCost} color="text-red-600" />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BreakdownCard title="个人缴纳明细" data={results.employee} />
        <BreakdownCard title="企业缴纳明细" data={results.employer} isEmployer={true} />
      </div>
      {/* Rate Summary */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">当前费率摘要</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-sm mr-1">个人</span>
            <RateChip label="公积金" amount={results.employee.housingFund} base={results.preTaxSalary} />
            <RateChip label="养老" amount={results.employee.pension} base={results.preTaxSalary} />
            <RateChip label="医疗" amount={results.employee.medical} base={results.preTaxSalary} />
            <RateChip label="失业" amount={results.employee.unemployment} base={results.preTaxSalary} />
            <span className="ml-auto text-xs text-slate-400">合计 {formatPercent(results.employee.total / (results.preTaxSalary || 1), 2)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-sm mr-1">企业</span>
            <RateChip label="公积金" amount={results.employer.housingFund} base={results.preTaxSalary} />
            <RateChip label="养老" amount={results.employer.pension} base={results.preTaxSalary} />
            <RateChip label="医疗" amount={results.employer.medical} base={results.preTaxSalary} />
            <RateChip label="失业" amount={results.employer.unemployment} base={results.preTaxSalary} />
            <RateChip label="工伤" amount={results.employer.workInjury ?? 0} base={results.preTaxSalary} />
            <span className="ml-auto text-xs text-slate-400">合计 {formatPercent(results.employer.total / (results.preTaxSalary || 1), 2)}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">注：费率按“缴费额 ÷ 税前工资”换算，仅供参考。</p>
      </div>
       <div className="text-center text-xs text-slate-400 pt-4">
        <p>* 计算基于2023-2024上海市标准。社保基数范围: ¥7310-¥36549，公积金基数范围: ¥2690-¥36549。</p>
        <p>* 公积金按7%计算，结果仅供参考。</p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
