
import {
  SOCIAL_SECURITY_BASE_MIN,
  SOCIAL_SECURITY_BASE_MAX,
  HOUSING_FUND_BASE_MIN,
  HOUSING_FUND_BASE_MAX,
  EMPLOYEE_RATES,
  EMPLOYER_RATES,
  TAX_THRESHOLD,
  TAX_BRACKETS,
} from '../constants';
import type { SalaryDetails, CalculationInput } from '../types';
import { CalculationMode } from '../types';

export interface CalculationConfig {
  employeeRates?: Partial<typeof EMPLOYEE_RATES>;
  employerRates?: Partial<typeof EMPLOYER_RATES>;
  socialSecurityBaseMin?: number;
  socialSecurityBaseMax?: number;
  housingFundBaseMin?: number;
  housingFundBaseMax?: number;
}

function calculateTax(annualTaxableIncome: number): number {
  if (annualTaxableIncome <= 0) {
    return 0;
  }

  for (let i = TAX_BRACKETS.length - 1; i >= 0; i--) {
    const bracket = TAX_BRACKETS[i];
    if (annualTaxableIncome > bracket.threshold) {
      return (annualTaxableIncome * bracket.rate - bracket.quickDeduction) / 12;
    }
  }
  return 0;
}

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateFromPreTax(
  preTaxSalary: number,
  specialDeductions: number = 0,
  config: CalculationConfig = {}
): SalaryDetails {
  if (preTaxSalary <= 0) {
     return {
        preTaxSalary: 0,
        postTaxSalary: 0,
        totalEmployerCost: 0,
        employee: { pension: 0, medical: 0, unemployment: 0, housingFund: 0, total: 0, tax: 0 },
        employer: { pension: 0, medical: 0, unemployment: 0, housingFund: 0, workInjury: 0, total: 0 },
    };
  }

  const socialSecurityBaseMin = config.socialSecurityBaseMin ?? SOCIAL_SECURITY_BASE_MIN;
  const socialSecurityBaseMax = config.socialSecurityBaseMax ?? SOCIAL_SECURITY_BASE_MAX;
  const housingFundBaseMin = config.housingFundBaseMin ?? HOUSING_FUND_BASE_MIN;
  const housingFundBaseMax = config.housingFundBaseMax ?? HOUSING_FUND_BASE_MAX;

  const employeeRates = { ...EMPLOYEE_RATES, ...(config.employeeRates ?? {}) } as typeof EMPLOYEE_RATES;
  const employerRates = { ...EMPLOYER_RATES, ...(config.employerRates ?? {}) } as typeof EMPLOYER_RATES;

  const sanitize = (v: number | undefined): number => {
    return typeof v === 'number' && Number.isFinite(v) ? v : 0;
  };

  const er = {
    pension: sanitize(employeeRates.pension),
    medical: sanitize(employeeRates.medical),
    unemployment: sanitize(employeeRates.unemployment),
    housingFund: sanitize(employeeRates.housingFund),
  } as const;
  const mr = {
    pension: sanitize(employerRates.pension),
    medical: sanitize(employerRates.medical),
    unemployment: sanitize(employerRates.unemployment),
    workInjury: sanitize(employerRates.workInjury),
    housingFund: sanitize(employerRates.housingFund),
  } as const;

  const socialSecurityBase = Math.max(socialSecurityBaseMin, Math.min(preTaxSalary, socialSecurityBaseMax));
  const housingFundBase = Math.max(housingFundBaseMin, Math.min(preTaxSalary, housingFundBaseMax));

  const employeeContributions = {
    pension: roundToCents(socialSecurityBase * er.pension),
    medical: roundToCents(socialSecurityBase * er.medical),
    unemployment: roundToCents(socialSecurityBase * er.unemployment),
    housingFund: roundToCents(housingFundBase * er.housingFund),
  };
  const employeeTotal = roundToCents(Object.values(employeeContributions).reduce((sum, val) => sum + val, 0));

  const employerContributions = {
    pension: roundToCents(socialSecurityBase * mr.pension),
    medical: roundToCents(socialSecurityBase * mr.medical),
    unemployment: roundToCents(socialSecurityBase * mr.unemployment),
    workInjury: roundToCents(socialSecurityBase * mr.workInjury),
    housingFund: roundToCents(housingFundBase * mr.housingFund),
  };
  const employerTotal = roundToCents(Object.values(employerContributions).reduce((sum, val) => sum + val, 0));

  const taxableIncomeMonthly = preTaxSalary - employeeTotal - TAX_THRESHOLD - specialDeductions;
  const annualTaxableIncome = taxableIncomeMonthly * 12;
  const tax = roundToCents(calculateTax(annualTaxableIncome));

  const postTaxSalary = roundToCents(preTaxSalary - employeeTotal - tax);
  const totalEmployerCost = roundToCents(preTaxSalary + employerTotal);

  return {
    preTaxSalary: roundToCents(preTaxSalary),
    postTaxSalary: postTaxSalary,
    totalEmployerCost: totalEmployerCost,
    employee: { ...employeeContributions, total: employeeTotal, tax: tax },
    employer: { ...employerContributions, total: employerTotal },
  };
}

export function calculateFromPostTax(
  postTaxSalary: number,
  specialDeductions: number = 0,
  config: CalculationConfig = {}
): SalaryDetails {
  if (postTaxSalary <= 0) {
    return calculateFromPreTax(0, 0);
  }

  let low = postTaxSalary;
  // 自适应上界：逐步扩展直到高界对应的税后不小于目标税后，或达到安全阈值
  let high = Math.max(postTaxSalary * 2, postTaxSalary + 5000);
  for (let i = 0; i < 20; i++) {
    const highPostTax = calculateFromPreTax(high, specialDeductions, config).postTaxSalary;
    if (highPostTax >= postTaxSalary) break;
    high = high * 1.5 + 10000;
    if (high > 1e7) break; // 安全阈值
  }

  let bestGuessPreTax = postTaxSalary;

  // Binary search for the pre-tax salary
  for (let i = 0; i < 100; i++) { // 100 iterations for precision
    const guessPreTax = (low + high) / 2;
    if(guessPreTax <=0) continue;

    const calculatedDetails = calculateFromPreTax(guessPreTax, specialDeductions, config);
    const calculatedPostTax = calculatedDetails.postTaxSalary;

    if (Math.abs(calculatedPostTax - postTaxSalary) < 0.01) {
      bestGuessPreTax = guessPreTax;
      break;
    }

    if (calculatedPostTax < postTaxSalary) {
      low = guessPreTax;
    } else {
      high = guessPreTax;
    }
    bestGuessPreTax = guessPreTax;
  }

  return calculateFromPreTax(bestGuessPreTax, specialDeductions, config);
}

export function performCalculation(input: CalculationInput, config: CalculationConfig = {}): SalaryDetails {
    if (input.mode === CalculationMode.FROM_PRE_TAX) {
        return calculateFromPreTax(input.salary, input.specialDeductions, config);
    } else {
        return calculateFromPostTax(input.salary, input.specialDeductions, config);
    }
}
