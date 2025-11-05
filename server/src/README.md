# Ghi chú Cài đặt Server (.NET 8) - Dự án Cờ vua

Tài liệu này tóm tắt các lệnh command line cần thiết để khởi tạo và cấu hình backend .NET 8 cho dự án.

## 1. Khởi tạo Cấu trúc Dự án (Clean Architecture)

Giả định đang ở thư mục `chess-project/server`.

```bash
# Tạo file Solution
dotnet new sln -n ChessProject

# Tạo thư mục src
mkdir src
cd src

# Tạo 4 project con
dotnet new classlib -n ChessProject.Core -o Core
dotnet new classlib -n ChessProject.Application -o Application
dotnet new classlib -n ChessProject.Infrastructure -o Infrastructure
dotnet new webapi -n ChessProject.WebAPI -o WebAPI

# Quay lại thư mục server
cd ..

# Thêm các project vào Solution
dotnet sln add src/Core/ChessProject.Core.csproj
dotnet sln add src/Application/ChessProject.Application.csproj
dotnet sln add src/Infrastructure/ChessProject.Infrastructure.csproj
dotnet sln add src/WebAPI/ChessProject.WebAPI.csproj

# Thiết lập quan hệ phụ thuộc (Project References)
dotnet add src/Application/ChessProject.Application.csproj reference src/Core/ChessProject.Core.csproj
dotnet add src/Infrastructure/ChessProject.Infrastructure.csproj reference src/Application/ChessProject.Application.csproj
dotnet add src/WebAPI/ChessProject.WebAPI.csproj reference src/Application/ChessProject.Application.csproj
dotnet add src/WebAPI/ChessProject.WebAPI.csproj reference src/Infrastructure/ChessProject.Infrastructure.csproj
```

## 2. Cài đặt Entity Framework Core (PostgreSQL)

Thống nhất sử dụng các gói thư viện phiên bản `8.0.4` để đảm bảo tương thích.

```bash
# Thêm driver PostgreSQL vào Infrastructure
dotnet add src/Infrastructure/ChessProject.Infrastructure.csproj package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.4

# Thêm EF Core Tools (để tạo migration) vào Infrastructure
dotnet add src/Infrastructure/ChessProject.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Tools --version 8.0.4

# Thêm EF Core Design (để startup project có thể chạy) vào WebAPI
dotnet add src/WebAPI/ChessProject.WebAPI.csproj package Microsoft.EntityFrameworkCore.Design --version 8.0.4
```

## 3. Tạo và Áp dụng Migration

Sau khi đã cấu hình `User.cs`, `AppDbContext.cs` và `Program.cs`:

```bash
# Dọn dẹp project (tùy chọn nhưng nên làm)
dotnet clean

# Tạo file migration đầu tiên
dotnet ef migrations add InitialCreate --project src/Infrastructure --startup-project src/WebAPI

# Áp dụng migration (tạo bảng) vào CSDL
dotnet ef database update --startup-project src/WebAPI
```

## 4. Cài đặt Thư viện Phụ trợ

```bash
# Thêm BCrypt để băm mật khẩu vào Application
dotnet add src/Application/ChessProject.Application.csproj package BCrypt.Net-Next

```

## 5. Chạy dự án

```bash
dotnet run --project src/WebAPI/ChessProject.WebAPI.csproj
```
