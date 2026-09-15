
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ArrowUpRight,
  BarChart3,
  PieChart,
  CreditCard,
  Target,
  Loader2,
  CalendarDays,
  ChevronDown,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";


/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};


const formatCategory = (category) => {
  if (!category) return "Other";

  return category
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


/* =========================================================
   CHART COLORS
========================================================= */

const CHART_COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#F43F5E",
  "#06B6D4",
];


/* =========================================================
   KPI CARD
========================================================= */

function FinanceStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}


/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function SpendingTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}


/* =========================================================
   FINANCE DASHBOARD
========================================================= */

export default function FinanceDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [readyClaims, setReadyClaims] = useState([]);

  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD DATA
  ------------------------------------------------------- */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        dashboardResponse,
        monthlyResponse,
        categoryResponse,
        budgetResponse,
        readyResponse,
      ] = await Promise.all([
        api.get("/finance/dashboard/"),
        api.get("/analytics/monthly/"),
        api.get("/analytics/categories/"),
        api.get("/analytics/budgets/"),
        api.get("/finance/ready-to-pay/"),
      ]);

      setDashboard(dashboardResponse.data);

      const monthly =
        Array.isArray(monthlyResponse.data)
          ? monthlyResponse.data
          : monthlyResponse.data.results || [];

      const categories =
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : categoryResponse.data.results || [];

      const budgets =
        Array.isArray(budgetResponse.data)
          ? budgetResponse.data
          : budgetResponse.data.results || [];

      const ready =
        Array.isArray(readyResponse.data)
          ? readyResponse.data
          : readyResponse.data.results || [];

      setMonthlyData(monthly);
      setCategoryData(categories);
      setBudgetData(budgets);
      setReadyClaims(ready);
    } catch (error) {
      console.error("Finance dashboard error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load finance dashboard."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* =========================================================
     FORMAT MONTHLY DATA
  ========================================================= */

  const formattedMonthlyData = useMemo(() => {
    return monthlyData.map((item) => {
      const rawMonth =
        item.month ||
        item.expense_month ||
        item.date;

      let monthName = rawMonth;

      if (rawMonth) {
        const date = new Date(rawMonth);

        if (!Number.isNaN(date.getTime())) {
          monthName = date.toLocaleDateString("en-IN", {
            month: "short",
          });
        }
      }

      return {
        month: monthName,
        amount: Number(
          item.total ||
            item.total_spending ||
            item.amount ||
            0
        ),
      };
    });
  }, [monthlyData]);


  /* =========================================================
     FORMAT CATEGORY DATA
  ========================================================= */

  const formattedCategoryData = useMemo(() => {
    return categoryData.map((item) => ({
      name: formatCategory(
        item.category ||
          item.category_name
      ),

      value: Number(
        item.total ||
          item.total_spending ||
          item.amount ||
          0
      ),
    }));
  }, [categoryData]);


  const categoryTotal = formattedCategoryData.reduce(
    (sum, item) => sum + item.value,
    0
  );


  /* =========================================================
     BUDGET ALERTS
  ========================================================= */

  const budgetAlerts = useMemo(() => {
    return [...budgetData]
      .sort(
        (a, b) =>
          Number(
            b.utilization_percentage || 0
          ) -
          Number(
            a.utilization_percentage || 0
          )
      )
      .slice(0, 6);
  }, [budgetData]);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Loading Finance Dashboard...
        </div>
      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Finance Department
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Finance Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor company spending, process payments and track
            budget utilization.
          </p>
        </div>


        {/* Right controls */}

        <div className="flex items-center gap-3">

          <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex">
            <CalendarDays className="h-5 w-5 text-slate-500" />

            <div>
              <p className="text-xs text-slate-400">
                Today
              </p>

              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

        </div>
      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <FinanceStatCard
          title="Total Spend"
          value={formatCurrency(
            dashboard?.total_spend
          )}
          description="Company expenses processed"
          icon={Wallet}
          iconClass="bg-indigo-50 text-indigo-600"
        />


        <FinanceStatCard
          title="Pending Approval"
          value={formatCurrency(
            dashboard?.pending_approval
          )}
          description="Awaiting manager action"
          icon={Clock3}
          iconClass="bg-orange-50 text-orange-600"
        />


        <FinanceStatCard
          title="Ready to Pay"
          value={formatCurrency(
            dashboard?.ready_to_pay
          )}
          description="Approved claims"
          icon={CreditCard}
          iconClass="bg-emerald-50 text-emerald-600"
        />


        <FinanceStatCard
          title="Duplicate Flags"
          value={dashboard?.duplicate_count || 0}
          description="Claims requiring review"
          icon={AlertTriangle}
          iconClass="bg-rose-50 text-rose-600"
          valueClass="text-rose-600"
        />

      </div>


      {/* =====================================================
          CHART ROW
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-2">


        {/* ===================================================
            MONTHLY SPENDING
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="flex items-start justify-between">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-indigo-50 p-3">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Monthly Spending Trend
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Total reimbursements processed each month
                </p>
              </div>

            </div>


            <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              Last 6 months
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

          </div>


          <div className="mt-6 h-[300px]">

            {formattedMonthlyData.length === 0 ? (

              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No monthly spending data available.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={formattedMonthlyData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      `₹${value / 1000}K`
                    }
                  />

                  <Tooltip
                    content={<SpendingTooltip />}
                  />

                  <Bar
                    dataKey="amount"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    fill="#6366F1"
                    maxBarSize={55}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </motion.div>


        {/* ===================================================
            CATEGORY SPENDING
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="flex items-start justify-between">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-indigo-50 p-3">
                <PieChart className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Spending by Category
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution of expenses by category
                </p>
              </div>

            </div>


            <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              This Year
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

          </div>


          <div className="mt-3 flex min-h-[300px] items-center">

            {formattedCategoryData.length === 0 ? (

              <div className="flex w-full items-center justify-center text-sm text-slate-400">
                No category data available.
              </div>

            ) : (

              <div className="grid w-full grid-cols-2 items-center gap-2">

                <div className="h-[270px]">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <RechartsPieChart>

                      <Pie
                        data={formattedCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={2}
                      >

                        {formattedCategoryData.map(
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                    </RechartsPieChart>

                  </ResponsiveContainer>

                  <div className="pointer-events-none relative -mt-[165px] flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(categoryTotal)}
                    </span>

                    <span className="text-xs text-slate-500">
                      Total Spend
                    </span>
                  </div>

                </div>


                {/* Legend */}

                <div className="space-y-3">

                  {formattedCategoryData.map(
                    (category, index) => {

                      const percentage =
                        categoryTotal > 0
                          ? (
                              (category.value /
                                categoryTotal) *
                              100
                            ).toFixed(0)
                          : 0;

                      return (
                        <div
                          key={category.name}
                          className="flex items-center justify-between gap-2"
                        >

                          <div className="flex min-w-0 items-center gap-2">

                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  CHART_COLORS[
                                    index %
                                      CHART_COLORS.length
                                  ],
                              }}
                            />

                            <span className="truncate text-xs font-medium text-slate-600">
                              {category.name}
                            </span>

                          </div>

                          <div className="text-right">

                            <p className="text-xs font-semibold text-slate-800">
                              {formatCurrency(
                                category.value
                              )}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {percentage}%
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            )}

          </div>

        </motion.div>

      </div>


      {/* =====================================================
          BOTTOM ROW
      ===================================================== */}

      <div className="grid gap-6 xl:grid-cols-5">


        {/* ===================================================
            READY TO PAY
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3"
        >

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-indigo-50 p-3">
                <CreditCard className="h-5 w-5 text-indigo-600" />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Ready to Pay
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recently approved claims waiting for payment
                </p>

              </div>

            </div>

            <Link
              to="/finance/ready-to-pay"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </Link>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="bg-slate-50">

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Claim
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {readyClaims
                  .slice(0, 5)
                  .map((claim) => (

                    <tr
                      key={claim.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <p className="text-xs font-semibold text-slate-900">
                          {claim.claim_number}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                          APPROVED
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                            {claim.employee_name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <span className="text-xs font-medium text-slate-700">
                            {claim.employee_name}
                          </span>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                          {claim.category_display ||
                            formatCategory(
                              claim.category
                            )}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-right">

                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(
                            claim.amount
                          )}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-right">

                        <Link
                          to="/finance/ready-to-pay"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-indigo-700"
                        >
                          <CreditCard className="h-3 w-3" />
                          Pay
                        </Link>

                      </td>

                    </tr>

                  ))}


                {readyClaims.length === 0 && (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-sm text-slate-400"
                    >
                      No approved claims are waiting for payment.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </motion.div>


        {/* ===================================================
            BUDGET UTILIZATION
        =================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2"
        >

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-indigo-50 p-3">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Budget Utilization
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Employees approaching or exceeding limits
                </p>

              </div>

            </div>

            <Link
              to="/finance/budgets"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </Link>

          </div>


          <div className="divide-y divide-slate-100">

            {budgetAlerts.map((budget) => {

              const utilization = Number(
                budget.utilization_percentage || 0
              );

              const progressWidth =
                Math.min(utilization, 100);

              let progressColor =
                "bg-indigo-500";

              let percentageColor =
                "text-indigo-600";

              if (utilization >= 100) {
                progressColor = "bg-rose-500";
                percentageColor = "text-rose-600";
              } else if (utilization >= 80) {
                progressColor = "bg-orange-500";
                percentageColor = "text-orange-600";
              }

              return (
                <div
                  key={
                    budget.id ||
                    `${budget.employee_name}-${budget.month}`
                  }
                  className="px-6 py-4"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex min-w-0 items-center gap-2">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {budget.employee_name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <span className="truncate text-xs font-medium text-slate-700">
                        {budget.employee_name}
                      </span>

                    </div>


                    <span
                      className={`text-xs font-bold ${percentageColor}`}
                    >
                      {utilization.toFixed(0)}%
                    </span>

                  </div>


                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full transition-all ${progressColor}`}
                      style={{
                        width: `${progressWidth}%`,
                      }}
                    />

                  </div>


                  <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                    <span>
                      Spent{" "}
                      <strong className="text-slate-600">
                        {formatCurrency(
                          budget.spent
                        )}
                      </strong>
                    </span>

                    <span>
                      Limit{" "}
                      <strong className="text-slate-600">
                        {formatCurrency(
                          budget.limit
                        )}
                      </strong>
                    </span>

                  </div>

                </div>
              );
            })}


            {budgetAlerts.length === 0 && (

              <div className="px-6 py-12 text-center">

                <Target className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm text-slate-400">
                  No budget information available.
                </p>

              </div>

            )}

          </div>

        </motion.div>

      </div>


      {/* =====================================================
          FINANCE CONTROL INFO
      ===================================================== */}

      <div className="grid gap-5 md:grid-cols-3">

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-100 p-2.5">
              <IndianRupee className="h-5 w-5 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Paid Claims
              </p>

              <p className="text-xs text-slate-500">
                {dashboard?.paid_count || 0} completed
                reimbursements
              </p>
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-orange-100 p-2.5">
              <Clock3 className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pending Claims
              </p>

              <p className="text-xs text-slate-500">
                {dashboard?.pending_count || 0} claims in
                workflow
              </p>
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-rose-100 p-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Budget Exceptions
              </p>

              <p className="text-xs text-slate-500">
                {dashboard?.over_budget_count || 0} employees
                over limit
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
    </DashboardLayout>
  );
}