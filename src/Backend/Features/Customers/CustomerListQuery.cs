using MediatR;
using Microsoft.EntityFrameworkCore;
using Backend.Infrastructure.Database;

namespace Backend.Features.Customers;

public class CustomerListQuery : IRequest<List<CustomerListQueryResponse>>
{
    public string? SearchText { get; set; }
}

public class CustomerListQueryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Iban { get; set; } = "";
    public CustomerListQueryResponseCustomerCategory? CustomerCategory { get; set; }
}

public class CustomerListQueryResponseCustomerCategory
{
    public string Code { get; set; } = "";
    public string Description { get; set; } = "";
}

internal class CustomerListQueryHandler(BackendContext context) : IRequestHandler<CustomerListQuery, List<CustomerListQueryResponse>>
{
    private readonly BackendContext context = context;

    public async Task<List<CustomerListQueryResponse>> Handle(CustomerListQuery request, CancellationToken cancellationToken)
    {
        var query = context.Customers
                           .Include(c => c.CustomerCategory)
                           .AsQueryable();

        if (!string.IsNullOrEmpty(request.SearchText))
        {
            var search = request.SearchText.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(search) ||
                                     c.Email.ToLower().Contains(search));
        }

        var data = await query.OrderBy(c => c.Name).ToListAsync(cancellationToken);
        var result = new List<CustomerListQueryResponse>();

        foreach (var item in data)
        {
            var responseItem = new CustomerListQueryResponse
            {
                Id = item.Id,
                Name = item.Name,
                Address = item.Address,
                Email = item.Email,
                Phone = item.Phone,
                Iban = item.Iban,
                CustomerCategory = item.CustomerCategory is not null
                    ? new CustomerListQueryResponseCustomerCategory
                        {
                            Code = item.CustomerCategory.Code,
                            Description = item.CustomerCategory.Description
                        }
                    : null
            };

            result.Add(responseItem);
        }

        return result;
    }
}
