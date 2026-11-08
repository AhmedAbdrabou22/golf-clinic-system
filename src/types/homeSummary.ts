export type PeriodPreset =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export type HomeSummaryData = {
  status: number;
  message: string;
  errors: null;
  data: {
    dashboard_title: string;
    applied_filters: {
      preset: PeriodPreset;
      start_date: string;
      end_date: string;
      days_count: number;
      department_id: number | null;
      doctor_id: number | null;
    };
    executive_kpi_cards: {
      net_profit: number;
      performance_status: "profit" | "loss" | "break_even";
      net_profit_margin_percent: number;
      gross_realized_revenue: number;
      total_cash_outflows: number;
      inventory_consumables_cogs: number;
      operating_expenses: number;
      salaries_and_commissions: number;
    };
    inventory_multi_month_clarity: {
      purchases_during_period: number;
      purchases_invoices_count: number;
      consumed_in_sessions_cogs: number;
      unconsumed_inventory_asset: number;
      current_total_stock_value: number;
      is_deficit: boolean;
      clarification: string;
    };
    collections_and_safe: {
      total_collected: number;
      remaining_uncollected_debt: number;
      collection_rate_percent: number;
    };
    revenue_by_category: Record<string, number>;
    top_profitable_devices: Array<{
      device_id?: number;
      device_name?: string;
      sessions_count?: number;
      gross_revenue?: number;
      net_share?: number;
      [k: string]: unknown;
    }>;
    top_performing_doctors: Array<{
      doctor_id: number;
      doctor_name: string;
      department_name: string;
      patients_count: number;
      gross_revenue: number;
      commissions: number;
      clinic_net_share: number;
    }>;
    today_quick_pulse: {
      today_date: string;
      today_appointments_count: number;
      today_invoices_count: number;
      today_revenue: number;
      active_open_shifts_count: number;
    };
  };
};