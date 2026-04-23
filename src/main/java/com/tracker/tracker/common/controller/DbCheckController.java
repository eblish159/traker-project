package com.tracker.tracker.common.controller;

import com.tracker.tracker.common.dao.DbCheckDAO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DbCheckController {

    private final DbCheckDAO dbCheckDAO;

    public DbCheckController(DbCheckDAO dbCheckDAO) {
        this.dbCheckDAO = dbCheckDAO;
    }

    @GetMapping("/api/db-check")
    public String dbCheck() {
        return dbCheckDAO.selectOneFromDual() == 1 ? "DB_OK" : "DB_FAIL";
    }
}
