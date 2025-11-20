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
        var userId = Context.UserIdentifier;
        // 1. Lưu trạng thái mới vào Database
        if (Guid.TryParse(gameId, out var gId) && userId != null)
        {
            // Gọi Service để validate và thực hiện nước đi
            bool isValid = await _gameService.MakeMoveAsync(gId, moveUCI, userId);

            if (isValid)
            {
                // Nếu hợp lệ, lấy Game mới nhất để gửi FEN chuẩn về cho CẢ HAI client
                var game = await _gameService.GetGameByIdAsync(gId);
                if (game != null)
                {
                    // Gửi sự kiện UpdateBoard thay vì ReceiveMove để client sync theo server
                    await Clients.Group(gameId).SendAsync("UpdateBoard", game.FEN);
                }
            }
        }
    }
}