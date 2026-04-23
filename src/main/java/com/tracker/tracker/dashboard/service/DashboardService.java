package com.tracker.tracker.dashboard.service;

import com.tracker.tracker.dashboard.vo.DashboardResponseVO;

public interface DashboardService {
     DashboardResponseVO getDashboard(String userId, String startDate, String endDate, Long categoryId);
}
