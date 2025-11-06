import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuthStore } from "./stores/auth-store";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import LobbyPage from "./pages/lobby-page";
import GamePage from "./pages/game-page";

// Component bảo vệ route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // Kiểm tra cookie ngay khi app tải
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route được bảo vệ */}
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<LobbyPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
