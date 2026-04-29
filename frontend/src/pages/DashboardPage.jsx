// frontend/src/pages/DashboardPage.jsx

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";
import {
  fetchDashboard,
  fetchTodayTasks,
  fetchOverdueTasks,
} from "../api/dashboardApi";
import { fetchCategories } from "../api/categoryApi";

function formatDate(v) {
  if (!v) return "-";
  return String(v).slice(0, 10);
}

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
    <div style={{ padding: 20, maxWidth: 980, margin: "0 auto" }}>
      <h2>대시보드</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>시작일</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label>종료일</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 220 }}>
          <label>카테고리</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ height: 34 }}
            disabled={categoryLoading}
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

        <button onClick={load} disabled={loading} style={{ height: 34 }}>
          {loading ? "조회중..." : "조회"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            border: "1px solid #f2b8b5",
            background: "#fff5f5",
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {/* 요약 카드 */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Card title="총 작업" value={data.totalCount} />
            <Card title="완료" value={data.doneCount} />
            <Card title="완료율" value={`${data.doneRate}%`} />
            <Card title="오늘 마감" value={todayTasks.length} onValueClick={() => navigate("/tasks?due=today")} />
            <Card title="지연 작업" value={overdueTasks.length} onValueClick={() => navigate("/tasks?due=overdue")} />
          </div>

          {/* 기존 집계 */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <DonutChartBox title="우선순위별" items={data.byPriority} />
            <DonutChartBox title="카테고리별(전체 카테고리)" items={data.byCategory} />
          </div>

{/*            */}{/* 마감 추적 리스트 */}
{/*           <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}> */}
{/*             <TaskDeadlineBox title="오늘 마감 작업" items={todayTasks} /> */}
{/*             <TaskDeadlineBox title="지연 작업" items={overdueTasks} isOverdue /> */}
{/*           </div> */}

          <div style={{ opacity: 0.7 }}>
            기간: {startDate} ~ {endDate} / 선택 카테고리: {categoryId || "전체"}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, onValueClick }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minWidth: 180 }}>
      <div style={{ opacity: 0.7, fontSize: 13 }}>{title}</div>
      <div
        onClick={onValueClick}
        style={{
            fontSize: 26,
            fontWeight: 700,
            marginTop: 6,
            cursor: onValueClick ? "pointer" : "default",
            textDecoration: onValueClick ? "underline" : "none",
           }}
       >
       {value}
       </div>
    </div>
  );
}

function DonutChartBox({ title, items }) {
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  const data = Array.isArray(items)
    ? items.map((it) => ({
        name: it.groupKey,
        value: it.count,
      }))
    : [];

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        minWidth: 320,
        flex: "1 1 320px",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>{title}</h3>

      {data.length === 0 ? (
        <div style={{ opacity: 0.7 }}>데이터 없음</div>
      ) : (
        <PieChart width={300} height={250}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </div>
  );
}


