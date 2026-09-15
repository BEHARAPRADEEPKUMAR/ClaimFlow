import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  IndianRupee,
  Loader2,
  Receipt,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";


const CATEGORY_OPTIONS = [
  {
    value: "TRAVEL",
    label: "Travel",
  },
  {
    value: "MEALS",
    label: "Meals",
  },
  {
    value: "SUPPLIES",
    label: "Supplies",
  },
  {
    value: "TAXI",
    label: "Taxi",
  },
  {
    value: "ACCOMMODATION",
    label: "Accommodation",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];


const initialFormData = {
  merchant: "",
  amount: "",
  expense_date: "",
  category: "OTHER",
  description: "",
  receipt_text: "",
};


export default function CreateClaim() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState(initialFormData);

  const [receiptText, setReceiptText] =
    useState("");

  const [receiptFile, setReceiptFile] =
    useState(null);

  const [extracting, setExtracting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [aiConfidence, setAiConfidence] =
    useState(null);

  const [aiSource, setAiSource] =
    useState(null);

  const [duplicateWarning, setDuplicateWarning] =
    useState(null);


  // ---------------------------------------
  // UPDATE FORM FIELD
  // ---------------------------------------

  const updateField = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // ---------------------------------------
  // RECEIPT TEXT
  // ---------------------------------------

  const handleReceiptTextChange = (
    event
  ) => {
    const value =
      event.target.value;

    setReceiptText(value);

    updateField(
      "receipt_text",
      value
    );
  };


  // ---------------------------------------
  // FILE VALIDATION
  // ---------------------------------------

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".pdf",
    ];

    const fileName =
      file.name.toLowerCase();

    const validExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(
            extension
          )
      );

    const validMimeType =
      allowedMimeTypes.includes(
        file.type
      );

    if (
      !validMimeType &&
      !validExtension
    ) {
      toast.error(
        "Only JPG, JPEG, PNG and PDF files are allowed."
      );

      event.target.value = "";
      return;
    }

    // Maximum 5 MB
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Bill / receipt must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setReceiptFile(file);

    toast.success(
      "Bill uploaded successfully."
    );
  };


  // ---------------------------------------
  // REMOVE FILE
  // ---------------------------------------

  const removeReceiptFile = () => {
    setReceiptFile(null);
  };


  // ---------------------------------------
  // FILE TYPE
  // ---------------------------------------

  const isPdf =
    receiptFile?.type ===
      "application/pdf" ||
    receiptFile?.name
      ?.toLowerCase()
      .endsWith(".pdf");


  // ---------------------------------------
  // AI RECEIPT EXTRACTION
  // ---------------------------------------

  const handleExtractReceipt =
    async () => {

      if (!receiptText.trim()) {
        toast.error(
          "Please paste receipt text first."
        );
        return;
      }

      try {
        setExtracting(true);

        const response =
          await api.post(
            "/claims/extract-receipt/",
            {
              receipt_text:
                receiptText.trim(),
            }
          );

        const data =
          response.data?.data;

        if (!data) {
          throw new Error(
            "No extraction data was returned."
          );
        }

        setFormData((prev) => ({
          ...prev,

          merchant:
            data.merchant ||
            prev.merchant,

          amount:
            data.amount !== null &&
            data.amount !== undefined
              ? String(data.amount)
              : prev.amount,

          expense_date:
            data.expense_date ||
            prev.expense_date,

          category:
            data.category ||
            prev.category,

          description:
            data.description ||
            prev.description,

          receipt_text:
            receiptText.trim(),
        }));

        setAiConfidence(
          data.confidence !== null &&
            data.confidence !== undefined
            ? Number(data.confidence)
            : null
        );

        setAiSource(
          data.source ||
          "AI extraction"
        );

        toast.success(
          "Receipt details extracted. Please verify the information."
        );

      } catch (error) {

        console.error(
          "Receipt extraction error:",
          error
        );

        toast.error(
          error.response?.data?.detail ||
            "Unable to extract receipt details."
        );

      } finally {
        setExtracting(false);
      }
    };


  // ---------------------------------------
  // VALIDATE FORM
  // ---------------------------------------

  const validateForm = () => {

    // BILL IS MANDATORY
    if (!receiptFile) {
      toast.error(
        "Please upload the bill / receipt before submitting."
      );
      return false;
    }

    if (!formData.merchant.trim()) {
      toast.error(
        "Merchant name is required."
      );
      return false;
    }

    if (!formData.amount) {
      toast.error(
        "Amount is required."
      );
      return false;
    }

    const amount =
      Number(formData.amount);

    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      toast.error(
        "Please enter a valid amount."
      );
      return false;
    }

    if (!formData.expense_date) {
      toast.error(
        "Expense date is required."
      );
      return false;
    }

    if (!formData.category) {
      toast.error(
        "Category is required."
      );
      return false;
    }

    if (!formData.description.trim()) {
      toast.error(
        "Description is required."
      );
      return false;
    }

    return true;
  };


  // ---------------------------------------
  // SUBMIT CLAIM
  // ---------------------------------------

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {

      setSubmitting(true);

      setDuplicateWarning(null);

      const payload =
        new FormData();

      payload.append(
        "merchant",
        formData.merchant.trim()
      );

      payload.append(
        "amount",
        formData.amount
      );

      payload.append(
        "expense_date",
        formData.expense_date
      );

      payload.append(
        "category",
        formData.category
      );

      payload.append(
        "description",
        formData.description.trim()
      );

      payload.append(
        "receipt_text",
        formData.receipt_text.trim()
      );

      // MANDATORY FILE
      payload.append(
        "receipt_image",
        receiptFile
      );

      const response = await api.post(
          "/claims/",
          payload
        );

        const claim = response.data;

        console.log("Created claim:", claim);


        // --------------------------------
        // DUPLICATE DETECTION
        // --------------------------------

        if (claim?.duplicate_flag) {

          setDuplicateWarning(claim);

          toast.warning(
            "Possible duplicate receipt detected. Claim was created but flagged."
          );

          return;
        }


        // --------------------------------
        // SUBMIT THE CLAIM
        // --------------------------------

        try {

          const submitResponse = await api.post(
            `/claims/${claim.id}/submit/`
          );

          console.log(
            "Submitted claim:",
            submitResponse.data
          );

          toast.success(
            "Claim submitted successfully."
          );

          navigate("/employee/claims");

        } catch (submitError) {

          console.error(
            "Claim submission error:",
            submitError
          );

          toast.error(
            submitError.response?.data?.detail ||
              "Claim was created but could not be submitted."
          );

        }

    } catch (error) {

      console.error(
        "Create claim error:",
        error
      );

      const errorData =
        error.response?.data;

      if (
        errorData?.receipt_image
      ) {

        const message =
          Array.isArray(
            errorData.receipt_image
          )
            ? errorData.receipt_image[0]
            : errorData.receipt_image;

        toast.error(message);

      } else if (
        errorData?.detail
      ) {

        toast.error(
          errorData.detail
        );

      } else if (
        errorData &&
        typeof errorData ===
          "object"
      ) {

        const firstError =
          Object.values(
            errorData
          )
            .flat()
            .find(
              (item) =>
                typeof item ===
                "string"
            );

        toast.error(
          firstError ||
            "Unable to create claim."
        );

      } else {

        toast.error(
          "Unable to create claim."
        );
      }

    } finally {

      setSubmitting(false);
    }
  };


  // ---------------------------------------
  // CANCEL
  // ---------------------------------------

  const handleCancel = () => {
    navigate(
      "/employee/claims"
    );
  };


  return (
    <DashboardLayout>

      <div className="mx-auto max-w-6xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-8">

          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />

            Back to My Claims
          </button>


          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">

              <Receipt size={21} />

            </div>


            <div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Expense Claim
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Upload your bill, verify the details and submit your expense.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================
            DUPLICATE WARNING
        ====================================== */}

        {duplicateWarning && (

          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">

                <AlertTriangle
                  size={20}
                />

              </div>


              <div className="flex-1">

                <div className="flex items-center justify-between gap-4">

                  <h3 className="font-semibold text-amber-900">
                    Possible Duplicate Receipt
                  </h3>


                  <button
                    type="button"
                    onClick={() =>
                      setDuplicateWarning(
                        null
                      )
                    }
                    className="text-amber-700 hover:text-amber-900"
                  >
                    <X size={18} />
                  </button>

                </div>


                <p className="mt-1 text-sm leading-6 text-amber-800">
                  This receipt appears similar to
                  an existing claim. The claim has
                  been flagged to prevent duplicate
                  payment.
                </p>


                {duplicateWarning
                  .duplicate_claim_number && (

                  <div className="mt-3 rounded-xl bg-white p-3">

                    <p className="text-xs text-slate-400">
                      Matching claim
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {
                        duplicateWarning
                          .duplicate_claim_number
                      }
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =====================================
              AI RECEIPT ASSISTANT
          ====================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">

                    <Sparkles size={20} />

                  </div>


                  <div>

                    <h2 className="text-lg font-semibold text-slate-900">
                      AI Receipt Assistant
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                      Paste whatever is written on
                      the receipt. ClaimFlow extracts
                      the expense details so you don't
                      have to enter everything manually.
                    </p>

                  </div>

                </div>


                {aiConfidence !== null && (

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                    <CheckCircle2
                      size={14}
                    />

                    {Math.round(
                      aiConfidence * 100
                    )}
                    % confidence

                  </div>

                )}

              </div>

            </div>


            <div className="p-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Receipt Text
              </label>


              <textarea
                value={receiptText}
                onChange={
                  handleReceiptTextChange
                }
                rows={8}
                placeholder={`Example:

UBER TRIP HYDERABAD
15/09/2026
Trip fare Rs 485
Paid by card
Thank you for riding with Uber`}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />


              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs text-slate-400">
                    AI results are suggestions.
                    Always verify and correct them
                    before submitting.
                  </p>


                  {aiSource && (

                    <p className="mt-1 text-xs text-slate-400">
                      Source:{" "}
                      <span className="font-medium text-slate-500">
                        {aiSource}
                      </span>
                    </p>

                  )}

                </div>


                <button
                  type="button"
                  onClick={
                    handleExtractReceipt
                  }
                  disabled={
                    extracting ||
                    !receiptText.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {extracting ? (

                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Extracting...
                    </>

                  ) : (

                    <>
                      <Sparkles
                        size={17}
                      />

                      Extract with AI
                    </>

                  )}

                </button>

              </div>

            </div>

          </section>


          {/* =====================================
              VERIFY CLAIM DETAILS
          ====================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                  <FileText size={18} />

                </div>


                <div>

                  <h2 className="font-semibold text-slate-900">
                    Verify Claim Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review and correct the information
                    extracted from your receipt.
                  </p>

                </div>

              </div>

            </div>


            <div className="grid gap-6 p-6 md:grid-cols-2">

              {/* MERCHANT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Merchant
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>


                <input
                  type="text"
                  value={
                    formData.merchant
                  }
                  onChange={(e) =>
                    updateField(
                      "merchant",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Uber"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />

              </div>


              {/* AMOUNT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Amount
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>


                <div className="relative">

                  <IndianRupee
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />


                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={
                      formData.amount
                    }
                    onChange={(e) =>
                      updateField(
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                </div>

              </div>


              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Expense Date
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>


                <div className="relative">

                  <Calendar
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />


                  <input
                    type="date"
                    value={
                      formData.expense_date
                    }
                    onChange={(e) =>
                      updateField(
                        "expense_date",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                </div>

              </div>


              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>


                <select
                  value={
                    formData.category
                  }
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >

                  {CATEGORY_OPTIONS.map(
                    (category) => (

                      <option
                        key={
                          category.value
                        }
                        value={
                          category.value
                        }
                      >
                        {
                          category.label
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>


                <textarea
                  value={
                    formData.description
                  }
                  onChange={(e) =>
                    updateField(
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the business purpose of this expense..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />


                <p className="mt-1 text-right text-xs text-slate-400">
                  {
                    formData.description.length
                  }
                  /500
                </p>

              </div>

            </div>

          </section>


          {/* =====================================
              MANDATORY BILL UPLOAD
          ====================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">

                  <Upload size={18} />

                </div>


                <div>

                  <h2 className="font-semibold text-slate-900">
                    Bill / Receipt
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload the original bill before
                    submitting your claim.
                  </p>

                </div>

              </div>

            </div>


            <div className="p-6">

              {!receiptFile ? (

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-slate-400 hover:bg-slate-100">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">

                    <Upload size={22} />

                  </div>


                  <p className="text-sm font-semibold text-slate-700">
                    Upload your bill
                  </p>


                  <p className="mt-1 text-xs text-slate-400">
                    JPG, JPEG, PNG or PDF
                  </p>


                  <p className="mt-1 text-xs text-slate-400">
                    Maximum file size: 5 MB
                  </p>


                  <p className="mt-3 text-xs font-semibold text-red-500">
                    Bill upload is mandatory
                  </p>


                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                </label>

              ) : (

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

                        {isPdf ? (
                          <FileText
                            size={20}
                          />
                        ) : (
                          <Receipt
                            size={20}
                          />
                        )}

                      </div>


                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {
                            receiptFile.name
                          }
                        </p>


                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">

                          <span className="font-medium text-emerald-700">
                            Bill attached
                          </span>

                          <span className="text-slate-400">
                            •
                          </span>

                          <span className="text-slate-500">
                            {(
                              receiptFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </span>

                          <span className="text-slate-400">
                            •
                          </span>

                          <span className="uppercase text-slate-500">
                            {isPdf
                              ? "PDF"
                              : "IMAGE"}
                          </span>

                        </div>

                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={
                        removeReceiptFile
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
                    >
                      <X size={18} />
                    </button>

                  </div>

                </div>

              )}

            </div>

          </section>


          {/* =====================================
              SUBMIT ACTIONS
          ====================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                submitting ||
                !receiptFile
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {submitting ? (

                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Creating Claim...
                </>

              ) : (

                <>
                  <CheckCircle2
                    size={17}
                  />

                  Create Claim
                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}