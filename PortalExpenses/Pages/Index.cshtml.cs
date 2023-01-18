using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using PortalExpenses.Models;

namespace PortalExpenses.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;

        public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public IList<ExpenseRecord> ExpenseRecord { get; set; } = default!;

        public async Task OnGetAsync()
        {
            ExpenseRecord = new List<ExpenseRecord>();

            using (var httpClient = new HttpClient())
            {
                var url = _configuration["Settings:EndpointURL"];
                using (var response = await httpClient.GetAsync(url))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();

                    ExpenseRecord = JsonConvert.DeserializeObject<List<ExpenseRecord>>(apiResponse);
                }
            }

        }
    }
}