import { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  IndianRupee,
  CalendarDays,
  User,
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "../../services/api";

export default function ReadyToPay() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);

      const response = await api.get("/finance/ready-to-pay/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setClaims(data);
      setFilteredClaims(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail ||
          "Unable to load ready-to-pay claims."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      setFilteredClaims(claims);
      return;
    }

    const filtered = claims.filter((claim) => {
      return (
        claim.claim_number?.toLowerCase().includes(query) ||
        claim.employee_name?.toLowerCase().includes(query) ||
        claim.merchant?.toLowerCase().includes(query) ||
        claim.category_display?.toLowerCase().includes(query)
      );
    });

    setFilteredClaims(filtered);
  }, [search, claims]);

  const processPayment = async (claim) => {
    const confirmed = window.confirm(
      `Process payment of ₹${Number(claim.amount).toLocaleString(
        "en-IN"
      )} for ${claim.employee_name}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(claim.id);

      await api.post(`/finance/${claim.id}/pay/`);

      toast.success(
        `Payment processed successfully for ${claim.claim_number}`
      );

      await fetchClaims();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.detail ||
          "Payment could not be processed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const totalAmount = filteredClaims.reduce(
    (sum, claim) => sum + Number(claim.amount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Finance workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Ready to Pay
        </h1>

        <p className="mt-2 text-slate-500">
          Process approved employee claims and complete reimbursements.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Approved Claims
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {filteredClaims.length}
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3">
              <CreditCard className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Amount to Pay
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                ₹{totalAmount.toLocaleString("en-IN")}
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
                Payment Status
              </p>

              <p className="mt-2 text-sm font-semibold text-emerald-600">
                Approved only
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
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search claim, employee, merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Approved Claims
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These claims have completed manager approval and are ready
            for reimbursement.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading approved claims...
            </div>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-emerald-50 p-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Nothing to pay
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              There are currently no approved claims waiting for
              payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Claim
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Merchant
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Expense Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim, index) => (
                  <motion.tr
                    key={claim.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Claim */}
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {claim.claim_number}
                        </p>

                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </span>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <User className="h-4 w-4" />
                        </div>

                        <span className="text-sm font-medium text-slate-700">
                          {claim.employee_name}
                        </span>
                      </div>
                    </td>

                    {/* Merchant */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-slate-400" />

                        <span className="text-sm text-slate-700">
                          {claim.merchant || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {claim.category_display ||
                          claim.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        {claim.expense_date}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 text-right">
                      <p className="text-base font-bold text-slate-900">
                        ₹
                        {Number(claim.amount).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => processPayment(claim)}
                        disabled={processingId === claim.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {processingId === claim.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Pay
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Important workflow note */}
      <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <div>
          <h3 className="font-semibold text-amber-900">
            Payment control
          </h3>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Only claims with an <strong>APPROVED</strong> status can
            be paid. Once payment succeeds, the claim becomes
            <strong> PAID</strong> and cannot move backwards in the
            workflow.
          </p>
        </div>
      </div>
    </div>
  );
}