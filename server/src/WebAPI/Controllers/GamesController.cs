using System.Security.Claims;
using ChessProject.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ChessProject.Core.Interfaces;

namespace ChessProject.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly IChatRepository _chatRepository;

    public GamesController(IGameService gameService, IChatRepository chatRepository)
    {
        _gameService = gameService;
        _chatRepository = chatRepository;
    }

    // POST api/games (Tạo phòng)
    [Authorize] // Bắt buộc phải có Token hợp lệ
    [HttpPost]
    public async Task<IActionResult> CreateGame()
    {
        try
        {
            // Lấy ID của user hiện tại từ Token (Claim "sub" đã cấu hình trong AuthService)
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

    // GET api/games/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetGame(Guid id)
    {
        var game = await _gameService.GetGameByIdAsync(id);
        if (game == null) return NotFound();
        return Ok(game);
    }

    [Authorize]
    [HttpPut("{id}/join")]
    public async Task<IActionResult> JoinGame(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        var success = await _gameService.JoinGameAsync(id, userId);

        if (!success)
        {
            return BadRequest(new { success, message = "Cannot join game (it might be full or you are the owner)." });
        }

        return Ok(new { message = "Joined game successfully" });
    }

    [HttpGet("{id}/messages")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        var messages = await _chatRepository.GetMessagesByGameIdAsync(id);
        return Ok(messages);
    }
}