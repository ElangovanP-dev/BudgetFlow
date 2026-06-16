package com.budgetflow.dto;

import com.budgetflow.model.Category;
import java.math.BigDecimal;

public class CategorySummaryDTO {
    private Category category;
    private BigDecimal total;
    private BigDecimal budget;
    private Double pct;

    public CategorySummaryDTO() {}

    public CategorySummaryDTO(Category category, BigDecimal total, BigDecimal budget, Double pct) {
        this.category = category;
        this.total = total;
        this.budget = budget;
        this.pct = pct;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public Double getPct() {
        return pct;
    }

    public void setPct(Double pct) {
        this.pct = pct;
    }
}
