import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user = await login(email, password);

      toast.success(`Welcome back, ${user.username}`);

      if (user.role === "EMPLOYEE") {
        navigate("/employee");
      } else if (user.role === "MANAGER") {
        navigate("/manager");
      } else if (user.role === "FINANCE") {
        navigate("/finance");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <Receipt className="h-7 w-7 text-slate-950" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            ClaimFlow
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Smart expense management
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage your expenses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}

              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">
              Demo credentials
            </p>

            <p className="mt-1">
              Password: <span className="font-mono">Demo@123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}