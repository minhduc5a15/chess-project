import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../lib/axios";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // Gọi trực tiếp apiClient vì register không cần lưu state đăng nhập ngay
      await apiClient.post("/auth/register", { username, password });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-green-500">
          Tạo tài khoản
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
              minLength={3}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded font-bold transition disabled:opacity-50"
          >
            {isLoading ? "Đang tạo..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-gray-400">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-green-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
