using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using PortalExpenses.Models;

namespace PortalExpenses.Pages
{
    public class CategoriesModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;

        public CategoriesModel(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }
        public IList<Category> Categories { get; set; } = default!;
        public async Task OnGetAsync()
        {
            Categories = new List<Category>();

            using (var httpClient = new HttpClient())
            {
                var url = _configuration["Settings:EndpointURLCategories"];
                using (var response = await httpClient.GetAsync(url))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();

                    Categories = JsonConvert.DeserializeObject<List<Category>>(apiResponse);
                }
            }
        }
    }
}
