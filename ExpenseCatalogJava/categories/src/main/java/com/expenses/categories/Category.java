package com.expenses.categories;

public class Category{
    private String description;
    private String name;

    public Category(String _description, String _name){
        this.description = _description;
        this.name = _name;
    }

    public String getDescription(){
        return description;
    }

    public String getName(){
        return name;
    }

    public void setDescription(String _description){
        description = _description;
    }

    public void setName(String _name){
        name= _name;
    }

}