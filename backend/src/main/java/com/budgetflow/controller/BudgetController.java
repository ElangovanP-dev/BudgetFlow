package com.budgetflow.controller;

import com.budgetflow.model.Budget;
import com.budgetflow.model.User;
import com.budgetflow.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        if (month != null && year != null) {
            return ResponseEntity.ok(budgetService.getBudgetsForUserAndMonthAndYear(user, month, year));
        }
        return ResponseEntity.ok(budgetService.getAllBudgetsForUser(user));
    }

    @PostMapping
    public ResponseEntity<?> createBudget(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody Budget budget) {
        try {
            Budget created = budgetService.createBudget(user, budget);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody Budget budget) {
        try {
            Budget updated = budgetService.updateBudget(user, id, budget);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        try {
            budgetService.deleteBudget(user, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
