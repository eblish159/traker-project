package com.tracker.tracker.dashboard.controller;

import com.tracker.tracker.dashboard.service.DashboardService;
import com.tracker.tracker.dashboard.vo.DashboardResponseVO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    //개발용 고정 유저
    private static final String DEV_USER_ID = "testuser";

    public DashboardController(DashboardService dashboardService){
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponseVO> getDashboard(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) Long categoryId
            //HttpSession session
    ) {
        // userId 비개발용
//        String userId = (String) session.getAttribute("userId");
//
//        if (userId == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//        DashboardResponseVO response =
//                dashboardService.getDashboard(userId, startDate, endDate, categoryId);
//
//        return ResponseEntity.ok(response);

        DashboardResponseVO response = dashboardService.getDashboard(DEV_USER_ID, startDate, endDate, categoryId);
        return ResponseEntity.ok(response);
    }

}
