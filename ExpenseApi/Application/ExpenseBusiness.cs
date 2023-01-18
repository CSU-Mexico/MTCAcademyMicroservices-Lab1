using ExpenseApi.Data;
using ExpenseApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Text;

namespace ExpenseApi.Application
{
    public class ExpenseBusiness
    {
        private readonly ExpenseApiContext _context;
        private readonly IConfiguration _configuration;

        public ExpenseBusiness(ExpenseApiContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        
        public async Task<ActionResult<IEnumerable<ExpenseRecord>>> GetAllExpenseRecord()
        {            
            return await _context.ExpenseRecord.ToListAsync();
        }

        public async Task<ActionResult<bool>> CreateExpenseRecord(ExpenseRecord expenseRecord)
        {
            _context.ExpenseRecord.Add(expenseRecord);
            await _context.SaveChangesAsync();
            using (var httpClient = new HttpClient())
            {
                StringContent content = new StringContent(JsonConvert.SerializeObject(expenseRecord), Encoding.UTF8, "application/json");
                var url = _configuration["Settings:EndpointURLNotification"];
                using (var response = await httpClient.PostAsync(url, content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var receivedExpenseRecord = JsonConvert.DeserializeObject<ExpenseRecord>(apiResponse);
                }
            }

            using (var httpClient = new HttpClient())
            {
                Category category = new Category(expenseRecord.Category);
                StringContent content = new StringContent(JsonConvert.SerializeObject(category), Encoding.UTF8, "application/json");
                var url = _configuration["Settings:EndpointURLCategories"];
                using (var response = await httpClient.PostAsync(url, content))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    var receivedExpenseRecord = JsonConvert.DeserializeObject<Category>(apiResponse);
                }
            }
            return true;
        }

    }
}
