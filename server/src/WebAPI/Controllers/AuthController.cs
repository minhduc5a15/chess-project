using ChessProject.Application.DTOs;
using ChessProject.Application.Services;
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

            return Ok(new { Token = token });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Unauthorized(new { message = e.Message });
        }
    }
}