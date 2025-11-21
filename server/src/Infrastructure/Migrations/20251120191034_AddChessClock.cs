using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChessProject.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChessClock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BlackTimeRemainingMs",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastMoveAt",
                table: "Games",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "WhiteTimeRemainingMs",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlackTimeRemainingMs",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "LastMoveAt",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "WhiteTimeRemainingMs",
                table: "Games");
        }
    }
}
