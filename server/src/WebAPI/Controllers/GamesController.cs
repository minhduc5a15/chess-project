using System.Security.Claims;
using ChessProject.Application.DTOs;
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

    // POST api/games
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateGame([FromBody] CreateGameDto dto) // Thêm tham số dto
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userId == null) return Unauthorized();

            // Validate DTO
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var game = await _gameService.CreateGameAsync(userId, dto); // Truyền dto vào service
            return Ok(game);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("my-games")]
    public async Task<IActionResult> GetMyGames(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        if (string.IsNullOrEmpty(status)) status = "ALL";

        var result = await _gameService.GetUserGamesAsync(userId, status.ToUpper(), page, pageSize);
        return Ok(result);
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
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentGame()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        var game = await _gameService.GetActiveGameAsync(userId);

        if (game == null) return NoContent(); // 204: Không có game nào đang active

        return Ok(game);
    }

    [HttpGet]
    public async Task<IActionResult> GetGames(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9)
    {
        if (string.IsNullOrEmpty(status)) status = "WAITING";

        var validStatuses = new[] { "WAITING", "PLAYING", "FINISHED" };
        if (!validStatuses.Contains(status.ToUpper()))
        {
            return BadRequest(new { message = "Invalid status." });
        }

        var result = await _gameService.GetGamesByStatusAsync(status.ToUpper(), page, pageSize);
        return Ok(result);
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

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelGame(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (userId == null) return Unauthorized();

        var success = await _gameService.CancelGameAsync(id, userId);

        if (!success)
        {
            return BadRequest(new
                { message = "Cannot cancel game. Either you are not the owner or the game has started." });
        }

        return Ok(new { message = "Game cancelled successfully" });
    }
}