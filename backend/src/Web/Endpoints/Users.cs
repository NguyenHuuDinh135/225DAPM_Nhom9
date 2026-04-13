using backend.Application.Users.Commands.CreateUser;
using backend.Application.Users.Commands.DeleteUser;
using backend.Application.Users.Commands.UpdateProfile;
using backend.Application.Users.Commands.UpdateUser;
using backend.Application.Users.Common;
using backend.Application.Users.Queries.GetProfile;
using backend.Application.Users.Queries.GetUserById;
using backend.Application.Users.Queries.GetUsers;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();
        groupBuilder.MapGet(GetProfile, "profile").RequireAuthorization();
        groupBuilder.MapPut(UpdateProfile, "profile").RequireAuthorization();
        groupBuilder.MapGet(GetUsers).RequireAuthorization();
        groupBuilder.MapGet(GetUserById, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreateUser).RequireAuthorization();
        groupBuilder.MapPut(UpdateUser, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteUser, "{id}").RequireAuthorization();
    }

    public async Task<Ok<UserDto>> GetProfile(ISender sender)
    {
        var user = await sender.Send(new GetProfileQuery());

        return TypedResults.Ok(user);
    }

    public async Task<Ok<UserDto>> UpdateProfile(ISender sender, UpdateProfileCommand command)
    {
        var user = await sender.Send(command);

        return TypedResults.Ok(user);
    }

    public async Task<Ok<UsersVm>> GetUsers(ISender sender)
    {
        var users = await sender.Send(new GetUsersQuery());

        return TypedResults.Ok(users);
    }

    public async Task<Ok<UserDto>> GetUserById(ISender sender, string id)
    {
        var user = await sender.Send(new GetUserByIdQuery(id));

        return TypedResults.Ok(user);
    }

    public async Task<Created<string>> CreateUser(ISender sender, CreateUserCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/api/{nameof(Users)}/{id}", id);
    }

    public async Task<NoContent> UpdateUser(ISender sender, string id, UpdateUserCommand command)
    {
        var cmd = command with { Id = id };

        await sender.Send(cmd);

        return TypedResults.NoContent();
    }

    public async Task<NoContent> DeleteUser(ISender sender, string id)
    {
        await sender.Send(new DeleteUserCommand(id));

        return TypedResults.NoContent();
    }
}
