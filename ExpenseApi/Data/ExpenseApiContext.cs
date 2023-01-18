using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ExpenseApi.Models;

namespace ExpenseApi.Data
{
    public class ExpenseApiContext : DbContext
    {
        public ExpenseApiContext (DbContextOptions<ExpenseApiContext> options)
            : base(options)
        {
        }

        public DbSet<ExpenseApi.Models.ExpenseRecord> ExpenseRecord { get; set; } = default!;
    }
}
