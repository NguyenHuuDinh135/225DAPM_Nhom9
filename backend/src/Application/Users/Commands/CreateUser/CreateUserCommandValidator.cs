using backend.Domain.Constants;

namespace backend.Application.Users.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private static readonly string[] SupportedRoles = [Roles.Administrator];

    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;

    public CreateUserCommandValidator(IIdentityService identityService, IApplicationDbContext context)
    {
        _identityService = identityService;
        _context = context;

        RuleFor(v => v.Email)
            .NotEmpty()
            .EmailAddress()
            .MustAsync(BeUniqueEmail)
            .WithMessage("'{PropertyName}' must be unique.");

        RuleFor(v => v.Password)
            .NotEmpty()
            .MinimumLength(6)
            .WithMessage("'{PropertyName}' must be at least 6 characters.");

        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .WithMessage("'{PropertyName}' must not exceed 200 characters.");

        RuleFor(v => v.PhoneNumber)
            .MaximumLength(20)
            .WithMessage("'{PropertyName}' must not exceed 20 characters.");

        RuleFor(v => v.DateOfBirth)
            .LessThanOrEqualTo(DateTime.Today)
            .When(v => v.DateOfBirth.HasValue)
            .WithMessage("'{PropertyName}' must be less than or equal to today.");

        RuleFor(v => v.WardId)
            .GreaterThan(0)
            .When(v => v.WardId.HasValue)
            .WithMessage("'{PropertyName}' must be greater than 0.");

        RuleFor(v => v.WardId)
            .MustAsync(WardExists)
            .When(v => v.WardId.HasValue)
            .WithMessage("Ward does not exist.");

        RuleFor(v => v.Status)
            .IsInEnum();

        RuleForEach(v => v.Roles)
            .NotEmpty()
            .Must(BeSupportedRole)
            .WithMessage("Role is not supported.");
    }

    public async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
    {
        return !await _identityService.EmailExistsAsync(email, null, cancellationToken);
    }

    public async Task<bool> WardExists(int? wardId, CancellationToken cancellationToken)
    {
        if (!wardId.HasValue)
        {
            return true;
        }

        return await _context.Wards.AnyAsync(w => w.Id == wardId.Value, cancellationToken);
    }

    public bool BeSupportedRole(string role)
    {
        return SupportedRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}
