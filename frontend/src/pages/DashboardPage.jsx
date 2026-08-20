import React, { useState } from "react";
import "./DashboardPage.css";
import DailyTrendChart from "../components/dashboard/DailyTrendChart";
import AnalysisBox from "../components/dashboard/AnalysisBox";
import SummaryCard from "../components/dashboard/SummaryCard";
import DonutChartBox from "../components/dashboard/DonutChartBox";
import DashboardFilter from "../components/dashboard/DashboardFilter";
import useDashboardData from "../hooks/useDashboardData";
import { useNavigate } from "react-router-dom";
import PageHeaderFilter from "../components/common/PageHeaderFilter";
import TodayTaskListCard from "../components/dashboard/TodayTaskListCard";
import OverdueTopThreeCard from "../components/dashboard/OverdueTopThreeCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import ReportBannerCard from "../components/dashboard/ReportBannerCard";
import {
  getQuickRange,
  getThisMonthRange,
  getThisWeekRange,
} from "../utils/dateUtils";
import {
  getPeriodSummaryLines,
  getDashboardCommentLines,
} from "../utils/dashboardAnalysis";

export default function DashboardPage() {
  const [startDate, setStartDate] = useState(
    () => getQuickRange(7).startDate
  );

  const [endDate, setEndDate] = useState(
    () => getQuickRange(7).endDate
  );

  const [selectedRange, setSelectedRange] = useState(7);
  const [categoryId] = useState("");


  const navigate = useNavigate();

  const {
    loading,
    error,
    data,
    todayTasks,
    overdueTasks,
    recentActivities,
    load,
  } = useDashboardData(startDate, endDate, categoryId);

  const setQuickRange = (days) => {
    const range = getQuickRange(days);

    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setSelectedRange(days);
  };

  const setThisMonth = () => {
    const range = getThisMonthRange();

    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setSelectedRange("month");
  };

  return (
    <div className="dashboard-container">
      <PageHeaderFilter
        title="Dashboard"
        description="작업 현황과 통계를 한눈에 확인하세요."
        startDate={startDate}
        endDate={endDate}
        loading={loading}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onApply={load}
        buttonText="필터 적용"
      />

      <DashboardFilter
        selectedRange={selectedRange}
        onQuickRange={setQuickRange}
        onThisMonth={setThisMonth}
      />

      {error && <div className="dashboard-error-banner">{error}</div>}

      {data && (
        <>
          <div className="dashboard-summary-grid">
            <SummaryCard
              title="총 작업"
              value={data.totalCount}
              subtitle="선택 기간"
              icon="📋"
            />
            <SummaryCard
              title="완료된 작업"
              value={data.doneCount}
              subtitle="선택 기간"
              icon="✅"
            />
            <SummaryCard
              title="완료율"
              value={`${data.doneRate}%`}
              subtitle="선택 기간"
              icon="📊"
            />
            <SummaryCard
              title="총 지연 작업 수(전체 기간)"
              value={`${overdueTasks.length}건`}
              subtitle="작업 목록에서 확인 →"
              icon="⚠️"
              onClick={() => navigate("/tasks?due=overdue")}
            />
            <SummaryCard
              title="오늘 마감 작업"
              value={`${todayTasks.length}건`}
              subtitle="작업 목록에서 확인 →"
              icon="📅"
              onClick={() => navigate("/tasks?due=today")}
            />
          </div>

          <div className="dashboard-chart-row">
            <DailyTrendChart
              startDate={startDate}
              endDate={endDate}
              categoryId={categoryId}
            />

            <DonutChartBox
              title="카테고리별 작업 분포"
              items={data.byCategory}
            />

            <DonutChartBox
              title="상태별 분포"
              items={data.byStatus}
            />
          </div>

          <div className="dashboard-bottom-row">
            <div className="dashboard-bottom-row__item">
              <TodayTaskListCard tasks={todayTasks} />
            </div>
            <div className="dashboard-bottom-row__item">
              <OverdueTopThreeCard tasks={overdueTasks} />
            </div>
            <div className="dashboard-bottom-row__item">
              <RecentActivityCard activities={recentActivities} />
            </div>
            <div className="dashboard-bottom-row__item">
              <ReportBannerCard />
            </div>
          </div>
        </>
      )}
    </div>
  );
}