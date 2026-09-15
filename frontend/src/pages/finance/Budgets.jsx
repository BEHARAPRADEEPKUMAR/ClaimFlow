import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    IndianRupee,
    Loader2,
    TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";


function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    })}`;
}


function getUsage(spent, limit) {
    if (!limit || Number(limit) <= 0) {
        return 0;
    }

    return (Number(spent || 0) / Number(limit)) * 100;
}


function getBudgetStatus(usage) {
    if (usage > 100) {
        return {
            label: "Over Budget",
            className: "bg-red-50 text-red-700",
        };
    }

    if (usage >= 80) {
        return {
            label: "Near Limit",
            className: "bg-amber-50 text-amber-700",
        };
    }

    return {
        label: "Healthy",
        className: "bg-emerald-50 text-emerald-700",
    };
}


export default function Budgets() {

    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchBudgets = async () => {

        try {

            const response = await api.get(
                "/analytics/budgets/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setBudgets(data);

        } catch (error) {

            console.error(
                "BUDGET ERROR:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.detail ||
                "Unable to load budgets."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchBudgets();
    }, []);


    // =====================================================
    // SUMMARY
    // =====================================================

    const summary = useMemo(() => {

        let totalLimit = 0;
        let totalSpent = 0;

        budgets.forEach((budget) => {

            totalLimit += Number(
                budget.limit || 0
            );

            totalSpent += Number(
                budget.spent || 0
            );

        });

        const remaining =
            totalLimit - totalSpent;

        const utilization =
            totalLimit > 0
                ? (totalSpent / totalLimit) * 100
                : 0;

        const overBudget = budgets.filter(
            (budget) =>
                Number(budget.spent || 0) >
                Number(budget.limit || 0)
        ).length;

        const nearLimit = budgets.filter(
            (budget) => {

                const usage = getUsage(
                    budget.spent,
                    budget.limit
                );

                return usage >= 80 && usage <= 100;
            }
        ).length;

        return {
            totalLimit,
            totalSpent,
            remaining,
            utilization,
            overBudget,
            nearLimit,
        };

    }, [budgets]);


    return (

        <DashboardLayout>

            <div className="space-y-6">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div>

                    <p className="text-sm font-medium text-indigo-600">
                        Finance Department
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Budgets
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor employee monthly spending against allocated budgets.
                    </p>

                </div>


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    {/* Total Budget */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Total Budget
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {formatCurrency(
                                        summary.totalLimit
                                    )}
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                                <IndianRupee size={21} />

                            </div>

                        </div>

                    </div>


                    {/* Total Spent */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Total Spent
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {formatCurrency(
                                        summary.totalSpent
                                    )}
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                <TrendingUp size={21} />

                            </div>

                        </div>

                    </div>


                    {/* Remaining */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Remaining
                                </p>

                                <p
                                    className={`mt-2 text-2xl font-bold ${
                                        summary.remaining < 0
                                            ? "text-red-600"
                                            : "text-emerald-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        summary.remaining
                                    )}
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

                                <CheckCircle2 size={21} />

                            </div>

                        </div>

                    </div>


                    {/* Alerts */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Budget Alerts
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {summary.overBudget +
                                        summary.nearLimit}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    {summary.overBudget} over ·{" "}
                                    {summary.nearLimit} near limit
                                </p>

                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                                <AlertTriangle size={21} />

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    OVERALL UTILIZATION
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Overall Budget Utilization
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Total employee spending compared with allocated limits.
                            </p>

                        </div>

                        <p className="text-xl font-bold text-slate-900">
                            {summary.utilization.toFixed(1)}%
                        </p>

                    </div>


                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

                        <div
                            className={`h-full rounded-full transition-all ${
                                summary.utilization > 100
                                    ? "bg-red-500"
                                    : summary.utilization >= 80
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            }`}
                            style={{
                                width: `${Math.min(
                                    summary.utilization,
                                    100
                                )}%`,
                            }}
                        />

                    </div>

                </div>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {budgets.some(
                    (budget) =>
                        getUsage(
                            budget.spent,
                            budget.limit
                        ) >= 80
                ) && (

                    <div className="grid gap-4 md:grid-cols-2">

                        {budgets
                            .filter(
                                (budget) =>
                                    getUsage(
                                        budget.spent,
                                        budget.limit
                                    ) >= 80
                            )
                            .map((budget) => {

                                const usage = getUsage(
                                    budget.spent,
                                    budget.limit
                                );

                                const over =
                                    Number(budget.spent || 0) >
                                    Number(budget.limit || 0);

                                return (

                                    <div
                                        key={`${budget.employee_id || budget.employee_name}-${budget.month}`}
                                        className={`rounded-2xl border p-5 ${
                                            over
                                                ? "border-red-200 bg-red-50"
                                                : "border-amber-200 bg-amber-50"
                                        }`}
                                    >

                                        <div className="flex items-start gap-3">

                                            <AlertTriangle
                                                size={21}
                                                className={
                                                    over
                                                        ? "text-red-600"
                                                        : "text-amber-600"
                                                }
                                            />

                                            <div>

                                                <p
                                                    className={`font-bold ${
                                                        over
                                                            ? "text-red-800"
                                                            : "text-amber-800"
                                                    }`}
                                                >
                                                    {over
                                                        ? "Over Budget"
                                                        : "Near Budget Limit"}
                                                </p>

                                                <p
                                                    className={`mt-1 text-sm ${
                                                        over
                                                            ? "text-red-700"
                                                            : "text-amber-700"
                                                    }`}
                                                >
                                                    {budget.employee_name ||
                                                        "Employee"} has used{" "}
                                                    {usage.toFixed(1)}% of the
                                                    monthly budget.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                );
                            })}

                    </div>

                )}


                {/* =================================================
                    BUDGET TABLE
                ================================================= */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <h2 className="font-bold text-slate-900">
                            Employee Budget Performance
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Monthly spending and utilization by employee.
                        </p>

                    </div>


                    {loading ? (

                        <div className="flex min-h-[300px] items-center justify-center">

                            <Loader2
                                size={30}
                                className="animate-spin text-indigo-600"
                            />

                        </div>

                    ) : budgets.length === 0 ? (

                        <div className="py-16 text-center">

                            <p className="font-semibold text-slate-700">
                                No budget data available.
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Budget information will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-slate-100 bg-slate-50">

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Employee
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Month
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Budget
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Spent
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Utilization
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {budgets.map(
                                        (budget, index) => {

                                            const usage =
                                                getUsage(
                                                    budget.spent,
                                                    budget.limit
                                                );

                                            const budgetStatus =
                                                getBudgetStatus(
                                                    usage
                                                );

                                            const remaining =
                                                Number(
                                                    budget.limit || 0
                                                ) -
                                                Number(
                                                    budget.spent || 0
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        budget.id ||
                                                        index
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >

                                                    {/* Employee */}

                                                    <td className="px-6 py-5">

                                                        <p className="font-semibold text-slate-900">
                                                            {budget.employee_name ||
                                                                "Employee"}
                                                        </p>

                                                        {budget.department && (

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {budget.department}
                                                            </p>

                                                        )}

                                                    </td>


                                                    {/* Month */}

                                                    <td className="px-6 py-5 text-sm text-slate-600">

                                                        {budget.month || "Current"}

                                                    </td>


                                                    {/* Limit */}

                                                    <td className="px-6 py-5 text-right text-sm font-semibold text-slate-900">

                                                        {formatCurrency(
                                                            budget.limit
                                                        )}

                                                    </td>


                                                    {/* Spent */}

                                                    <td className="px-6 py-5 text-right">

                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {formatCurrency(
                                                                budget.spent
                                                            )}
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-xs ${
                                                                remaining < 0
                                                                    ? "text-red-600"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            {remaining < 0
                                                                ? `${formatCurrency(
                                                                      Math.abs(
                                                                          remaining
                                                                      )
                                                                  )} over`
                                                                : `${formatCurrency(
                                                                      remaining
                                                                  )} left`}
                                                        </p>

                                                    </td>


                                                    {/* Utilization */}

                                                    <td className="px-6 py-5">

                                                        <div className="min-w-[150px]">

                                                            <div className="mb-2 flex items-center justify-between">

                                                                <span className="text-xs font-semibold text-slate-600">
                                                                    {usage.toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </span>

                                                            </div>

                                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                                                                <div
                                                                    className={`h-full rounded-full ${
                                                                        usage >
                                                                        100
                                                                            ? "bg-red-500"
                                                                            : usage >=
                                                                              80
                                                                            ? "bg-amber-500"
                                                                            : "bg-emerald-500"
                                                                    }`}
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            usage,
                                                                            100
                                                                        )}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Status */}

                                                    <td className="px-6 py-5">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${budgetStatus.className}`}
                                                        >
                                                            {budgetStatus.label}
                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>
    );
}