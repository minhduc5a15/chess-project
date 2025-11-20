using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMoveHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MoveHistory",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MoveHistory",
                table: "Games");
        }
    }
}
