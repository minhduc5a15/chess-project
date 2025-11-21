using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIncrementMsToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "IncrementMs",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IncrementMs",
                table: "Games");
        }
    }
}
