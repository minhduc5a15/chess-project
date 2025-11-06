using ChessProject.Application.DTOs;
using ChessProject.Core.Entities;
using ChessProject.Core.Interfaces;

namespace ChessProject.Application.Services;

public class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;

    public GameService(IGameRepository gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<GameDto> CreateGameAsync(string playerId)
    {
        var game = new Game
        {
            Id = Guid.NewGuid(),
            WhitePlayerId = playerId, // Mặc định người tạo cầm quân Trắng
            Status = "WAITING",
            CreatedAt = DateTime.UtcNow
        };

        await _gameRepository.AddAsync(game);

        return MapToDto(game);
    }

    public async Task<IEnumerable<GameDto>> GetWaitingGamesAsync()
    {
        var games = await _gameRepository.GetWaitingGamesAsync();
        return games.Select(MapToDto);
    }

    public async Task<GameDto?> GetGameByIdAsync(Guid gameId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        return game == null ? null : MapToDto(game);
    }

    public async Task<bool> JoinGameAsync(Guid gameId, string playerId)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);

        if (game == null || game.Status != "WAITING" || game.WhitePlayerId == playerId)
        {
            return false;
        }
        game.BlackPlayerId = playerId;
        game.Status = "PLAYING";
        await _gameRepository.UpdateAsync(game);
        return true;
    }

    public async Task UpdateGameFenAsync(Guid gameId, string newFen)
    {
        var game = await _gameRepository.GetByIdAsync(gameId);
        if (game != null)
        {
            game.FEN = newFen;

            await _gameRepository.UpdateAsync(game);
        }
    }

    // Hàm helper đơn giản để chuyển Entity -> DTO
    private static GameDto MapToDto(Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            WhitePlayerId = game.WhitePlayerId,
            BlackPlayerId = game.BlackPlayerId,
            FEN = game.FEN,
            Status = game.Status,
            CreatedAt = game.CreatedAt
        };
    }
}