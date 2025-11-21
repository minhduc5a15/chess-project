using ChessProject.Application.Services;
using Microsoft.AspNetCore.SignalR;
using ChessProject.Core.Interfaces;
using System.Security.Claims;
using ChessProject.Core.Entities;

namespace ChessProject.WebAPI.Hubs;

public class ChessHub : Hub
{
    private readonly IGameService _gameService;
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;

    // Inject GameService vào Hub
    public ChessHub(IGameService gameService, IChatRepository chatRepository, IUserRepository userRepository)
    {
        _gameService = gameService;
        _chatRepository = chatRepository;
        _userRepository = userRepository;
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

    public async Task SendMessage(string gameId, string messageContent)
    {
        if (string.IsNullOrWhiteSpace(messageContent)) return;

        var userIdString = Context.UserIdentifier;
        if (userIdString == null || !Guid.TryParse(gameId, out var gId)) return;

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdString));
        if (user == null) return;

        // 3. Tạo và lưu tin nhắn vào DB
        var chatMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            GameId = gId,
            UserId = user.Id,
            Username = user.Username,
            Content = messageContent,
            CreatedAt = DateTime.UtcNow
        };

        await _chatRepository.AddAsync(chatMessage);

        await Clients.Group(gameId).SendAsync("ReceiveMessage", new
        {
            username = user.Username,
            content = messageContent,
            createdAt = chatMessage.CreatedAt
        });
    }
}