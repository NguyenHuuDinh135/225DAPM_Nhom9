namespace backend.Application.Common.Interfaces;

public interface IFileService
{
    Task<string> UploadAsync(IFormFile file, string folderName);
}

