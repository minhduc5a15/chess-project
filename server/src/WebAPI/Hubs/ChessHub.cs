using ChessProject.Application.Services; // Thêm using
using Microsoft.AspNetCore.SignalR;

namespace ChessProject.WebAPI.Hubs;

public class ChessHub : Hub
{
    private readonly IGameService _gameService;

    // Inject GameService vào Hub
    public ChessHub(IGameService gameService)
    {
        _gameService = gameService;
    }

    public async Task JoinGame(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
    }

    public async Task LeaveGame(string gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
    }

    // Cập nhật: Nhận thêm FEN mới để lưu vào DB
    public async Task SendMove(string gameId, string moveUCI, string newFen)
    {
        // 1. Lưu trạng thái mới vào Database
        if (Guid.TryParse(gameId, out var gId))
        {
            await _gameService.UpdateGameFenAsync(gId, newFen);
        }

        // 2. Gửi nước đi và FEN mới cho đối thủ để họ cập nhật bàn cờ
        await Clients.Group(gameId).SendAsync("ReceiveMove", moveUCI, newFen);
    }
}