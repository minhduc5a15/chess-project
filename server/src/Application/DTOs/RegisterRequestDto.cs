using System.ComponentModel.DataAnnotations;

namespace ChessProject.Application.DTOs;

public class RegisterRequestDto
{
    [Required] // [Annotation indicating that the Username field is required]
    [MinLength(3)] // [Validation attribute specifying a minimum length of 3 characters]
    public string Username { get; set; } = string.Empty;

    [Required] // [Annotation indicating that the Password field is required]
    [MinLength(6)] // [Validation attribute specifying a minimum length of 6 characters]
    public string Password { get; set; } = string.Empty;
}