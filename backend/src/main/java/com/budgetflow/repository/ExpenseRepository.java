package com.budgetflow.repository;

import com.budgetflow.model.Category;
import com.budgetflow.model.Expense;
import com.budgetflow.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
            "AND (:startDate IS NULL OR e.expenseDate >= :startDate) " +
            "AND (:endDate IS NULL OR e.expenseDate <= :endDate) " +
            "AND (coalesce(:categories, null) IS NULL OR e.category IN :categories) " +
            "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
            "AND (:maxAmount IS NULL OR e.amount <= :maxAmount)")
    Page<Expense> findExpensesFiltered(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("categories") List<Category> categories,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            Pageable pageable
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
            "AND YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month")
    BigDecimal sumTotalSpentByMonthAndYear(
            @Param("userId") Long userId,
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
            "AND YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
            "GROUP BY e.category")
    List<Object[]> sumSpentByCategory(
            @Param("userId") Long userId,
            @Param("month") int month,
            @Param("year") int year
    );

    @Query("SELECT e.expenseDate, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId " +
            "AND YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
            "GROUP BY e.expenseDate ORDER BY e.expenseDate ASC")
    List<Object[]> findDailyTrend(
            @Param("userId") Long userId,
            @Param("month") int month,
            @Param("year") int year
    );

    List<Expense> findTop5ByUserOrderByExpenseDateDescIdDesc(User user);
}
