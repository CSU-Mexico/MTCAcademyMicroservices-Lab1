namespace PortalExpenses.Models
{
    public class ExpenseRecord
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public Decimal Amount { get; set; }
        public string? Category { get; set; }

    }
}
