import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import { userApi } from "../api/user-api";
import type { User } from "../types/user";

const AdminPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bảo vệ route: Chỉ Admin mới được vào
  useEffect(() => {
    if (user && user.role !== "Admin") {
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await userApi.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId)); // Update UI
    } catch (error) {
      alert("Không thể xóa user này!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-red-500">Admin Dashboard 🛡️</h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
        >
          ← Về Sảnh chờ
        </button>
      </header>

      <div className="max-w-5xl mx-auto bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Ngày tạo</th>
                <th className="px-6 py-4 font-bold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-gray-400">
                            {u.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-white">
                        {u.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          u.role === "Admin"
                            ? "bg-red-900/50 text-red-400"
                            : "bg-blue-900/50 text-blue-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {u.role !== "Admin" && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-400 hover:underline font-medium cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
