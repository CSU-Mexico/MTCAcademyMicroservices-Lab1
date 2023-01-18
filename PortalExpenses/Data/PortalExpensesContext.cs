using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PortalExpenses.Models;

namespace PortalExpenses.Data
{
    public class PortalExpensesContext : DbContext
    {
        public PortalExpensesContext (DbContextOptions<PortalExpensesContext> options)
            : base(options)
        {
        }

        public DbSet<PortalExpenses.Models.ExpenseRecord> ExpenseRecord { get; set; } = default!;
    }
}
