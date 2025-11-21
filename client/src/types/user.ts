export interface User {
  id: string;
  username: string;
  role: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}
