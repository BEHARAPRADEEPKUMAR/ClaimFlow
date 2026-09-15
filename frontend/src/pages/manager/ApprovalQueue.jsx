import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ClaimStatusBadge from "../../components/claims/ClaimStatusBadge";

export default function ApprovalQueue() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await api.get("/approvals/");
      setClaims(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter((claim) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      claim.claim_number
        ?.toLowerCase()
        .includes(searchValue) ||
      claim.employee_name
        ?.toLowerCase()
        .includes(searchValue) ||
      claim.merchant
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      status === "ALL" ||
      claim.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Manager Workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Approval Queue
        </h1>

        <p className="mt-2 text-slate-500">
          Review and approve expense claims from your
          team.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search employee, claim or merchant..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />
          </div>

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
                All Claims
              </option>

              <option value="SUBMITTED">
                Submitted
              </option>

              <option value="UNDER_REVIEW">
                Under Review
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading claims...
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No claims require review
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your approval queue is clear.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <TableHead>Claim</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {claim.claim_number}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {claim.employee_name}
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
                      <ClaimStatusBadge
                        status={claim.status}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          navigate(
                            `/manager/approvals/${claim.id}`
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </button>
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

function TableHead({ children }) {
  return (
    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </th>
  );
}