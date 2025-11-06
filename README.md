# Chess Web App — React.js + .NET

> **Mục tiêu:** Xây một trang web cờ vua realtime, sạch, dễ mở rộng — có login/register, JWT + bcrypt, tạo phòng, mời bạn, lưu lịch sử ván đấu, xử lý sự kiện cờ vua và tính ELO.

---

## Tổng quan

Một project demo/prototype để học và triển khai các kỹ năng fullstack: frontend React, backend .NET (ASP.NET Core Web API), auth bằng JWT và hash mật khẩu bằng bcrypt. Hướng tới trải nghiệm realtime (WebSocket / SignalR) để chơi trực tuyến, lưu lịch sử, xem lại ván đấu (PGN), và có hệ thống xếp hạng (ELO).

---

## Tính năng chính

- **Auth:** Đăng ký / Đăng nhập, mật khẩu hash bằng bcrypt, token JWT để xác thực API.
- **Quản lý người dùng:** Profile, avatar, trạng thái online/offline.
- **Matchmaking & Room:** Tạo phòng (public/private), mời bạn bè bằng link hoặc ID phòng, join/leave room.
- **Realtime game:** Đồng bộ trạng thái bàn cờ bằng WebSocket / SignalR, gửi/nhận nước đi, chat trong phòng.
- **Luật cờ & validation:** Kiểm tra hợp lệ nước đi, xử lý chiếu, chiếu hết, bế tắc, phong cấp (promotion), castle, en passant.
- **Lưu lịch sử ván đấu:** Lưu PGN + metadata (time control, result, player ids, elo change).
- **ELO:** Tính ELO cập nhật sau mỗi ván theo công thức chuẩn (ví dụ: Glicko hoặc Elo cơ bản).
- **Replay & Analysis:** Xem lại ván bằng PGN, step-by-step, highlight nước đi gợi ý.
- **Notification:** Invite, friend request, kết quả ván đấu.

---

## Kiến trúc & Tech Stack

- **Frontend:** React.js (hoặc Next.js), TypeScript, Redux / Zustand (state), React Router, Socket client.
- **Backend:** ASP.NET Core Web API (C#), Entity Framework Core, SignalR cho realtime.
- **Database:** PostgreSQL (hoặc MS SQL).
- **Auth & Security:** JWT (access token + refresh token), bcrypt (BCrypt.Net-Next), HTTPS.
- **Storage:** PGN & replays lưu trong DB; avatar có thể lưu S3 / Supabase Storage.
- **DevOps:** Có thể áp dụng nếu đủ thời gian.

---

## Cơ chế xác thực (Auth)

1. **Register:** user gửi email + password -> backend hash password bằng bcrypt -> lưu DB.
2. **Login:** so sánh hash bằng bcrypt -> phát JWT (access token TTL ngắn) và refresh token (longer TTL, lưu DB/Redis).
3. **Middleware:** mọi route cần auth kiểm tra header `Authorization: Bearer <token>` và verify JWT.
4. **Logout / Revoke:** xóa refresh token hoặc đánh dấu blacklist nếu cần.

**Thư viện (.NET):** `BCrypt.Net-Next`, `System.IdentityModel.Tokens.Jwt`, `Microsoft.AspNetCore.Authentication.JwtBearer`.

---

## Real-time Game Flow

- Khi tạo phòng: server tạo `Room` object (id, players[], fen, moveHistory[]).
- Player A mời B -> B nhận notification -> accept -> join.
- Khi player đi 1 nước: frontend gửi sự kiện `makeMove` tới SignalR hub với SAN/UCT/From-To; server validate bằng engine chess logic, cập nhật FEN và broadcast `moveMade` cho client trong room.
- Khi ván kết thúc: server tính kết quả, update elo của 2 người, lưu PGN + metadata.

---

## Luật cờ & validation

Không cần nhúng stockfish ban đầu, có thể implement validator riêng hoặc dùng thư viện: `chess.js` (frontend + node), hoặc port C# chess library (ví dụ `ChessDotNet`).

- Kiểm tra: hợp lệ nước đi, chiếu/chiếu hết, bế tắc, tái lập thế (threefold repetition), 50-move rule.
- Lưu PGN (Portable Game Notation) để replay.

---

## Tính ELO (ví dụ cơ bản)

- Sử dụng hệ Elo chuẩn:

  - ![Elo Expected Score](https://latex.codecogs.com/svg.latex?\color{cyan}E=\frac{1}{1+10^{\frac{R_{opponent}-R_{player}}{400}}})

  - ![Elo Update](https://latex.codecogs.com/svg.latex?\color{cyan}R_{new}=R_{old}+K(S-E))

- Chọn `K` theo mức kinh nghiệm (ví dụ 40 mới, 20 trung bình, 10 cao).
- Gợi ý: block update elo trong transaction khi lưu ván để tránh race.

---

## API endpoints mẫu

- `POST /api/auth/register` — đăng ký
- `POST /api/auth/login` — đăng nhập -> trả access + refresh
- `POST /api/auth/refresh` — refresh token
- `GET /api/auth/me` — info user
- `POST /api/rooms` — tạo phòng
- `POST /api/rooms/{id}/invite` — mời
- `GET /api/rooms/{id}/history` — lấy history ván
- `POST /api/games/{id}/move` — (optional REST) make move (chủ yếu qua SignalR)
- ...

---

## Cấu trúc thư mục gợi ý

```text
/server (dotnet)
  /src
    /Api
    /Core
    /Infrastructure
    /Domain
/client (react)
  /src
    /components
    /pages
    /hooks
    /services (api + socket)
/docs
  README.md
```

---

## Cài đặt cơ bản (dev)

1. Clone repo
2. `cd server` -> set connection string -> `dotnet ef database update`
3. `cd client` -> `npm install` -> `npm run dev`
4. Chạy server (`dotnet run`) và client, kết nối SignalR URL

---

## Nâng cao / Roadmap

- Tích hợp engine (Stockfish) để phân tích ván và gợi ý nước đi.
- Mobile-first UI / PWA.

---

**License:** MIT

Good luck. Play smart, code smarter.
