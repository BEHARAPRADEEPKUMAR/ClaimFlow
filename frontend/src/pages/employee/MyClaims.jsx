import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Eye,
  Filter,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ClaimStatusBadge from "../../components/claims/ClaimStatusBadge";

export default function MyClaims() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await api.get("/claims/");
      setClaims(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load claims");
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        claim.claim_number
          ?.toLowerCase()
          .includes(searchText) ||
        claim.merchant
          ?.toLowerCase()
          .includes(searchText) ||
        claim.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        status === "ALL" || claim.status === status;

      const matchesCategory =
        category === "ALL" ||
        claim.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [claims, search, status, category]);

  const submitClaim = async (claimId) => {
    try {
      await api.post(`/claims/${claimId}/submit/`);

      toast.success("Claim submitted successfully");

      loadClaims();
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to submit claim"
      );
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Expenses
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            My Claims
          </h1>

          <p className="mt-2 text-slate-500">
            Track and manage all your expense claims.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/employee/claims/new")
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New Claim
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="All Claims"
          value={claims.length}
        />

        <SummaryCard
          label="Pending"
          value={
            claims.filter((claim) =>
              ["SUBMITTED", "UNDER_REVIEW"].includes(
                claim.status
              )
            ).length
          }
        />

        <SummaryCard
          label="Approved"
          value={
            claims.filter(
              (claim) => claim.status === "APPROVED"
            ).length
          }
        />

        <SummaryCard
          label="Paid"
          value={
            claims.filter(
              (claim) => claim.status === "PAID"
            ).length
          }
        />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search claim number, merchant..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none"
            >
              <option value="ALL">
                All Statuses
              </option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">
                Submitted
              </option>
              <option value="UNDER_REVIEW">
                Under Review
              </option>
              <option value="APPROVED">
                Approved
              </option>
              <option value="REJECTED">
                Rejected
              </option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
          >
            <option value="ALL">
              All Categories
            </option>
            <option value="TRAVEL">Travel</option>
            <option value="MEALS">Meals</option>
            <option value="SUPPLIES">
              Supplies
            </option>
            <option value="TAXI">Taxi</option>
            <option value="ACCOMMODATION">
              Accommodation
            </option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading your claims...
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Search className="h-5 w-5 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No claims found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or create a
              new claim.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <TableHead>Claim</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {claim.claim_number}
                        </span>

                        {claim.duplicate_flag && (
                          <span
                            title="Possible duplicate claim"
                            className="text-amber-500"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {claim.merchant}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {claim.category_display ||
                          claim.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {claim.expense_date}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹
                      {Number(
                        claim.amount
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <ClaimStatusBadge
                        status={claim.status}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          title="View claim"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {claim.status ===
                          "DRAFT" && (
                          <button
                            title="Submit claim"
                            onClick={() =>
                              submitClaim(
                                claim.id
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}