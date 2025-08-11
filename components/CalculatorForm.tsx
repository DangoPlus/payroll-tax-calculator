
import React from 'react';
import { CalculationMode } from '../types';
import type { CalculationInput, UiCalculationConfig } from '../types';

interface CalculatorFormProps {
  input: CalculationInput;
  setInput: React.Dispatch<React.SetStateAction<CalculationInput>>;
  config: UiCalculationConfig;
  setConfig: React.Dispatch<React.SetStateAction<UiCalculationConfig>>;
  onCalculate: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ input, setInput, config, setConfig, onCalculate }) => {
  const handleModeChange = (mode: CalculationMode) => {
    setInput((prev) => ({ ...prev, mode }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw === '' ? 0 : parseFloat(raw);
    const clamped = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setInput((prev) => ({ ...prev, salary: clamped }));
  };
  
  const handleDeductionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw === '' ? 0 : parseFloat(raw);
    const clamped = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setInput((prev) => ({ ...prev, specialDeductions: clamped }));
  };

  const handleHousingFundRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsedPct = raw === '' ? 0 : parseFloat(raw);
    const clampedPct = isNaN(parsedPct) ? 0 : Math.min(12, Math.max(0, parsedPct));
    const rate = clampedPct / 100; // 存储为小数
    setConfig((prev) => ({ ...prev, housingFundRate: rate }));
  };

  const handleWorkInjuryRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsedPct = raw === '' ? 0 : parseFloat(raw);
    const clampedPct = isNaN(parsedPct) ? 0 : Math.min(5, Math.max(0, parsedPct));
    const rate = clampedPct / 100; // 存储为小数
    setConfig((prev) => ({ ...prev, workInjuryRate: rate }));
  };
  
  const isValidSalary = Number.isFinite(input.salary) && input.salary > 0;
  const isValidDeductions = Number.isFinite(input.specialDeductions) && input.specialDeductions >= 0;
  const isValidHousingFund = config.housingFundRate === undefined || (config.housingFundRate >= 0 && config.housingFundRate <= 0.12);
  const isValidWorkInjury = config.workInjuryRate === undefined || (config.workInjuryRate >= 0 && config.workInjuryRate <= 0.05);
  const canCalculate = isValidSalary && isValidDeductions && isValidHousingFund && isValidWorkInjury;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (canCalculate) onCalculate();
  };

  const HintIcon: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <span className="ml-1 tooltip">
      <button type="button" aria-label={title} className="icon-btn" tabIndex={0}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15.5h-1.5v-1.5h1.5v1.5zM9.25 9.75a2.75 2.75 0 115.5 0c0 1.03-.57 1.62-1.37 2.2-.77.55-1.13.86-1.13 1.55v.25h-1.5v-.25c0-1.38.8-2.1 1.58-2.66.7-.5 1.17-.84 1.17-1.34a1.25 1.25 0 00-2.5 0h-1.75z"/></svg>
      </button>
      <span role="tooltip" className="tooltip-panel text-xs">
        <span className="font-medium">{title}</span>：{desc}
      </span>
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          计算方式
          <HintIcon title="计算方式" desc="从税前工资计算税后，或从税后工资反推税前。" />
        </label>
        <div className="segmented">
          <button
            type="button"
            onClick={() => handleModeChange(CalculationMode.FROM_PRE_TAX)}
            className={`segm-item ${input.mode === CalculationMode.FROM_PRE_TAX ? 'active' : ''}`}
          >
            税前薪资
          </button>
          <button
            type="button"
            onClick={() => handleModeChange(CalculationMode.FROM_POST_TAX)}
            className={`segm-item ${input.mode === CalculationMode.FROM_POST_TAX ? 'active' : ''}`}
          >
            税后薪资
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="housingFundRate" className="block text-sm font-medium text-slate-700">
            公积金比例（0% - 12%）
            <HintIcon title="住房公积金比例" desc="个人与企业各自缴纳的比例（默认 7%）。不同单位在 5%-7% 间浮动。" />
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="housingFundRate"
              id="housingFundRate"
              className={`block w-full rounded-md px-3 pr-10 py-2 sm:text-sm ${
                (config.payHousingFund === false)
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="7"
              step="0.1"
              min="0"
              max="12"
              value={((config.housingFundRate ?? 0.07) * 100).toFixed(2).replace(/\.00$/, '')}
              onChange={handleHousingFundRateChange}
              disabled={config.payHousingFund === false}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">%</span>
            {!isValidHousingFund && (
              <p className="mt-1 text-xs text-red-600">请输入 0% - 12% 之间的数值（如 7）。</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="workInjuryRate" className="block text-sm font-medium text-slate-700">
            工伤保险费率（0% - 5%）
            <HintIcon title="工伤保险费率" desc="企业缴纳的工伤保险比例，不同行业档次差异较大。默认 0.26%。" />
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="workInjuryRate"
              id="workInjuryRate"
              className={`block w-full rounded-md px-3 pr-10 py-2 sm:text-sm ${
                (config.payWorkInjury === false)
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              placeholder="0.26"
              step="0.01"
              min="0"
              max="5"
              value={((config.workInjuryRate ?? 0.0026) * 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}
              onChange={handleWorkInjuryRateChange}
              disabled={config.payWorkInjury === false}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">%</span>
            {!isValidWorkInjury && (
              <p className="mt-1 text-xs text-red-600">请输入 0% - 5% 之间的数值（如 0.26）。</p>
            )}
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-slate-700">
          {input.mode === CalculationMode.FROM_PRE_TAX ? '税前月薪 (元)' : '税后月薪 (元)'}
          <HintIcon title="月薪" desc="以人民币计的月度工资金额。" />
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-gray-500 sm:text-sm">¥</span>
          </div>
          <input
            type="number"
            name="salary"
            id="salary"
            className="block w-full input-field pl-7 pr-12"
            placeholder="0.00"
            aria-describedby="salary-currency"
            aria-invalid={!isValidSalary}
            value={input.salary || ''}
            onChange={handleSalaryChange}
            min="0"
            step="1"
          />
          {!isValidSalary && (
            <p className="mt-1 text-xs text-red-600">请输入大于 0 的数值。</p>
          )}
        </div>
      </div>
       <div>
        <label htmlFor="specialDeductions" className="block text-sm font-medium text-slate-700">
          专项附加扣除 (元)
          <HintIcon title="专项附加扣除" desc="子女教育、继续教育、住房贷款利息、住房租金、赡养老人等合计的月度扣除。" />
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
           <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-gray-500 sm:text-sm">¥</span>
          </div>
          <input
            type="number"
            name="specialDeductions"
            id="specialDeductions"
            className="block w-full input-field pl-7 pr-12"
            placeholder="0.00"
            aria-describedby="deductions-currency"
            aria-invalid={!isValidDeductions}
            value={input.specialDeductions || ''}
            onChange={handleDeductionsChange}
            min="0"
            step="1"
          />
          {!isValidDeductions && (
            <p className="mt-1 text-xs text-red-600">请输入不小于 0 的数值。</p>
          )}
        </div>
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">
          缴纳项
          <HintIcon title="缴纳项开关" desc="关闭后视为该项不缴纳，计算时对应费率按 0 处理。" />
        </span>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'payPension', label: '养老' },
            { key: 'payMedical', label: '医疗' },
            { key: 'payUnemployment', label: '失业' },
            { key: 'payHousingFund', label: '公积金' },
            { key: 'payWorkInjury', label: '工伤' },
          ].map((item) => (
            <label key={item.key} className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-md px-3 py-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                checked={(config as any)[item.key] !== false}
                onChange={(e) => setConfig((prev) => ({ ...prev, [item.key]: e.target.checked }))}
              />
              <span className="text-sm text-slate-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={!canCalculate}
          aria-disabled={!canCalculate}
          className={`w-full flex justify-center pill-btn ${!canCalculate ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          开始计算
        </button>
      </div>
    </form>
  );
};

export default CalculatorForm;
