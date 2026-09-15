import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  IndianRupee,
  Trophy,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { motion } from "framer-motion";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";


/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};


const formatCategory = (value) => {
  if (!value) return "Other";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#F43F5E",
  "#06B6D4",
];


/* =========================================================
   TOOLTIP
========================================================= */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      {label && (
        <p className="text-xs text-slate-400">
          {label}
        </p>
      )}

      <p className="mt-1 text-sm font-bold text-slate-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

      </div>
    </motion.div>
  );
}


/* =========================================================
   ANALYTICS PAGE
========================================================= */

export default function Analytics() {

  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);


  /* =======================================================
     FETCH DATA
  ======================================================= */

  const loadAnalytics = async () => {

    try {

      setLoading(true);

      const [
        monthlyResponse,
        categoryResponse,
        employeeResponse,
        budgetResponse,
      ] = await Promise.all([
        api.get("/analytics/monthly/"),
        api.get("/analytics/categories/"),
        api.get("/analytics/employees/"),
        api.get("/analytics/budgets/"),
      ]);


      const monthlyData =
        Array.isArray(monthlyResponse.data)
          ? monthlyResponse.data
          : monthlyResponse.data.results || [];


      const categoryData =
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : categoryResponse.data.results || [];


      const employeeData =
        Array.isArray(employeeResponse.data)
          ? employeeResponse.data
          : employeeResponse.data.results || [];


      const budgetData =
        Array.isArray(budgetResponse.data)
          ? budgetResponse.data
          : budgetResponse.data.results || [];


      setMonthly(monthlyData);
      setCategories(categoryData);
      setEmployees(employeeData);
      setBudgets(budgetData);

    } catch (error) {

      console.error(
        "Analytics loading error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          "Unable to load analytics."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadAnalytics();
  }, []);


  /* =======================================================
     MONTHLY CHART DATA
  ======================================================= */

  const monthlyChartData = useMemo(() => {

    return monthly.map((item) => {

      const rawMonth =
        item.month ||
        item.expense_month ||
        item.date;

      let month = rawMonth || "";

      if (rawMonth) {

        const date = new Date(rawMonth);

        if (!Number.isNaN(date.getTime())) {

          month = date.toLocaleDateString(
            "en-IN",
            {
              month: "short",
              year: "2-digit",
            }
          );

        }
      }

      return {
        month,
        amount: Number(
          item.total ||
            item.total_spending ||
            item.amount ||
            0
        ),
      };
    });

  }, [monthly]);


  /* =======================================================
     CATEGORY DATA
  ======================================================= */

  const categoryChartData = useMemo(() => {

    return categories.map((item) => ({
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

  }, [categories]);


  /* =======================================================
     EMPLOYEE DATA
  ======================================================= */

  const employeeChartData = useMemo(() => {

    return employees
      .map((item) => ({
        name:
          item.employee_name ||
          item.name ||
          "Unknown",

        amount: Number(
          item.total ||
            item.total_spending ||
            item.amount ||
            0
        ),
      }))
      .sort(
        (a, b) => b.amount - a.amount
      )
      .slice(0, 8);

  }, [employees]);


  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const totalSpend = categoryChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );


  const totalEmployees =
    employees.length;


  const topEmployee =
    employeeChartData[0];


  const averageEmployeeSpend =
    totalEmployees > 0
      ? totalSpend / totalEmployees
      : 0;


  const overBudgetCount =
    budgets.filter(
      (item) =>
        Number(
          item.utilization_percentage || 0
        ) > 100
    ).length;


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <DashboardLayout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="flex items-center gap-3 text-sm text-slate-500">

            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />

            Loading analytics...

          </div>

        </div>

      </DashboardLayout>
    );

  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <DashboardLayout>

      <div className="space-y-6">


        {/* =================================================
            HEADER
        ================================================= */}

        <div>

          <p className="text-sm font-semibold text-indigo-600">
            Finance Department
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Financial Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Analyze company expenses, employee spending
            and budget performance.
          </p>

        </div>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Company Spend"
            value={formatCurrency(totalSpend)}
            description="Based on paid expenses"
            icon={Wallet}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <StatCard
            title="Employees with Expenses"
            value={totalEmployees}
            description="Employees with recorded spending"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Average Employee Spend"
            value={formatCurrency(
              averageEmployeeSpend
            )}
            description="Average spending per employee"
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            title="Over Budget"
            value={overBudgetCount}
            description="Employees exceeding monthly limit"
            icon={IndianRupee}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />

        </div>


        {/* =================================================
            MONTHLY SPENDING
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-50 p-3">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Monthly Spending
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Track expense growth across months
              </p>

            </div>

          </div>


          <div className="mt-6 h-[330px]">

            {monthlyChartData.length === 0 ? (

              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No monthly spending data.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
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
                    content={<CustomTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#4F46E5",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </motion.div>


        {/* =================================================
            CATEGORY + EMPLOYEE
        ================================================= */}

        <div className="grid gap-6 xl:grid-cols-2">


          {/* CATEGORY */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-50 p-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Spending by Category
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Where company money is being spent
                </p>

              </div>

            </div>


            <div className="mt-6 h-[330px]">

              {categoryChartData.length === 0 ? (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No category data.
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >

                      {categoryChartData.map(
                        (_, index) => (
                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />

                  </PieChart>

                </ResponsiveContainer>

              )}

            </div>

          </motion.div>


          {/* EMPLOYEE */}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-50 p-3">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Employee Spending
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Highest spending employees
                </p>

              </div>

            </div>


            <div className="mt-6 h-[330px]">

              {employeeChartData.length === 0 ? (

                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No employee spending data.
                </div>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    layout="vertical"
                    data={employeeChartData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 15,
                      bottom: 5,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#E2E8F0"
                    />

                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748B",
                        fontSize: 11,
                      }}
                      tickFormatter={(value) =>
                        `₹${value / 1000}K`
                      }
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#475569",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                    />

                    <Bar
                      dataKey="amount"
                      fill="#10B981"
                      radius={[
                        0,
                        7,
                        7,
                        0,
                      ]}
                      maxBarSize={24}
                    />

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

          </motion.div>

        </div>


        {/* =================================================
            TOP SPENDERS
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-amber-50 p-3">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>

              <div>

                <h2 className="font-semibold text-slate-900">
                  Top Spending Employees
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Employees ranked by total paid expenses
                </p>

              </div>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="bg-slate-50">

                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Rank
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Spending
                  </th>

                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Share of Spend
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {employeeChartData.map(
                  (employee, index) => {

                    const percentage =
                      totalSpend > 0
                        ? (
                            (employee.amount /
                              totalSpend) *
                            100
                          ).toFixed(1)
                        : "0.0";

                    return (
                      <tr
                        key={employee.name}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {index + 1}
                          </div>

                        </td>


                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">

                              {employee.name
                                ?.charAt(0)
                                ?.toUpperCase()}

                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {employee.name}
                            </span>

                          </div>

                        </td>


                        <td className="px-6 py-4">

                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(
                              employee.amount
                            )}
                          </span>

                        </td>


                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      percentage
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="text-xs font-semibold text-slate-500">
                              {percentage}%
                            </span>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </motion.div>


        {/* =================================================
            BUDGET SUMMARY
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Budget Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current employee budget utilization
              </p>

            </div>

            <div className="rounded-xl bg-indigo-50 p-3">
              <Wallet className="h-5 w-5 text-indigo-600" />
            </div>

          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {budgets
              .slice(0, 6)
              .map((budget) => {

                const utilization = Number(
                  budget.utilization_percentage || 0
                );

                const isOver = utilization > 100;

                const isWarning =
                  utilization >= 80 &&
                  utilization <= 100;

                return (
                  <div
                    key={
                      budget.id ||
                      budget.employee_name
                    }
                    className="rounded-xl border border-slate-200 p-4"
                  >

                    <div className="flex items-center justify-between">

                      <p className="truncate text-sm font-semibold text-slate-700">
                        {budget.employee_name}
                      </p>

                      <span
                        className={`text-xs font-bold ${
                          isOver
                            ? "text-rose-600"
                            : isWarning
                            ? "text-orange-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {utilization.toFixed(0)}%
                      </span>

                    </div>


                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full ${
                          isOver
                            ? "bg-rose-500"
                            : isWarning
                            ? "bg-orange-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            utilization,
                            100
                          )}%`,
                        }}
                      />

                    </div>


                    <div className="mt-3 flex justify-between text-[11px] text-slate-400">

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

          </div>

        </motion.div>

      </div>

    </DashboardLayout>
  );
}