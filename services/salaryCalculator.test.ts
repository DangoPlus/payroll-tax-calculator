import { describe, it, expect } from 'vitest';
import { calculateFromPreTax, calculateFromPostTax, performCalculation } from './salaryCalculator';
import { CalculationMode } from '../types';

describe('salaryCalculator', () => {
  it('returns zeros for non-positive pre-tax salary', () => {
    const res = calculateFromPreTax(0, 0);
    expect(res.preTaxSalary).toBe(0);
    expect(res.postTaxSalary).toBe(0);
    expect(res.totalEmployerCost).toBe(0);
  });

  it('pre-tax to post-tax should be consistent around threshold', () => {
    const res = calculateFromPreTax(6000, 0);
    expect(res.postTaxSalary).toBeGreaterThan(0);
    expect(res.employee.total).toBeGreaterThan(0);
  });

  it('post-tax inversion stays close to original', () => {
    const base = calculateFromPreTax(20000, 1000);
    const inverted = calculateFromPostTax(base.postTaxSalary, 1000);
    expect(Math.abs(inverted.preTaxSalary - 20000)).toBeLessThanOrEqual(1);
  });

  it('performCalculation routes by mode', () => {
    const pre = performCalculation({ salary: 15000, specialDeductions: 0, mode: CalculationMode.FROM_PRE_TAX });
    const post = performCalculation({ salary: pre.postTaxSalary, specialDeductions: 0, mode: CalculationMode.FROM_POST_TAX });
    expect(Math.abs(post.preTaxSalary - 15000)).toBeLessThanOrEqual(1);
  });
});


