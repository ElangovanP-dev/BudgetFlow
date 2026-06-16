package com.budgetflow.dto;

import java.math.BigDecimal;
import java.util.List;

public class ExpenseSummaryDTO {
    private BigDecimal totalSpent;
    private List<CategorySummaryDTO> byCategory;
    private List<DailyTrendDTO> dailyTrend;
    private String topCategory;
    private List<String> budgetAlerts;

    public ExpenseSummaryDTO() {}

    public ExpenseSummaryDTO(BigDecimal totalSpent, List<CategorySummaryDTO> byCategory,
                             List<DailyTrendDTO> dailyTrend, String topCategory, List<String> budgetAlerts) {
        this.totalSpent = totalSpent;
        this.byCategory = byCategory;
        this.dailyTrend = dailyTrend;
        this.topCategory = topCategory;
        this.budgetAlerts = budgetAlerts;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public List<CategorySummaryDTO> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<CategorySummaryDTO> byCategory) {
        this.byCategory = byCategory;
    }

    public List<DailyTrendDTO> getDailyTrend() {
        return dailyTrend;
    }

    public void setDailyTrend(List<DailyTrendDTO> dailyTrend) {
        this.dailyTrend = dailyTrend;
    }

    public String getTopCategory() {
        return topCategory;
    }

    public void setTopCategory(String topCategory) {
        this.topCategory = topCategory;
    }

    public List<String> getBudgetAlerts() {
        return budgetAlerts;
    }

    public void setBudgetAlerts(List<String> budgetAlerts) {
        this.budgetAlerts = budgetAlerts;
    }
}
