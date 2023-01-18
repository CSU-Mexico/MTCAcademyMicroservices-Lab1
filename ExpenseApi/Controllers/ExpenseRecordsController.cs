using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseApi.Data;
using ExpenseApi.Models;
using ExpenseApi.Application;
using System.Configuration;

namespace ExpenseApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseRecordsController : ControllerBase
    {
        private readonly ExpenseApiContext _context;
        private readonly IConfiguration _configuration;

        public ExpenseRecordsController(ExpenseApiContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/ExpenseRecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseRecord>>> GetExpenseRecord()
        {
            ExpenseBusiness expenseBusiness = new ExpenseBusiness(_context, _configuration);
            return await expenseBusiness.GetAllExpenseRecord();
        }        

        // POST: api/ExpenseRecords
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ExpenseRecord>> PostExpenseRecord(ExpenseRecord expenseRecord)
        {
          if (_context.ExpenseRecord == null)
          {
              return Problem("Entity set 'ExpenseApiContext.ExpenseRecord'  is null.");
          }
            ExpenseBusiness expenseBusiness = new ExpenseBusiness(_context,_configuration);
            await expenseBusiness.CreateExpenseRecord(expenseRecord);
            return CreatedAtAction("GetExpenseRecord", new { id = expenseRecord.Id }, expenseRecord);
        }
       
    }
}
