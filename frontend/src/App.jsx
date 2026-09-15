import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import FinanceManagerClaimReview from "./pages/finance/FinanceManagerClaimReview";

import Login from "./pages/auth/Login";
import ManagerClaims from "./pages/finance/ManagerClaims";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MyClaims from "./pages/employee/MyClaims";
import CreateClaim from "./pages/employee/CreateClaim";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ApprovalQueue from "./pages/manager/ApprovalQueue";
import ClaimReview from "./pages/manager/ClaimReview";

import ReadyToPay from "./pages/finance/ReadyToPay";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Payments from "./pages/finance/Payments";
import Analytics from "./pages/finance/Analytics";

import Budgets from "./pages/finance/Budgets";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "MANAGER") {
      return <Navigate to="/manager" replace />;
    }

    if (user.role === "FINANCE") {
      return <Navigate to="/finance" replace />;
    }

    return <Navigate to="/employee" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === "MANAGER"
                  ? "/manager"
                  : user.role === "FINANCE"
                    ? "/finance"
                    : "/employee"
                : "/login"
            }
            replace
          />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* ========================= */}
      {/* EMPLOYEE */}
      {/* ========================= */}

      <Route
        path="/employee"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "MANAGER"]}
          >
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/claims"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "MANAGER"]}
          >
            <MyClaims />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/claims/new"
        element={
          <ProtectedRoute
            allowedRoles={["EMPLOYEE", "MANAGER"]}
          >
            <CreateClaim />
          </ProtectedRoute>
        }
      />

      {/* ========================= */}
      {/* MANAGER */}
      {/* ========================= */}

      <Route
        path="/manager"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/approvals"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ApprovalQueue />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/approvals/:id"
        element={
          <ProtectedRoute
            allowedRoles={["MANAGER"]}
          >
            <ClaimReview />
          </ProtectedRoute>
        }
      />

      {/* ========================= */}
      {/* FINANCE */}
      {/* ========================= */}

      <Route
        path="/finance"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-bold">
              404 - Page Not Found
            </h1>
          </div>
        }
      />
      <Route
        path="/finance/ready-to-pay"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <ReadyToPay />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/payments"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/ready-to-pay"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <ReadyToPay />
          </ProtectedRoute>
        }
      />

      <Route
        path="/finance/payments"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance/analytics"
        element={
          <ProtectedRoute allowedRoles={["FINANCE"]}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
          path="/finance/manager-claims"
          element={
              <ProtectedRoute allowedRoles={["FINANCE"]}>
                  <ManagerClaims />
              </ProtectedRoute>
          }
      />
      <Route
          path="/finance/manager-claims/:id"
          element={
              <ProtectedRoute allowedRoles={["FINANCE"]}>
                  <FinanceManagerClaimReview />
              </ProtectedRoute>
          }
      />
      <Route
          path="/finance/budgets"
          element={
              <ProtectedRoute allowedRoles={["FINANCE"]}>
                  <Budgets />
              </ProtectedRoute>
          }
      />
    </Routes>
  );
}