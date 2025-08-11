
export enum CalculationMode {
  FROM_PRE_TAX = 'from_pre_tax',
  FROM_POST_TAX = 'from_post_tax',
}

export interface CalculationInput {
  salary: number;
  mode: CalculationMode;
  specialDeductions: number;
}

export interface Breakdown {
  pension: number;
  medical: number;
  unemployment: number;
  housingFund: number;
  workInjury?: number;
  maternity?: number; 
}

export interface SalaryDetails {
  preTaxSalary: number;
  postTaxSalary: number;
  totalEmployerCost: number;
  employee: Breakdown & { total: number; tax: number };
  employer: Breakdown & { total: number };
}

// 供 UI 传入的轻量配置（将映射到 CalculationConfig 内部）
export interface UiCalculationConfig {
  housingFundRate?: number; // 例如 0.05 - 0.07（个人与企业同步使用）
  workInjuryRate?: number;  // 例如 0.001 - 0.005（企业）
  // 缴纳项开关（true/未设置：视为缴纳；false：不缴纳=费率按 0 计算）
  payPension?: boolean;
  payMedical?: boolean;
  payUnemployment?: boolean;
  payHousingFund?: boolean;
  payWorkInjury?: boolean;
}
