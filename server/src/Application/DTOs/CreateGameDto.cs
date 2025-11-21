using System.ComponentModel.DataAnnotations;

namespace ChessProject.Application.DTOs;

public class CreateGameDto
{
    [Range(1, 180, ErrorMessage = "Thời gian phải từ 1 đến 180 phút.")]
    public int TimeLimitMinutes { get; set; } = 10;

    [Range(0, 60, ErrorMessage = "Thời gian cộng thêm phải từ 0 đến 60 giây.")]
    public int IncrementSeconds { get; set; } = 0;

    // Giá trị nhận vào: "white", "black", "random"
    public string Side { get; set; } = "random";
}