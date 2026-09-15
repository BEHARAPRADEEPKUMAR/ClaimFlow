import { useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";


export default function ManagerClaims() {

    const navigate = useNavigate();

    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClaims = async () => {

        try {

            const response = await api.get(
                "/approvals/"
            );

            setClaims(response.data);

        } catch (error) {

            console.error(
                "MANAGER CLAIMS ERROR:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.detail ||
                "Unable to load manager claims."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const getStatusClass = (status) => {

        if (status === "SUBMITTED") {
            return "bg-amber-50 text-amber-700";
        }

        if (status === "UNDER_REVIEW") {
            return "bg-blue-50 text-blue-700";
        }

        return "bg-slate-100 text-slate-600";
    };


    return (
        <DashboardLayout>

            <div className="space-y-6">

                {/* Header */}

                <div>

                    <p className="text-sm font-medium text-indigo-600">
                        Finance Department
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-slate-900">
                        Manager Claims
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Review and approve claims submitted by managers.
                    </p>

                </div>


                {/* Table */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {loading ? (

                        <div className="flex items-center justify-center py-20">

                            <Loader2
                                className="animate-spin text-indigo-600"
                                size={28}
                            />

                        </div>

                    ) : claims.length === 0 ? (

                        <div className="py-20 text-center">

                            <p className="font-medium text-slate-700">
                                No manager claims pending.
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                You're all caught up.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-slate-100 bg-slate-50">

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Claim
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Manager
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Merchant
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {claims.map((claim) => (

                                        <tr
                                            key={claim.id}
                                            className="hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4">

                                                <p className="font-semibold text-slate-900">
                                                    {claim.claim_number}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {claim.category_display ||
                                                        claim.category}
                                                </p>

                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-700">

                                                {claim.employee_name}

                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-700">

                                                {claim.merchant}

                                            </td>


                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">

                                                ₹{Number(
                                                    claim.amount
                                                ).toLocaleString("en-IN")}

                                            </td>


                                            <td className="px-6 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                        claim.status
                                                    )}`}
                                                >
                                                    {claim.status_display ||
                                                        claim.status}
                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-right">

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/finance/manager-claims/${claim.id}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                                >

                                                    <Eye size={16} />

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

            </div>

        </DashboardLayout>
    );
}