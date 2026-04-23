// frontend/src/api/dashboardApi.js

export async function fetchDashboard(startDate, endDate, categoryId) {
  const qs = new URLSearchParams({ startDate, endDate });

  if (categoryId) qs.append("categoryId", categoryId);

  const res = await fetch(`/api/dashboard?${qs.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `대시보드 조회 실패 (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchTodayTasks() {
  const res = await fetch("/api/tasks/today", {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `오늘 마감 작업 조회 실패 (HTTP ${res.status})`);
  }

  return res.json();
}

export async function fetchOverdueTasks() {
  const res = await fetch("/api/tasks/overdue", {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `지연 작업 조회 실패 (HTTP ${res.status})`);
  }

  return res.json();
}