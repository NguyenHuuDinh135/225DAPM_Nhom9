using backend.Application.Trees.Queries.GetTrees;

namespace backend.Web.Endpoints;

public class Trees : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("", GetAllTrees);
    }

    public async Task<IEnumerable<TreeDto>> GetAllTrees(ISender sender)
    {
        return await sender.Send(new GetTreesQuery());
    }
}
