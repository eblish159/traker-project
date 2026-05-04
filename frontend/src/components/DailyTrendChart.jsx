// frontend/src/components/DailyTrendChart.jsx

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { fetchDailyTrend } from "../api/dashboardApi";

export default function DailyTrendChart({ startDate, endDate, categoryId}) {
  const [data, setData] = useState([]);
  const groupBy = getTrendGroupBy(startDate, endDate);

  useEffect(() => {
    async function loadTrend() {
      try {
        const result = await fetchDailyTrend(startDate, endDate, categoryId, groupBy);

        const chartData =
          groupBy === "daily"
            ? fillMissingDates(startDate, endDate, Array.isArray(result) ? result : [])
            : Array.isArray(result)
              ? result
              : [];

        setData(chartData);
      } catch (e) {
        console.error(e);
        setData([]);
      }
    }

    if (startDate && endDate) {
      loadTrend();
    }
  }, [startDate, endDate, categoryId, groupBy]);

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
      <h3 style={{ margin: "0 0 12px 0", fontSize: 17 }}>
        기간별 완료 추이 ({getTrendLabel(groupBy)})
      </h3>

      {data.length === 0 ? (
        <div style={{ color: "#667085", textAlign: "center", marginTop: 95 }}>
          해당 기간에 완료된 작업이 없습니다.
        </div>
      ) : (
       <ResponsiveContainer width="100%" height={240}>
         <LineChart data={data}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis
             dataKey="date"
             interval="preserveStartEnd"
             minTickGap={22}
             tickFormatter={(value) => formatXAxisLabel(value, groupBy)}
           />
           <YAxis allowDecimals={false} />
           <Tooltip
             labelFormatter={(value) => `${getTrendLabel(groupBy)} 기간: ${value}`}
             formatter={(value) => [`${value}건`, "완료 작업"]}
           />
           <Line
             type="monotone"
             dataKey="count"
             strokeWidth={3}
             dot={(props) => {
               const { cx, cy, payload } = props;

               if (!payload || payload.count === 0) {
                 return null;
               }

               return (
                 <circle
                   cx={cx}
                   cy={cy}
                   r={4}
                   fill="#fff"
                   stroke="#2563eb"
                   strokeWidth={3}
                 />
               );
             }}
             activeDot={{ r: 6 }}
           />
         </LineChart>
       </ResponsiveContainer>
      )}
    </div>
  );
}

function fillMissingDates(startDate, endDate, result) {
  const countMap = new Map(
    result.map((item) => [item.date, Number(item.count)])
  );

  const filled = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");

    const date = `${yyyy}-${mm}-${dd}`;

    filled.push({
      date,
      count: countMap.get(date) || 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return filled;
}

function getDayDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getTrendGroupBy(startDate, endDate) {
  const days = getDayDiff(startDate, endDate);

  if (days <= 31) return "daily";
  if (days <= 90) return "weekly";
  return "monthly";
}

function getTrendLabel(groupBy) {
  if (groupBy === "daily") return "일별";
  if (groupBy === "weekly") return "주별";
  return "월별";
}

function formatXAxisLabel(value, groupBy) {
  if (groupBy === "monthly") {
    return value;
  }

  return value.slice(5);
}