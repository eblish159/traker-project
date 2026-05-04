// frontend/src/pages/DashboardPage.jsx

import React, { useEffect, useState } from "react";
import DailyTrendChart from "../components/DailyTrendChart";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboard,
  fetchTodayTasks,
  fetchOverdueTasks,
} from "../api/dashboardApi";
import { fetchCategories } from "../api/categoryApi";

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("2026-02-01");
  const [endDate, setEndDate] = useState("2026-02-22");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  const navigate = useNavigate();

  async function load() {
    setError("");

    if (!startDate || !endDate) {
      setError("시작일/종료일을 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const [dashboardResult, todayResult, overdueResult] = await Promise.all([
        fetchDashboard(startDate, endDate, categoryId),
        fetchTodayTasks(),
        fetchOverdueTasks(),
      ]);

      setData(dashboardResult);
      setTodayTasks(Array.isArray(todayResult) ? todayResult : []);
      setOverdueTasks(Array.isArray(overdueResult) ? overdueResult : []);
    } catch (e) {
      setData(null);
      setTodayTasks([]);
      setOverdueTasks([]);
      setError(e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setCategoryError("");

    try {
      setCategoryLoading(true);
      const list = await fetchCategories();
      setCategories(Array.isArray(list) ? list : []);
    } catch (e) {
      setCategories([]);
      setCategoryError(e?.message || "카테고리 조회 실패");
    } finally {
      setCategoryLoading(false);
    }
  }

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>관리통계형 대시보드</h2>
          <p style={{ margin: "6px 0 0", color: "#667085" }}>
            작업은 목록에서 관리하고, 대시보드에서는 통계와 흐름을 확인합니다.
          </p>
        </div>

        {/* 필터 영역 */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 16,
            marginBottom: 14,
            display: "flex",
            gap: 12,
            alignItems: "end",
            flexWrap: "wrap",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
          }}
        >
          <FilterInput label="시작일" type="date" value={startDate} onChange={setStartDate} />
          <FilterInput label="종료일" type="date" value={endDate} onChange={setEndDate} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
            <label style={labelStyle}>카테고리</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={categoryLoading}
              style={inputStyle}
            >
              <option value="">전체</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            {categoryError && <div style={{ color: "crimson", fontSize: 12 }}>{categoryError}</div>}
          </div>

          <button
            onClick={load}
            disabled={loading}
            style={{
              height: 38,
              padding: "0 18px",
              border: "none",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "조회중..." : "조회"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              border: "1px solid #f2b8b5",
              background: "#fff5f5",
              borderRadius: 10,
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {data && (
          <>
            {/* 요약 카드 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(150px, 1fr))",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <SummaryCard title="총 작업" value={data.totalCount} subtitle="선택 기간" icon="📋" />
              <SummaryCard title="완료된 작업" value={data.doneCount} subtitle="선택 기간" icon="✅" />
              <SummaryCard title="완료율" value={`${data.doneRate}%`} subtitle="선택 기간" icon="📊" />
              <SummaryCard
                title="오늘 마감"
                value={`${todayTasks.length}건`}
                subtitle="작업 목록에서 확인 →"
                icon="📅"
                onClick={() => navigate("/tasks?due=today")}
              />
              <SummaryCard
                title="지연 작업"
                value={`${overdueTasks.length}건`}
                subtitle="작업 목록에서 확인 →"
                icon="⚠️"
                onClick={() => navigate("/tasks?due=overdue")}
              />
            </div>

            {/* 차트 영역 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.35fr 1fr 1fr",
                gap: 12,
                marginBottom: 14,
                alignItems: "stretch",
              }}
            >
              <DailyTrendChart
                startDate={startDate}
                endDate={endDate}
                categoryId={categoryId}
              />

              <DonutChartBox title="카테고리별 작업 분포" items={data.byCategory} />
              <DonutChartBox title="우선순위별 분포" items={data.byPriority} />
            </div>

            {/* 하단 분석 박스 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <AnalysisBox
                title="이번 기간 요약"
                icon="📌"
                lines={[
                  `선택 기간의 전체 작업은 ${data.totalCount}건입니다.`,
                  `완료된 작업은 ${data.doneCount}건이며 완료율은 ${data.doneRate}%입니다.`,
                ]}
              />
              <AnalysisBox
                title="분석 코멘트"
                icon="💡"
                lines={[
                  todayTasks.length > 0
                    ? `오늘 마감 작업이 ${todayTasks.length}건 있습니다.`
                    : "오늘 마감 작업은 없습니다.",
                  overdueTasks.length > 0
                    ? `지연 작업이 ${overdueTasks.length}건 있습니다. 우선 확인이 필요합니다.`
                    : "현재 지연 작업은 없습니다.",
                ]}
              />
            </div>

            <div style={{ color: "#667085", fontSize: 14 }}>
              기간: {startDate} ~ {endDate} / 선택 카테고리: {categoryId || "전체"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterInput({ label, type, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon, onClick }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        minHeight: 112,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ color: "#667085", fontSize: 13, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10, color: "#111827" }}>
            {value}
          </div>
          <div style={{ color: "#667085", fontSize: 12, marginTop: 6 }}>{subtitle}</div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DonutChartBox({ title, items }) {
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  const chartData = Array.isArray(items)
    ? items.map((it) => ({
        name: it.groupKey,
        value: it.count,
      }))
    : [];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        minHeight: 300,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <h3 style={{ margin: "0 0 12px 0", fontSize: 17 }}>{title}</h3>

      {chartData.length === 0 ? (
        <div style={{ color: "#667085", textAlign: "center", marginTop: 90 }}>
          데이터 없음
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function AnalysisBox({ title, icon, lines }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: 17 }}>
        {icon} {title}
      </h3>

      <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.7 }}>
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

const labelStyle = {
  fontSize: 13,
  color: "#475467",
  fontWeight: 700,
};

const inputStyle = {
  height: 38,
  border: "1px solid #d0d5dd",
  borderRadius: 8,
  padding: "0 10px",
  background: "#fff",
};