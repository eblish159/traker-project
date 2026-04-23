import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api/categoryApi";
import { createTask } from "../api/taskApi";

export default function TaskCreatePage() {
  const [categories, setCategories] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate] = useState(""); // "YYYY-MM-DD"
  const [categoryId, setCategoryId] = useState("");
  const [userId, setUserId] = useState("testuser"); // ✅ 일단 고정 (나중에 세션으로 교체)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchCategories();
        setCategories(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!taskTitle.trim()) {
      setError("제목은 필수입니다.");
      return;
    }
    if (!categoryId) {
      setError("카테고리를 선택하세요.");
      return;
    }
    if (!userId.trim()) {
      setError("userId는 필수입니다.");
      return;
    }

    const payload = {
      taskTitle: taskTitle.trim(),
      taskContent: taskContent.trim() ? taskContent.trim() : null,
      priority,
      dueDate: dueDate ? dueDate : null,
      userId: userId.trim(),
      categoryId: Number(categoryId),
    };

    try {
      setLoading(true);
      const saved = await createTask(payload);
      setSuccessMsg(`등록 완료! taskId = ${saved.taskId}`);

      // 입력 초기화
      setTaskTitle("");
      setTaskContent("");
      setPriority("NORMAL");
      setDueDate("");
      setCategoryId("");
    } catch (e2) {
      setError(e2?.message || "등록 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h2>Task 등록</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>제목 *</label>
          <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>내용</label>
          <textarea
            rows={4}
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>우선순위</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="NORMAL">NORMAL</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>마감일</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>카테고리 *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">선택하세요</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>userId *</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} />
          <div style={{ opacity: 0.6, fontSize: 12 }}>
            ※ 나중에 로그인/세션 붙이면 userId 입력칸은 제거 가능
          </div>
        </div>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
        {successMsg && <div style={{ color: "green" }}>{successMsg}</div>}

        <button disabled={loading} style={{ height: 36 }}>
          {loading ? "등록중..." : "등록"}
        </button>
      </form>
    </div>
  );
}