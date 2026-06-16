package com.budgetflow.service;

import com.budgetflow.model.Budget;
import com.budgetflow.model.Category;
import com.budgetflow.model.User;
import com.budgetflow.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public List<Budget> getAllBudgetsForUser(User user) {
        return budgetRepository.findByUser(user);
    }

    public List<Budget> getBudgetsForUserAndMonthAndYear(User user, int month, int year) {
        return budgetRepository.findByUserAndMonthAndYear(user, month, year);
    }

    @Transactional
    public Budget createBudget(User user, Budget budget) {
        Optional<Budget> existingBudget = budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, budget.getCategory(), budget.getMonth(), budget.getYear()
        );
        if (existingBudget.isPresent()) {
            throw new IllegalArgumentException("Budget for category " + budget.getCategory() + 
                    " in " + budget.getMonth() + "/" + budget.getYear() + " already exists.");
        }
        budget.setUser(user);
        return budgetRepository.save(budget);
    }

    @Transactional
    public Budget updateBudget(User user, Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to this budget.");
        }

        budget.setMonthlyLimit(budgetDetails.getMonthlyLimit());
        // Category, Month, Year are typically immutable for a specific budget item in editing,
        // but let's allow them or keep it simple by updating limit.
        return budgetRepository.save(budget);
    }

    @Transactional
    public void deleteBudget(User user, Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to this budget.");
        }

        budgetRepository.delete(budget);
    }
}
