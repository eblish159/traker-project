package com.tracker.tracker.dashboard.vo;

import java.util.List;

public class DashboardResponseVO {
    private int totalCount;
    private int doneCount;
    private  double doneRate;
    private int todayCount;
    private int overdueCount;

    private List<GroupCountVO> byPriority;
    private List<GroupCountVO> byCategory;


    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(int doneCount) {
        this.doneCount = doneCount;
    }

    public double getDoneRate() {
        return doneRate;
    }

    public void setDoneRate(double doneRate) {
        this.doneRate = doneRate;
    }

    public List<GroupCountVO> getByPriority() {
        return byPriority;
    }

    public void setByPriority(List<GroupCountVO> byPriority) {
        this.byPriority = byPriority;
    }

    public List<GroupCountVO> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<GroupCountVO> byCategory) {
        this.byCategory = byCategory;
    }

    public int getTodayCount() {return todayCount;}

    public void setTodayCount(int todayCount) {this.todayCount = todayCount;}

    public int getOverdueCount() {return overdueCount;}

    public void setOverdueCount(int overdueCount) {this.overdueCount = overdueCount;}
}
