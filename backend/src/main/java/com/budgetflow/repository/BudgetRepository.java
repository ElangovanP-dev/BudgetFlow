package com.budgetflow.repository;

import com.budgetflow.model.Budget;
import com.budgetflow.model.Category;
import com.budgetflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);
    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);
}
