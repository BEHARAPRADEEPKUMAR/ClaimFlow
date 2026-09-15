import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  AlertTriangle,
  CalendarDays,
  Building2,
  IndianRupee,
  User,
  Receipt,
  Eye,
} from "lucide-react";

import { toast } from "sonner";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";


export default function ClaimReview() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] = useState(false);

  const [rejectComment, setRejectComment] = useState("");


  useEffect(() => {

    fetchClaim();

  }, [id]);


  const fetchClaim = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        `/claims/${id}/`
      );

      console.log(
        "Claim response:",
        response.data
      );

      setClaim(response.data);

    } catch (error) {

      console.error(
        "Fetch claim error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
        "Unable to load claim."
      );

    } finally {

      setLoading(false);

    }

  };


  const startReview = async () => {

    try {

      setProcessing(true);

      const response = await api.post(
        `/approvals/${id}/review/`
      );

      setClaim(response.data);

      toast.success(
        "Claim moved to review."
      );

    } catch (error) {

      console.error(
        "Start review error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
        "Unable to start review."
      );

    } finally {

      setProcessing(false);

    }

  };


  const approveClaim = async () => {

    try {

      setProcessing(true);

      const response = await api.post(
        `/approvals/${id}/approve/`,
        {
          comment:
            "Claim approved after bill verification.",
        }
      );

      setClaim(response.data);

      toast.success(
        "Claim approved successfully."
      );

      setTimeout(() => {

        navigate(
          "/manager/approvals"
        );

      }, 700);

    } catch (error) {

      console.error(
        "Approve error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
        "Unable to approve claim."
      );

    } finally {

      setProcessing(false);

    }

  };


  const rejectClaim = async () => {

    if (!rejectComment.trim()) {

      toast.error(
        "Please enter a rejection reason."
      );

      return;

    }


    try {

      setProcessing(true);

      const response = await api.post(
        `/approvals/${id}/reject/`,
        {
          comment:
            rejectComment.trim(),
        }
      );

      setClaim(response.data);

      toast.success(
        "Claim rejected."
      );

      setTimeout(() => {

        navigate(
          "/manager/approvals"
        );

      }, 700);

    } catch (error) {

      console.error(
        "Reject error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
        "Unable to reject claim."
      );

    } finally {

      setProcessing(false);

    }

  };


  if (loading) {

    return (

      <DashboardLayout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="text-sm text-slate-500">
              Loading claim...
            </p>

          </div>

        </div>

      </DashboardLayout>

    );

  }


  if (!claim) {

    return (

      <DashboardLayout>

        <div className="p-8 text-center">

          <h2 className="text-xl font-semibold text-slate-900">
            Claim not found
          </h2>

          <button
            onClick={() =>
              navigate(
                "/manager/approvals"
              )
            }
            className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to Approval Queue
          </button>

        </div>

      </DashboardLayout>

    );

  }


  /*
   * IMPORTANT
   *
   * Use receipt_url returned by Django.
   */

  const receiptUrl =
    claim.receipt_url;


  const receiptPath =
    claim.receipt_image || "";


  const isPdf =
    receiptPath
      .toLowerCase()
      .endsWith(".pdf");


  const fileName =
    receiptPath
      ? receiptPath.split("/").pop()
      : "Receipt";


  return (

    <DashboardLayout>

      <div className="mx-auto max-w-7xl space-y-6">


        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              onClick={() =>
                navigate(
                  "/manager/approvals"
                )
              }
              className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >

              <ArrowLeft size={17} />

              Back to Approval Queue

            </button>


            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">

                <Receipt size={21} />

              </div>


              <div>

                <h1 className="text-2xl font-bold text-slate-900">

                  Review {claim.claim_number}

                </h1>

                <p className="text-sm text-slate-500">

                  Verify the claim details and bill before approval.

                </p>

              </div>

            </div>

          </div>


          <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">

            {claim.status_display}

          </span>

        </div>


        {/* DUPLICATE WARNING */}

        {claim.duplicate_flag && (

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <div className="flex gap-3">

              <AlertTriangle
                className="text-amber-600"
                size={22}
              />

              <div>

                <h3 className="font-semibold text-amber-900">

                  Possible duplicate receipt detected

                </h3>


                <p className="mt-1 text-sm text-amber-800">

                  This claim appears similar to{" "}

                  <strong>
                    {claim.duplicate_claim_number ||
                      "an existing claim"}
                  </strong>.

                  Verify the bill carefully before approving.

                </p>

              </div>

            </div>

          </div>

        )}


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">


          {/* LEFT SIDE */}

          <div className="space-y-6 lg:col-span-2">


            {/* CLAIM DETAILS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                  <FileText size={19} />

                </div>


                <div>

                  <h2 className="font-semibold text-slate-900">
                    Claim Details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Information submitted by employee
                  </p>

                </div>

              </div>


              <div className="space-y-5">

                <DetailRow
                  icon={<User size={17} />}
                  label="Employee"
                  value={claim.employee_name}
                />

                <DetailRow
                  icon={<Building2 size={17} />}
                  label="Merchant"
                  value={claim.merchant}
                />

                <DetailRow
                  icon={<IndianRupee size={17} />}
                  label="Amount"
                  value={`₹${Number(
                    claim.amount
                  ).toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}`}
                  strong
                />

                <DetailRow
                  icon={<Receipt size={17} />}
                  label="Category"
                  value={
                    claim.category_display
                  }
                />

                <DetailRow
                  icon={<CalendarDays size={17} />}
                  label="Expense Date"
                  value={
                    claim.expense_date
                  }
                />

              </div>


              <div className="mt-6 border-t border-slate-100 pt-6">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                  Description

                </p>

                <p className="text-sm leading-6 text-slate-700">

                  {claim.description ||
                    "No description provided."}

                </p>

              </div>

            </div>


            {/* ACTION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="mb-4 font-semibold text-slate-900">

                Review Action

              </h2>


              {claim.status === "SUBMITTED" && (

                <button
                  onClick={startReview}
                  disabled={processing}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >

                  {processing
                    ? "Starting Review..."
                    : "Start Review"}

                </button>

              )}


              {claim.status === "UNDER_REVIEW" && (

                <div className="space-y-4">

                  <button
                    onClick={approveClaim}
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >

                    <CheckCircle2 size={18} />

                    {processing
                      ? "Processing..."
                      : "Approve Claim"}

                  </button>


                  <textarea
                    value={
                      rejectComment
                    }
                    onChange={(e) =>
                      setRejectComment(
                        e.target.value
                      )
                    }
                    placeholder="Reason for rejection..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />


                  <button
                    onClick={rejectClaim}
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >

                    <XCircle size={18} />

                    Reject Claim

                  </button>

                </div>

              )}


              {claim.status === "APPROVED" && (

                <div className="rounded-xl bg-emerald-50 p-5 text-center">

                  <CheckCircle2
                    className="mx-auto mb-2 text-emerald-600"
                    size={30}
                  />

                  <p className="font-semibold text-emerald-800">

                    Claim Approved

                  </p>

                  <p className="mt-1 text-xs text-emerald-700">

                    Ready for Finance.

                  </p>

                </div>

              )}

            </div>

          </div>


          {/* RIGHT SIDE — BILL */}

          <div className="lg:col-span-3">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


              {/* BILL HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                    <FileText
                      size={19}
                      className="text-blue-600"
                    />

                  </div>


                  <div>

                    <h2 className="font-semibold text-slate-900">

                      Bill / Receipt

                    </h2>

                    <p className="text-xs text-slate-500">

                      Verify the uploaded document

                    </p>

                  </div>

                </div>


                {receiptUrl && (

                  <div className="flex flex-wrap gap-2">

                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >

                      <ExternalLink size={15} />

                      Open

                    </a>


                    <a
                      href={receiptUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >

                      <Download size={15} />

                      Download

                    </a>

                  </div>

                )}

              </div>


              {/* BILL PREVIEW */}

              <div className="bg-slate-50 p-4">


                {!receiptUrl ? (

                  <div className="flex min-h-[650px] items-center justify-center">

                    <div className="text-center">

                      <AlertTriangle
                        className="mx-auto mb-3 text-amber-500"
                        size={35}
                      />

                      <h3 className="font-semibold text-slate-900">

                        No bill uploaded

                      </h3>

                      <p className="mt-1 text-sm text-slate-500">

                        This claim cannot be approved without a bill.

                      </p>

                    </div>

                  </div>

                ) : isPdf ? (

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    <iframe
                      src={receiptUrl}
                      title="Expense Bill PDF"
                      className="h-[500px] w-full sm:h-[650px] lg:h-[700px]"
                    />

                  </div>

                ) : (

                  <div className="flex min-h-[650px] items-center justify-center rounded-xl border border-slate-200 bg-white p-4">

                    <img
                      src={receiptUrl}
                      alt="Uploaded expense bill"
                      className="max-h-[700px] max-w-full rounded-lg object-contain"
                    />

                  </div>

                )}

              </div>


              {/* FILE INFO */}

              {receiptUrl && (

                <div className="border-t border-slate-100 px-5 py-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-medium text-slate-400">

                        Uploaded Bill

                      </p>

                      <p className="text-sm font-medium text-slate-700">

                        {fileName}

                      </p>

                    </div>


                    <div className="flex items-center gap-2 text-xs text-emerald-600">

                      <Eye size={15} />

                      Bill available for verification

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );
}


function DetailRow({
  icon,
  label,
  value,
  strong = false,
}) {

  return (

    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-xs font-medium text-slate-400">

          {label}

        </p>

        <p
          className={`mt-1 text-sm ${
            strong
              ? "font-bold text-slate-900"
              : "font-medium text-slate-700"
          }`}
        >

          {value || "-"}

        </p>

      </div>

    </div>

  );

}