import { useEffect, useState } from "react";
import {
  Search,
  CreditCard,
  CheckCircle2,
  IndianRupee,
  CalendarDays,
  User,
  FileText,
  Loader2,
  Receipt,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../../services/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/finance/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Payment history error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load payment history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter((payment) => {
      return (
        payment.payment_reference
          ?.toLowerCase()
          .includes(query) ||
        payment.claim_number
          ?.toLowerCase()
          .includes(query) ||
        payment.employee_name
          ?.toLowerCase()
          .includes(query) ||
        payment.status
          ?.toLowerCase()
          .includes(query)
      );
    });

    setFilteredPayments(filtered);
  }, [search, payments]);

  const totalPaid = filteredPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const paidCount = filteredPayments.filter(
    (payment) => payment.status === "PAID"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Finance workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Payments
        </h1>

        <p className="mt-2 text-slate-500">
          View completed employee reimbursements and payment
          transactions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Transactions
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {filteredPayments.length}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3">
              <Receipt className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Paid
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalPaid.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Successful Payments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {paidCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search payment reference, claim, employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Payment table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completed reimbursement transactions.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payments...
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <CreditCard className="h-7 w-7 text-slate-500" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Payment transactions will appear here after claims
              are processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Claim
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Payment reference */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                          <CreditCard className="h-4 w-4 text-indigo-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {payment.payment_reference}
                          </p>

                          <p className="text-xs text-slate-400">
                            Transaction
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Claim */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />

                        <span className="text-sm font-medium text-slate-700">
                          {payment.claim_number}
                        </span>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {payment.employee_name}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 text-right">
                      <span className="font-bold text-slate-900">
                        ₹
                        {Number(payment.amount).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </td>

                    {/* Payment date */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        {payment.payment_date
                          ? new Date(
                              payment.payment_date
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {payment.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}