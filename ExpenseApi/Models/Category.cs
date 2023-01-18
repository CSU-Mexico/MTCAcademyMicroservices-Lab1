namespace ExpenseApi.Models
{
    public class Category
    {
        

        public Category(string value)
        {
            this.Name = value;
            this.Description = value;
        }

        public string Name { get; set; }
        public string Description { get; set; }
    }
}
