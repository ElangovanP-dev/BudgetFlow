package com.budgetflow.service;

import com.budgetflow.dto.CategorySummaryDTO;
import com.budgetflow.dto.DailyTrendDTO;
import com.budgetflow.dto.ExpenseSummaryDTO;
import com.budgetflow.model.Budget;
import com.budgetflow.model.Category;
import com.budgetflow.model.Expense;
import com.budgetflow.model.User;
import com.budgetflow.repository.BudgetRepository;
import com.budgetflow.repository.ExpenseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;

    public ExpenseService(ExpenseRepository expenseRepository, BudgetRepository budgetRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
    }

    public Page<Expense> getExpensesFiltered(User user, LocalDate startDate, LocalDate endDate,
                                            List<Category> categories, BigDecimal minAmount,
                                            BigDecimal maxAmount, Pageable pageable) {
        return expenseRepository.findExpensesFiltered(
                user.getId(), startDate, endDate, categories, minAmount, maxAmount, pageable
        );
    }

    public List<Expense> getRecentExpenses(User user) {
        return expenseRepository.findTop5ByUserOrderByExpenseDateDescIdDesc(user);
    }

    @Transactional
    public Expense createExpense(User user, Expense expense) {
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(User user, Long id, Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to this expense.");
        }

        expense.setAmount(expenseDetails.getAmount());
        expense.setCategory(expenseDetails.getCategory());
        expense.setDescription(expenseDetails.getDescription());
        expense.setExpenseDate(expenseDetails.getExpenseDate());

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(User user, Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to this expense.");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseSummaryDTO getExpenseSummary(User user, int month, int year) {
        Long userId = user.getId();

        // 1. Total spent this month
        BigDecimal totalSpent = expenseRepository.sumTotalSpentByMonthAndYear(userId, month, year);
        if (totalSpent == null) {
            totalSpent = BigDecimal.ZERO;
        }

        // 2. Spent by category
        List<Object[]> spentResult = expenseRepository.sumSpentByCategory(userId, month, year);
        Map<Category, BigDecimal> spentMap = new EnumMap<>(Category.class);
        for (Object[] row : spentResult) {
            Category cat = (Category) row[0];
            BigDecimal amt = (BigDecimal) row[1];
            spentMap.put(cat, amt != null ? amt : BigDecimal.ZERO);
        }

        // 3. Budgets by category
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        Map<Category, BigDecimal> budgetMap = new EnumMap<>(Category.class);
        for (Budget budget : budgets) {
            budgetMap.put(budget.getCategory(), budget.getMonthlyLimit());
        }

        // 4. Assemble category summaries and budget alerts
        List<CategorySummaryDTO> byCategory = new ArrayList<>();
        List<String> budgetAlerts = new ArrayList<>();
        BigDecimal maxSpent = BigDecimal.ZERO;
        Category topCategoryEnum = null;

        for (Category cat : Category.values()) {
            BigDecimal spent = spentMap.getOrDefault(cat, BigDecimal.ZERO);
            BigDecimal limit = budgetMap.getOrDefault(cat, BigDecimal.ZERO);
            
            double pct = 0.0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                pct = spent.divide(limit, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            }

            byCategory.add(new CategorySummaryDTO(cat, spent, limit, pct));

            // Check alerts
            if (limit.compareTo(BigDecimal.ZERO) > 0 && spent.compareTo(limit) > 0) {
                budgetAlerts.add(cat.name());
            }

            // Find top category
            if (spent.compareTo(maxSpent) > 0) {
                maxSpent = spent;
                topCategoryEnum = cat;
            }
        }

        String topCategory = topCategoryEnum != null ? topCategoryEnum.name() : "None";

        // 5. Daily Trend
        List<Object[]> trendResult = expenseRepository.findDailyTrend(userId, month, year);
        List<DailyTrendDTO> dailyTrend = new ArrayList<>();
        for (Object[] row : trendResult) {
            LocalDate date;
            if (row[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) row[0]).toLocalDate();
            } else {
                date = (LocalDate) row[0];
            }
            BigDecimal amt = (BigDecimal) row[1];
            dailyTrend.add(new DailyTrendDTO(date, amt != null ? amt : BigDecimal.ZERO));
        }

        return new ExpenseSummaryDTO(totalSpent, byCategory, dailyTrend, topCategory, budgetAlerts);
    }
}
