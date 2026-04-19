namespace backend.Web.Endpoints;
public class Trees : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("all", GetAllTrees);
    }

    public async Task<List<TreeDto>> GetAllTrees(ISender sender)
    {
        return await sender.Send(new GetAllTreesQuery());
    }
}   
