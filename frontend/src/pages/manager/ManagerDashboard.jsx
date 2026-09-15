import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  IndianRupee,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/dashboard/StatCard";
import ClaimStatusBadge from "../../components/claims/ClaimStatusBadge";

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovalQueue();
  }, []);

  const loadApprovalQueue = async () => {
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

  const pendingClaims = claims.filter((claim) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(
      claim.status
    )
  );

  const pendingAmount = pendingClaims.reduce(
    (sum, claim) => sum + Number(claim.amount || 0),
    0
  );

  const approved = claims.filter(
    (claim) => claim.status === "APPROVED"
  );

  const rejected = claims.filter(
    (claim) => claim.status === "REJECTED"
  );

  const employees = new Set(
    claims
      .map((claim) => claim.employee_name)
      .filter(Boolean)
  ).size;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Manager Workspace
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Team Expenses
        </h1>

        <p className="mt-2 text-slate-500">
          Review expense claims submitted by your team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Pending Review"
          value={pendingClaims.length}
          subtitle="Claims waiting for action"
          icon={Clock3}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Pending Amount"
          value={`₹${pendingAmount.toLocaleString(
            "en-IN"
          )}`}
          subtitle="Awaiting approval"
          icon={IndianRupee}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Approved"
          value={approved.length}
          subtitle="Approved claims"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Team Members"
          value={employees}
          subtitle="Employees with claims"
          icon={Users}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Approval Queue */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="font-semibold text-slate-950">
              Approval Queue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Claims requiring your attention.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/manager/approvals")
            }
            className="text-sm font-semibold text-slate-700 hover:text-slate-950"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading approval queue...
          </div>
        ) : pendingClaims.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              All caught up
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no claims waiting for your review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <TableHead>Claim</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {pendingClaims
                  .slice(0, 5)
                  .map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {claim.claim_number}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {claim.employee_name}
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
                          className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
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

      {/* Quick information */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileCheck2 className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Approval workflow
              </h3>

              <p className="text-sm text-slate-500">
                Review claims before finance processes
                reimbursement.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <WorkflowStep
              number="1"
              text="Employee submits claim"
            />

            <WorkflowStep
              number="2"
              text="Manager reviews claim"
            />

            <WorkflowStep
              number="3"
              text="Manager approves or rejects"
            />

            <WorkflowStep
              number="4"
              text="Approved claim goes to Finance"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm text-slate-400">
            Manager protection
          </p>

          <h3 className="mt-2 text-xl font-bold">
            Separation of duties
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Managers can approve only claims belonging
            to their assigned team. A manager cannot
            approve their own expense claim.
          </p>
        </div>
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

function WorkflowStep({ number, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
        {number}
      </span>

      <span className="text-slate-600">
        {text}
      </span>
    </div>
  );
}