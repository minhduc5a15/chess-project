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
    private readonly IUserRepository _userRepository;

    public GamesController(IGameService gameService, IChatRepository chatRepository, IUserRepository userRepository)
    {
        _gameService = gameService;
        _chatRepository = chatRepository;
        _userRepository = userRepository;
    }

    private async Task<IEnumerable<object>> EnrichWithUsernames(IEnumerable<ChessProject.Application.DTOs.GameDto> games)
    {
        var tasks = games.Select(async g =>
        {
            string? whiteUsername = null;
            string? blackUsername = null;

            if (!string.IsNullOrEmpty(g.WhitePlayerId) && Guid.TryParse(g.WhitePlayerId, out var w))
            {
                var u = await _userRepository.GetByIdAsync(w);
                whiteUsername = u?.Username;
            }

            if (!string.IsNullOrEmpty(g.BlackPlayerId) && Guid.TryParse(g.BlackPlayerId, out var b))
            {
                var u = await _userRepository.GetByIdAsync(b);
                blackUsername = u?.Username;
            }

            return new
            {
                g.Id,
                g.WhitePlayerId,
                WhiteUsername = whiteUsername,
                g.BlackPlayerId,
                BlackUsername = blackUsername,
                g.FEN,
                g.Status,
                g.CreatedAt,
                g.WhiteTimeRemainingMs,
                g.IncrementMs,
                g.BlackTimeRemainingMs,
                g.LastMoveAt,
                g.WinnerId,
                g.MoveHistory
            } as object;
        });

        var results = await Task.WhenAll(tasks);
        return results;
    }

    // POST api/games (Tạo phòng)
    public class CreateGameRequest
    {
        public int InitialMinutes { get; set; } = 10;
        public int IncrementSeconds { get; set; } = 0;
    }

    [Authorize] // Bắt buộc phải có Token hợp lệ
    [HttpPost]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameRequest? request)
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

            var minutes = request?.InitialMinutes ?? 10;
            var increment = request?.IncrementSeconds ?? 0;

            var game = await _gameService.CreateGameAsync(userId, minutes, increment);
            return Ok(game);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET api/games/waiting (Lấy danh sách phòng chờ)
    // Backwards-compatible: GET api/games/waiting
    [HttpGet("waiting")]
    public async Task<IActionResult> GetWaitingGames()
    {
        var games = await _gameService.GetWaitingGamesAsync();
        var enriched = await EnrichWithUsernames(games);
        return Ok(enriched);
    }

    // GET api/games?page=1&pageSize=10&status=WAITING|PLAYING|FINISHED
    [HttpGet]
    public async Task<IActionResult> GetGames(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = "WAITING")
    {
        status = status?.ToUpper() ?? "WAITING";

        var games = await _gameService.GetGamesByStatusAsync(page, pageSize, status);
        var enriched = await EnrichWithUsernames(games);
        return Ok(enriched);
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
    [HttpGet("my-waiting-room")]
    public async Task<IActionResult> GetMyWaitingGame()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        var game = await _gameService.GetWaitingGameByCreatorIdAsync(userId);
        if (game == null) return NotFound(new { message = "No waiting game found." });
        var enriched = await EnrichWithUsernames(new[] { game });
        return Ok(enriched.First());
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelGame(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        var game = await _gameService.GetGameByIdAsync(id);

        if (game == null || game.Status != "WAITING")
        {
            return NotFound(new { message = "Game not found or already started." });
        }


        // Delegate ownership/validation to service layer for security
        var success = await _gameService.DeleteGameAsync(id, userId);
        if (!success)
        {
            return BadRequest(new { message = "Không thể hủy phòng. Vui lòng kiểm tra trạng thái phòng hoặc quyền hạn." });
        }

        return Ok(new { message = "Game cancelled successfully" });
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