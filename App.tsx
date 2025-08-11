
import React, { useState, useCallback } from 'react';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import { performCalculation } from './services/salaryCalculator';
import type { CalculationInput, SalaryDetails, UiCalculationConfig } from './types';
import { CalculationMode } from './types';

function App() {
  const [input, setInput] = useState<CalculationInput>({
    salary: 20000,
    mode: CalculationMode.FROM_PRE_TAX,
    specialDeductions: 0,
  });
  const [results, setResults] = useState<SalaryDetails | null>(null);
  const [config, setConfig] = useState<UiCalculationConfig>({
    housingFundRate: 0.07,
    workInjuryRate: 0.0026,
    payPension: true,
    payMedical: true,
    payUnemployment: true,
    payHousingFund: true,
    payWorkInjury: true,
  });

  const handleCalculate = useCallback(() => {
    if (input.salary > 0) {
      const employeeRatesOverride = {
        ...(config.payPension === false ? { pension: 0 } : {}),
        ...(config.payMedical === false ? { medical: 0 } : {}),
        ...(config.payUnemployment === false ? { unemployment: 0 } : {}),
        ...(config.payHousingFund === false ? { housingFund: 0 } : { housingFund: config.housingFundRate }),
      } as const;

      const employerRatesOverride = {
        ...(config.payPension === false ? { pension: 0 } : {}),
        ...(config.payMedical === false ? { medical: 0 } : {}),
        ...(config.payUnemployment === false ? { unemployment: 0 } : {}),
        ...(config.payWorkInjury === false ? { workInjury: 0 } : { workInjury: config.workInjuryRate }),
        ...(config.payHousingFund === false ? { housingFund: 0 } : { housingFund: config.housingFundRate }),
      } as const;

      const calculatedResults = performCalculation(input, {
        employeeRates: employeeRatesOverride,
        employerRates: employerRatesOverride,
      });
      setResults(calculatedResults);
    } else {
      setResults(null);
    }
  }, [input, config]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-slate-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 hover-lift">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            薪酬个税计算器
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Shanghai Salary & Tax Calculator (上海)
          </p>
        </header>
        
        <main className="space-y-8">
          <CalculatorForm 
            input={input}
            setInput={setInput}
            config={config}
            setConfig={setConfig}
            onCalculate={handleCalculate}
          />
          <ResultsDisplay results={results} />
        </main>

        <footer className="text-center mt-12 py-4">
            <p className="text-sm text-slate-400">
                Crafted with React, TypeScript, and Tailwind CSS.
            </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
