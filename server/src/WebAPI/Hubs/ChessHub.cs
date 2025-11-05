using Microsoft.AspNetCore.SignalR;

namespace ChessProject.WebAPI.Hubs;

public class ChessHub : Hub
{
    // Cho phép client tham gia vào một nhóm cụ thể 
    public async Task JoinGame(string gameId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        // Có thể gửi thông báo cho những người khác trong phòng rằng có người mới vào
        // await Clients.Group(gameId).SendAsync("UserJoined", Context.ConnectionId);
    }

    // Rời khỏi phòng 
    public async Task LeaveGame(string gameId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, gameId);
    }

    // Nhận nước đi từ một client và gửi cho TẤT CẢ client khác trong cùng phòng
    public async Task SendMove(string gameId, string moveUCI, string playerColor)
    {
        // moveUCI: ví dụ "e2e4"
        // playerColor: "w" hoặc "b" để biết ai vừa đi
        await Clients.Group(gameId).SendAsync("ReceiveMove", moveUCI, playerColor);
    }
}