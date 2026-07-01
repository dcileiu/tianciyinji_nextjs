export type PricingPlan = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number | null;
  free?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  { id: "plan-100", name: "100次", quantity: 100, unitPrice: 0.02, total: 2, free: true },
  { id: "plan-2500", name: "2500次", quantity: 2500, unitPrice: 0.00396, total: 9.9 },
  { id: "plan-5000", name: "5000次", quantity: 5000, unitPrice: 0.0036, total: 18 },
  { id: "plan-7500", name: "7500次", quantity: 7500, unitPrice: 0.00333, total: 25 },
  { id: "plan-10000", name: "1万次", quantity: 10000, unitPrice: 0.003, total: 30 },
];

export function formatUnitPrice(value: number) {
  return value.toFixed(4);
}

export function formatTotal(value: number) {
  return value.toFixed(2);
}

export function planAmountFen(plan: PricingPlan) {
  if (plan.free || plan.total === null) return 0;
  return Math.round(plan.total * 100);
}

export function planDescription(plan: PricingPlan) {
  return `去水印壁纸鸭 API - ${plan.name}`;
}
