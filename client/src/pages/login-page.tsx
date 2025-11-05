import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/"); // Chuyển hướng về trang chủ (Lobby) sau khi login thành công
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
      console.log(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-500">
          Đăng nhập
        </h2>
        {error && (
          <div className="p-3 text-sm text-red-200 bg-red-900/50 rounded border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Username</label>
            <input
              type="text"
              required
              className="w-full p-3Bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold transition disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập ngay"}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
