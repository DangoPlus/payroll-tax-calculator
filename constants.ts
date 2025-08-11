
// All data based on Shanghai 2023-2024 standards.
// Please update these values as they change.

// Social Security Contribution Base (社保缴费基数)
export const SOCIAL_SECURITY_BASE_MIN = 7310;
export const SOCIAL_SECURITY_BASE_MAX = 36549;

// Housing Fund Contribution Base (公积金缴费基数)
export const HOUSING_FUND_BASE_MIN = 2690;
export const HOUSING_FUND_BASE_MAX = 36549;

// Employee Contribution Rates (个人缴纳比例)
export const EMPLOYEE_RATES = {
  pension: 0.08,      // 养老保险
  medical: 0.02,      // 医疗保险
  unemployment: 0.005, // 失业保险
  housingFund: 0.07,  // 公积金 (can be 5%-7%, using 7%)
};

// Employer Contribution Rates (企业缴纳比例)
export const EMPLOYER_RATES = {
  pension: 0.16,      // 养老保险
  medical: 0.095,     // 医疗保险 (includes maternity)
  unemployment: 0.005, // 失业保险
  workInjury: 0.0026, // 工伤保险 (average rate)
  housingFund: 0.07,  // 公积金 (can be 5%-7%, using 7%)
};

// Standard Monthly Deduction for Tax (个税起征点)
export const TAX_THRESHOLD = 5000;

// Progressive Tax Brackets (年度应纳税所得额)
export const TAX_BRACKETS = [
  { threshold: 0,       rate: 0.03, quickDeduction: 0 },
  { threshold: 36000,   rate: 0.10, quickDeduction: 2520 },
  { threshold: 144000,  rate: 0.20, quickDeduction: 16920 },
  { threshold: 300000,  rate: 0.25, quickDeduction: 31920 },
  { threshold: 420000,  rate: 0.30, quickDeduction: 52920 },
  { threshold: 660000,  rate: 0.35, quickDeduction: 85920 },
  { threshold: 960000,  rate: 0.45, quickDeduction: 181920 },
];
