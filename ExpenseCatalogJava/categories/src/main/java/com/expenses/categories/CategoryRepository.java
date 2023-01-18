package com.expenses.categories;
import java.util.ArrayList;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;



public class CategoryRepository {

    private ArrayList<Category> categories;
    private final StringRedisTemplate template;
    private ValueOperations<String, String> ops ;
      public CategoryRepository(StringRedisTemplate _template) 
      {
        this.categories = new ArrayList<Category>();        
        this.template = _template;
        ops= this.template.opsForValue();
          
      }
      public ArrayList<Category> getCategories() 
      {
        this.categories = new ArrayList<Category>();

        template.keys("*").forEach(key -> {
            this.categories.add(new Category(ops.get(key),key));
        });

        return this.categories;
      }

      public Category addCategory(Category category) 
      {        
        if (!this.template.hasKey(category.getName())) {
            ops.set(category.getName(),category.getDescription());
        }
    
   
        return category;
      }
    
}
