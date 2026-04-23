// frontend/src/api/taskApi.js

export async function createTask(payload) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Task 등록 실패 (HTTP ${res.status})`);
  }

  return res.json();
}

export async function fetchTasks(params = {}) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.append(k, String(v));
  });

  const url = qs.toString() ? `/api/tasks?${qs.toString()}` : "/api/tasks";

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Task 조회 실패 (HTTP ${res.status})`);
  }

  return res.json();
}

export async function updateTask(taskId, payload) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Task 수정 실패 (HTTP ${res.status})`);
  }

  return res.json();
}

export async function deleteTask(taskId) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Task 삭제 실패 (HTTP ${res.status})`);
  }

  return true;
}

// 작업 진행 상태 변경: TODO / DOING / DONE
export async function updateTaskStatus(taskId, taskStatus) {
  const res = await fetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ taskStatus }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `상태 변경 실패 (HTTP ${res.status})`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }

  return true;
}