using System.Security.Claims;
using ChessProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChessProject.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;

    public GamesController(IGameService gameService)
    {
        _gameService = gameService;
    }

    // POST api/games (Tạo phòng)
    [Authorize] // Bắt buộc phải có Token hợp lệ
    [HttpPost]
    public async Task<IActionResult> CreateGame()
    {
        try
        {
            // Lấy ID của user hiện tại từ Token (Claim "sub" mà ta đã cấu hình trong AuthService)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                // Fallback nếu ClaimTypes.NameIdentifier không hoạt động, thử tìm theo "sub" hoặc tên claim bạn đã dùng
                userId = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }

            if (userId == null) return Unauthorized();

            var game = await _gameService.CreateGameAsync(userId);
            return Ok(game);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/games/waiting (Lấy danh sách phòng chờ)
    [HttpGet("waiting")]
    public async Task<IActionResult> GetWaitingGames()
    {
        var games = await _gameService.GetWaitingGamesAsync();
        return Ok(games);
    }
}