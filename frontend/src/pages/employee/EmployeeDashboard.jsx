import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleDollarSign,
  FileCheck2,
  Receipt,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get("/claims/");
      setClaims(response.data);
    } catch (error) {
      console.error("Failed to load claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const paidClaims = claims.filter(
    (claim) => claim.status === "PAID"
  );

  const totalSpent = paidClaims.reduce(
    (sum, claim) => sum + Number(claim.amount),
    0
  );

  const monthlyLimit = Number(user?.monthly_limit || 0);

  const remaining = Math.max(
    monthlyLimit - totalSpent,
    0
  );

  const chartData = paidClaims
    .slice()
    .reverse()
    .map((claim, index) => ({
      name: `Claim ${index + 1}`,
      amount: Number(claim.amount),
    }));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Employee Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Good afternoon, {user?.username} 👋
          </h1>

          <p className="mt-2 text-slate-500">
            Here's an overview of your expenses and claims.
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href =
              "/employee/claims/new";
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Receipt className="h-4 w-4" />
          New Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Spent"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          subtitle="Paid claims"
          icon={CircleDollarSign}
        />

        <StatCard
          title="Remaining Limit"
          value={`₹${remaining.toLocaleString("en-IN")}`}
          subtitle={`Monthly limit ₹${monthlyLimit.toLocaleString(
            "en-IN"
          )}`}
          icon={Wallet}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Total Claims"
          value={claims.length}
          subtitle="All submitted claims"
          icon={FileCheck2}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Paid Claims"
          value={paidClaims.length}
          subtitle="Successfully reimbursed"
          icon={Receipt}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                Spending Trend
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your recent paid expenses
              </p>
            </div>

            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>

          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    strokeWidth={2}
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No paid expenses yet.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Limit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Monthly Limit
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Expense utilization
          </p>

          <div className="mt-8">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-slate-950">
                {monthlyLimit
                  ? Math.min(
                      (totalSpent / monthlyLimit) * 100,
                      100
                    ).toFixed(0)
                  : 0}
                %
              </span>

              <span className="text-sm text-slate-500">
                used
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950 transition-all"
                style={{
                  width: `${
                    monthlyLimit
                      ? Math.min(
                          (totalSpent / monthlyLimit) *
                            100,
                          100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="mt-4 flex justify-between text-xs text-slate-500">
              <span>
                ₹{totalSpent.toLocaleString("en-IN")}
              </span>

              <span>
                ₹{monthlyLimit.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="font-semibold text-slate-950">
              Recent Claims
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest expense activity
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.href =
                "/employee/claims")
            }
            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Loading claims...
          </div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No claims found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">
                    Claim
                  </th>

                  <th className="px-6 py-4">
                    Merchant
                  </th>

                  <th className="px-6 py-4">
                    Category
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {claims.slice(0, 5).map((claim) => (
                  <tr
                    key={claim.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {claim.claim_number}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {claim.merchant}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {claim.category_display ||
                        claim.category}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹
                      {Number(
                        claim.amount
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {claim.status_display ||
                          claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}