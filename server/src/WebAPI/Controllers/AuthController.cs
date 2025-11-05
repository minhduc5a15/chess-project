using System.Security.Claims;
using ChessProject.Application.DTOs;
using ChessProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessProject.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    public IActionResult GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = User.FindFirstValue(ClaimTypes.Name);
        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new { id = userId, username, role });
    }
}