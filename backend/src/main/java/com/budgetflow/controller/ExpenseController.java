package com.budgetflow.controller;

import com.budgetflow.dto.ExpenseSummaryDTO;
import com.budgetflow.model.Category;
import com.budgetflow.model.Expense;
import com.budgetflow.model.User;
import com.budgetflow.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<Page<Expense>> getExpenses(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<Category> category,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "expenseDate", "id"));
        Page<Expense> expenses = expenseService.getExpensesFiltered(
                user, startDate, endDate, category, minAmount, maxAmount, pageable
        );
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody Expense expense) {
        Expense created = expenseService.createExpense(user, expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody Expense expense) {
        Expense updated = expenseService.updateExpense(user, id, expense);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        expenseService.deleteExpense(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseSummaryDTO> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();

        ExpenseSummaryDTO summary = expenseService.getExpenseSummary(user, targetMonth, targetYear);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Expense>> getRecent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(expenseService.getRecentExpenses(user));
    }
}
