using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using ChessProject.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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

    // 1. GET: api/users (Admin)
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
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

    // 2. DELETE: api/users/{id} (Admin)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == id.ToString())
        {
            return BadRequest(new { message = "Cannot delete yourself" });
        }

        await _userRepository.DeleteAsync(id);
        return Ok(new { message = "User deleted successfully" });
    }

    // 3. POST: api/users/avatar
    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        if (!file.ContentType.StartsWith("image/"))
            return BadRequest(new { message = "Only image files are allowed" });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
        if (user == null) return NotFound();

        var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var request = HttpContext.Request;
        var baseUrl = $"{request.Scheme}://{request.Host}";
        user.AvatarUrl = $"{baseUrl}/uploads/{uniqueFileName}";

        await _userRepository.UpdateAsync(user);

        return Ok(new { avatarUrl = user.AvatarUrl });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] ChessProject.Application.DTOs.UpdateProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) userId = User.FindFirstValue("sub");
        if (userId == null) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userId));
        if (user == null) return NotFound();

        user.Bio = dto.Bio;
        await _userRepository.UpdateAsync(user);

        return Ok(new { message = "Profile updated successfully", bio = user.Bio });
    }

    // GET api/users/{username} - get profile
    [HttpGet("{username}")]
    public async Task<IActionResult> GetUserProfile(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null) return NotFound(new { message = "User not found" });

        return Ok(new
        {
            user.Id,
            user.Username,
            user.Role,
            user.AvatarUrl,
            user.Bio,
            user.CreatedAt
        });
    }

    // GET api/users/by-username/{username} - lookup id for invite
    [HttpGet("by-username/{username}")]
    public async Task<IActionResult> GetByUsername(string username)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null) return NotFound();

        return Ok(new { id = user.Id.ToString(), username = user.Username });
    }
}