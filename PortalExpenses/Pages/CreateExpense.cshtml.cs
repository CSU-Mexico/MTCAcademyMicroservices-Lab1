using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json;
using PortalExpenses.Config;
using PortalExpenses.Data;
using PortalExpenses.Models;
using Microsoft.Extensions.Primitives;
using System.Configuration;

namespace PortalExpenses.Pages
{
    public class CreateExpenseModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly IConfiguration _configuration;

        public CreateExpenseModel(ILogger<IndexModel> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public ExpenseRecord ExpenseRecord { get; set; } = default!;
        

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid || ExpenseRecord == null)
            {
                return Page();
            }
                       

            using (var httpClient = new HttpClient())
            {
                StringContent content = new StringContent(JsonConvert.SerializeObject(ExpenseRecord), Encoding.UTF8, "application/json");
                var url = _configuration["Settings:EndpointURL"];
                using (var response = await httpClient.PostAsync(url, content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var receivedExpenseRecord = JsonConvert.DeserializeObject<ExpenseRecord>(apiResponse);
                }
            }

            return RedirectToPage("./Index");
        }
    }
}
