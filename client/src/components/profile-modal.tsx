import { useState } from "react";
import { userApi } from "../api/user-api";
import { useAuthStore } from "../stores/auth-store";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, updateUserAvatar } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Preview ảnh
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const newAvatarUrl = await userApi.uploadAvatar(file);
      updateUserAvatar(newAvatarUrl); // Cập nhật Store
      alert("Cập nhật ảnh đại diện thành công!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Hồ sơ cá nhân</h2>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 bg-gray-800">
            {preview || user.avatarUrl ? (
              <img
                src={preview || user.avatarUrl || ""}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.username}</p>
            <p className="text-sm text-blue-400 uppercase">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">Chọn ảnh</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700 cursor-pointer"
            />
          </label>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isUploading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
