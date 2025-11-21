using System.Security.Claims;
using ChessProject.Application.DTOs;
using ChessProject.Application.Services;
using ChessProject.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessProject.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository; // Khai báo Repository

    public AuthController(IAuthService authService, IUserRepository userRepository)
    {
        _authService = authService;
        _userRepository = userRepository;
    }

    [HttpPost("register")] // POST api/auth/register
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        try
        {
            await _authService.RegisterAsync(dto.Username, dto.Password);
            return Ok(new { Message = "User registered successfully." });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest(new { message = e.Message });
        }
    }

    [HttpPost("login")] // POST api/auth/login
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        try
        {
            var token = await _authService.LoginAsync(dto.Username, dto.Password);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(1)
            };

            Response.Cookies.Append("accessToken", token, cookieOptions);

            return Ok(new { message = "Login successful" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Unauthorized(new { message = e.Message });
        }
    }

    [HttpPost("logout")] // POST api/auth/logout
    public IActionResult Logout()
    {
        Response.Cookies.Delete("accessToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });
        return Ok(new { message = "Logged out" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // 1. Lấy ID từ Token
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Fallback cho trường hợp ID nằm ở claim "sub"
        if (string.IsNullOrEmpty(userIdString))
        {
            userIdString = User.FindFirstValue("sub");
        }

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        // 2. Truy vấn Database để lấy thông tin mới nhất (bao gồm AvatarUrl)
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null) return Unauthorized();

        // 3. Trả về đầy đủ thông tin
        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            role = user.Role,
            avatarUrl = user.AvatarUrl,
            createdAt = user.CreatedAt
        });
    }
}