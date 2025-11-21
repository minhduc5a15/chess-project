using System.Security.Claims;
using ChessProject.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessProject.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;

    public UsersController(IUserRepository userRepository, IWebHostEnvironment environment)
    {
        _userRepository = userRepository;
        _environment = environment;
    }

    // 1. GET: api/users (Chỉ Admin được xem danh sách)
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        // Ẩn PasswordHash khi trả về client
        var result = users.Select(u => new
        {
            u.Id,
            u.Username,
            u.Role,
            u.AvatarUrl,
            u.CreatedAt
        });
        return Ok(result);
    }

    // 2. DELETE: api/users/{id} (Chỉ Admin được xóa)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        // Không cho phép xóa chính mình (nếu cần)
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == id.ToString())
        {
            return BadRequest(new { message = "Cannot delete yourself" });
        }

        await _userRepository.DeleteAsync(id);
        return Ok(new { message = "User deleted successfully" });
    }

    // 3. POST: api/users/avatar (User tự upload avatar)
    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Validate loại file (chỉ ảnh)
        if (!file.ContentType.StartsWith("image/"))
            return BadRequest(new { message = "Only image files are allowed" });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Lấy ID từ Token
        if (userId == null) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
        if (user == null) return NotFound();

        // Tạo thư mục uploads nếu chưa có: server/src/WebAPI/wwwroot/uploads
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Tạo tên file độc nhất
        var uniqueFileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Lưu file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Cập nhật URL vào DB
        // URL sẽ là: https://localhost:port/uploads/filename.jpg
        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        user.AvatarUrl = $"{baseUrl}/uploads/{uniqueFileName}";

        await _userRepository.UpdateAsync(user);

        return Ok(new { avatarUrl = user.AvatarUrl });
    }
}