import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userApi } from "../api/user-api";
import { useAuthStore } from "../stores/auth-store";
import type { User } from "../types/user";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, updateUserAvatar } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bioContent, setBioContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Kiểm tra xem đây có phải là profile của chính mình không
  const isOwnProfile = currentUser?.username === profile?.username;

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        const data = await userApi.getUserProfile(username);
        setProfile(data);
        setBioContent(data.bio || "");
      } catch (error) {
        alert("Không tìm thấy người dùng!");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const newUrl = await userApi.uploadAvatar(file);

      // Cập nhật UI local
      setProfile((prev) => (prev ? { ...prev, avatarUrl: newUrl } : null));

      // Cập nhật Global Store nếu là chính mình
      updateUserAvatar(newUrl);

      alert("Đã đổi ảnh đại diện thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBio = async () => {
    setIsSaving(true);
    try {
      await userApi.updateProfile(bioContent);
      setProfile((prev) => (prev ? { ...prev, bio: bioContent } : null));
      setIsEditing(false);
      alert("Cập nhật giới thiệu thành công!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-gray-900 rounded-xl border border-gray-800 p-8 shadow-2xl">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white mb-6 cursor-pointer"
        >
          ← Quay lại
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cột Trái: Avatar & Info */}
          <div className="flex flex-col items-center gap-4 w-full md:w-1/3 shrink-0">
            <div className="relative group w-40 h-40">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-700 shadow-lg bg-gray-800">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-600">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <span className="text-sm font-bold text-white">
                    {isUploading ? "Đang tải..." : "Đổi Avatar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <h1 className="text-2xl font-bold">{profile.username}</h1>

            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm font-bold">
              {profile.role}
            </span>

            <p className="text-gray-500 text-xs">
              Tham gia:{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </p>
          </div>

          {/* Cột Phải: Bio & Editor */}
          <div className="flex-1 w-full bg-gray-800/30 p-6 rounded-xl border border-gray-700 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
              <h3 className="text-lg font-bold text-gray-300">Giới thiệu</h3>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
            </div>

            <div className="flex-1 text-gray-300">
              {isEditing ? (
                <div className="text-black bg-white rounded-lg overflow-hidden">
                  {/* EDITOR */}
                  <ReactQuill
                    theme="snow"
                    value={bioContent}
                    onChange={setBioContent}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["clean"],
                      ],
                    }}
                  />
                  <div className="flex gap-2 p-3 bg-gray-100 border-t">
                    <button
                      onClick={handleSaveBio}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu lại"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setBioContent(profile.bio || ""); // Reset nếu hủy
                      }}
                      className="px-4 py-1.5 bg-gray-500 text-white rounded text-sm font-bold hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div className="prose prose-invert max-w-none">
                  {profile.bio ? (
                    <div dangerouslySetInnerHTML={{ __html: profile.bio }} />
                  ) : (
                    <p className="italic text-gray-500">
                      Chưa có thông tin giới thiệu.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
