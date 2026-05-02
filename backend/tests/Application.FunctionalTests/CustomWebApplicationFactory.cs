using System.Data.Common;
using backend.Application.Common.Interfaces;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using backend.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;

namespace backend.Application.FunctionalTests;

using static Testing;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly DbConnection _connection;
    private readonly string _connectionString;

    public CustomWebApplicationFactory(DbConnection connection, string connectionString)
    {
        _connection = connection;
        _connectionString = connectionString;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder
            .UseEnvironment("Testing")
            .UseSetting("ConnectionStrings:backendDb", _connectionString);

        builder.ConfigureTestServices(services =>
        {
            services
                .RemoveAll<IUser>()
                .AddTransient(provider =>
                {
                    var mock = new Mock<IUser>();
                    mock.SetupGet(x => x.Roles).Returns(GetRoles());
                    mock.SetupGet(x => x.Id).Returns(GetUserId());
                    return mock.Object;
                });

            services
                .RemoveAll<IFileService>()
                .AddTransient(provider =>
                {
                    var mock = new Mock<IFileService>();
                    mock.Setup(x => x.UploadAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
                        .ReturnsAsync((IFormFile file, string folder) => $"/uploads/{folder}/{file.FileName}");
                    return mock.Object;
                });

            services
                .RemoveAll<IExcelService>()
                .AddTransient(provider =>
                {
                    var mock = new Mock<IExcelService>();
                    mock.Setup(x => x.ParseTreeImport(It.IsAny<Stream>()))
                        .Returns(new List<TreeImportRow>
                        {
                            new TreeImportRow(1, "Tree 1", "Good", 10, 20),
                            new TreeImportRow(1, "Tree 2", "Bad", 5, 10)
                        });
                    mock.Setup(x => x.ExportDashboardStatsAsync(It.IsAny<DashboardStatsVm>()))
                        .ReturnsAsync(new byte[] { 1, 2, 3, 4 });
                    return mock.Object;
                });
        });
    }
}
