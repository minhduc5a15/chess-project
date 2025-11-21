using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGameSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IncrementSeconds",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TimeLimitMinutes",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IncrementSeconds",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimeLimitMinutes",
                table: "Games");
        }
    }
}
