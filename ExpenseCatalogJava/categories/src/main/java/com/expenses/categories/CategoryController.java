package com.expenses.categories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
public class CategoryController {
	@Autowired
   	private StringRedisTemplate template;    

	@GetMapping("/category")
	public ResponseEntity<ArrayList<Category>> getCategories() {
		CategoryRepository repo = new CategoryRepository(template); 
        return new ResponseEntity<>(repo.getCategories(), HttpStatus.OK);
	}

	@PostMapping(value="/category", consumes="application/json", produces="application/json")
	public ResponseEntity<Category> addCategory(@RequestBody Category category) {
		CategoryRepository repo = new CategoryRepository(template); 
		
		return new ResponseEntity<>(repo.addCategory(category), HttpStatus.OK);
	}
	
    
}
