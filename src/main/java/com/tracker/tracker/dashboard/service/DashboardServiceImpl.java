package com.tracker.tracker.dashboard.service;

import com.tracker.tracker.dashboard.dao.DashboardDAO;
import com.tracker.tracker.dashboard.vo.DashboardResponseVO;
import com.tracker.tracker.dashboard.vo.GroupCountVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final DashboardDAO dashboardDAO;

    public DashboardServiceImpl(DashboardDAO dashboardDAO) {
        this.dashboardDAO = dashboardDAO;
    }

    /**
     * 설계 1:
     * - total/done/byPriority 는 categoryId 필터 적용
     * - byCategory 는 전체 분포 유지(필터 미적용)
     */
    @Override
    public DashboardResponseVO getDashboard(String userId, String startDate, String endDate, Long categoryId) {

        validateDates(startDate, endDate);

        // ✅ categoryId 필터 적용되는 집계들
        int total = dashboardDAO.countTotalTasks(userId, startDate, endDate, categoryId);
        int done = dashboardDAO.countDoneTasks(userId, startDate, endDate, categoryId);
        List<GroupCountVO> byPriority = dashboardDAO.countByPriority(userId, startDate, endDate, categoryId);

        // ✅ 설계 1: 카테고리별 분포는 전체 유지 (categoryId 미적용)
        List<GroupCountVO> byCategory = dashboardDAO.countByCategory(userId, startDate, endDate);

        double doneRate = calculateDoneRate(done, total);

        DashboardResponseVO response = new DashboardResponseVO();
        response.setTotalCount(total);
        response.setDoneCount(done);
        response.setDoneRate(doneRate);
        response.setByPriority(byPriority);
        response.setByCategory(byCategory);

        return response;
    }

    private void validateDates(String startDate, String endDate) {
        if (!StringUtils.hasText(startDate) || !StringUtils.hasText(endDate)) {
            throw new IllegalArgumentException("startDate 와 endDate는 필수입니다.");
        }

        LocalDate start;
        LocalDate end;
        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("날짜 형식이 올바르지 않습니다.", e);
        }

        if (start.isAfter(end)) {
            throw new IllegalArgumentException("startDate 는 endDate보다 클 수 없습니다.");
        }
    }

    private double calculateDoneRate(int done, int total) {
        if (total <= 0) return 0.0;
        double rate = ((double) done / (double) total) * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }
}