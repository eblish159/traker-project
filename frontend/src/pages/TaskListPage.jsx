import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  deleteTask,
  fetchTasks,
  updateTask,
  updateTaskStatus,
} from "../api/taskApi";

function formatDate(v) {
  if (!v) return "";
  return String(v).slice(0, 10);
}

function toApiDate(v) {
  if (!v) return null;
  return `${v}T00:00:00`;
}

const INITIAL_EDIT_FORM = {
  taskTitle: "",
  taskContent: "",
  priority: "NORMAL",
  dueDate: "",
  userId: "",
  categoryId: "",
  taskStatus: "TODO",
};

function getTaskStatusStyle(taskStatus) {
  const value = (taskStatus || "TODO").toUpperCase();

  if (value === "DONE") {
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#ecfdf5",
      color: "#065f46",
      fontWeight: 600,
      fontSize: 13,
    };
  }

  if (value === "DOING") {
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      background: "#eff6ff",
      color: "#1d4ed8",
      fontWeight: 600,
      fontSize: 13,
    };
  }

  return {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#374151",
    fontWeight: 600,
    fontSize: 13,
  };
}

export default function TaskListPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);

  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);

  const [currentPage, setCurrentPage] = useState(1);
  const [size] = useState(10); //
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [searchParams] = useSearchParams();
  const due = searchParams.get("due");

  async function load(page = currentPage) {
    setError("");

    try {
      setLoading(true);

      const params = {
        page,
        size,
      };

      if (taskStatusFilter) {
        params.taskStatus = taskStatusFilter;
      }

      if (categoryId) {
          params.categoryId = categoryId;
      }

      if (due) {
        params.due = due;
      }

      const data = await fetchTasks(params);

      setTasks(Array.isArray(data.content) ? data.content : []);
      setCurrentPage(data.currentPage ?? page);
      setTotalPages(data.totalPages ?? 0);
      setTotalCount(data.totalCount ?? 0);
    } catch (e) {
      setTasks([]);
      setTotalPages(0);
      setTotalCount(0);
      setError(e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [taskStatusFilter, categoryId, due]);

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  function startEdit(task) {
    setEditingTaskId(task.taskId);

    setEditForm({
      taskTitle: task.taskTitle || "",
      taskContent: task.taskContent || "",
      priority: task.priority || "NORMAL",
      dueDate: formatDate(task.dueDate),
      userId: task.userId || "",
      categoryId: task.categoryId != null ? String(task.categoryId) : "",
      taskStatus: (task.taskStatus || "TODO").toUpperCase(),
    });
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditForm(INITIAL_EDIT_FORM);
  }

  function onChangeEditForm(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveEdit() {
    if (editingTaskId == null) return;

    if (!editForm.taskTitle.trim()) {
      alert("제목은 필수입니다.");
      return;
    }

    if (!editForm.userId.trim()) {
      alert("userId는 필수입니다.");
      return;
    }

    if (!editForm.categoryId) {
      alert("categoryId는 필수입니다.");
      return;
    }

    const payload = {
      taskTitle: editForm.taskTitle.trim(),
      taskContent: editForm.taskContent.trim(),
      priority: editForm.priority || "NORMAL",
      dueDate: editForm.dueDate ? toApiDate(editForm.dueDate) : null,
      userId: editForm.userId.trim(),
      categoryId: Number(editForm.categoryId),
      taskStatus: editForm.taskStatus || "TODO",
    };

    try {
      await updateTask(editingTaskId, payload);
      cancelEdit();
      await load(currentPage);
    } catch (e) {
      alert(e?.message || "수정 실패");
    }
  }

  async function onDelete(task) {
    const id = task.taskId;

    if (id == null) {
      alert("taskId가 없습니다.");
      return;
    }

    if (!window.confirm("삭제할까요?")) return;

    try {
      await deleteTask(id);

      if (editingTaskId === id) {
        cancelEdit();
      }

      await load(currentPage);
    } catch (e) {
      alert(e?.message || "삭제 실패");
    }
  }

  async function onChangeTaskStatus(task, nextTaskStatus) {
    const id = task.taskId;

    if (id == null) {
      alert("taskId가 없습니다.");
      return;
    }

    try {
      await updateTaskStatus(id, nextTaskStatus);
      await load(currentPage);
    } catch (e) {
      alert(e?.message || "상태 변경 실패");
    }
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Tasks</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => load(currentPage)} disabled={loading}>
          {loading ? "로딩..." : "새로고침"}
        </button>

        {/* 카테고리 필터 */}
        <label>
          카테고리:&nbsp;
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">전체</option>
            <option value="1">개발</option>
            <option value="2">운동</option>
            <option value="3">회의</option>
            <option value="4">문서</option>
            <option value="5">테스트</option>
            <option value="6">버그</option>
            <option value="7">배포</option>
            <option value="8">디자인</option>
            <option value="9">학습</option>
            <option value="10">개인</option>
          </select>
        </label>

        {/* 작업 상태 필터 */}
        <label>
          작업 상태 필터:&nbsp;
          <select
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
          >
            <option value="">전체</option>
            <option value="TODO">TODO</option>
            <option value="DOING">DOING</option>
            <option value="DONE">DONE</option>
          </select>
        </label>

        <span style={{ marginLeft: 12, color: "#555" }}>
          전체 {totalCount}개
        </span>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1.5fr 0.8fr 130px 120px 280px",
            background: "#f7f7f7",
            padding: 10,
            fontWeight: 600,
          }}
        >
          <div>ID</div>
          <div>제목/내용</div>
          <div>우선순위</div>
          <div>마감일</div>
          <div>상태</div>
        </div>

        {tasks.length === 0 && (
          <div style={{ padding: 16, color: "#666" }}>
            표시할 Task가 없습니다.
          </div>
        )}

        {tasks.map((task) => {
          const id = task.taskId;
          const title = task.taskTitle || "";
          const content = task.taskContent || "";
          const priority = task.priority || "NORMAL";
          const dueDate = formatDate(task.dueDate);
          const taskStatus = (task.taskStatus || "TODO").toUpperCase();

          const isEditing = editingTaskId === id;

          return (
            <div
              key={id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1.5fr 0.8fr 130px 120px 280px",
                padding: 10,
                borderTop: "1px solid #eee",
                alignItems: "center",
              }}
            >
              <div>{id}</div>

              <div>
                {!isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontWeight: 600 }}>{title}</div>
                    {content && <div style={{ color: "#666", fontSize: 13 }}>{content}</div>}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      name="taskTitle"
                      value={editForm.taskTitle}
                      onChange={onChangeEditForm}
                      placeholder="제목"
                    />
                    <textarea
                      name="taskContent"
                      value={editForm.taskContent}
                      onChange={onChangeEditForm}
                      placeholder="내용"
                      rows={4}
                      style={{
                        width: "100%",
                        minHeight: 100,
                        resize: "vertical",
                        padding: "8px 10px",
                        boxSizing: "border-box",
                        lineHeight: 1.5,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                {!isEditing ? (
                  priority
                ) : (
                  <select name="priority" value={editForm.priority} onChange={onChangeEditForm}>
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                )}
              </div>

              <div>
                {!isEditing ? (
                  dueDate || "-"
                ) : (
                  <input
                    type="date"
                    name="dueDate"
                    value={editForm.dueDate}
                    onChange={onChangeEditForm}
                  />
                )}
              </div>

              <div>
                {!isEditing ? (
                  <span style={getTaskStatusStyle(taskStatus)}>{taskStatus}</span>
                ) : (
                  <select
                    name="taskStatus"
                    value={editForm.taskStatus}
                    onChange={onChangeEditForm}
                  >
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="DONE">DONE</option>
                  </select>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap", flexWrap: "wrap" }}>
                {!isEditing ? (
                  <>
{/*                     <select */}
{/*                       value={taskStatus} */}
{/*                       onChange={(e) => onChangeTaskStatus(task, e.target.value)} */}
{/*                       style={{ padding: "4px 8px" }} */}
{/*                     > */}
{/*                       <option value="TODO">TODO</option> */}
{/*                       <option value="DOING">DOING</option> */}
{/*                       <option value="DONE">DONE</option> */}
{/*                     </select> */}

                    <button
                      style={{ padding: "4px 10px", color: "#2563eb" }}
                      onClick={() => startEdit(task)}
                    >
                      수정
                    </button>

                    <button
                      style={{ padding: "4px 10px", color: "#dc2626" }}
                      onClick={() => onDelete(task)}
                    >
                      삭제
                    </button>
                  </>
                ) : (
                  <>
                    <button style={{ padding: "4px 10px", color: "#2563eb" }} onClick={saveEdit}>
                      수정완료
                    </button>

                    <button style={{ padding: "4px 10px" }} onClick={cancelEdit}>
                      취소
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            disabled={pageNum === currentPage}
            style={{
              fontWeight: pageNum === currentPage ? 700 : 400,
              minWidth: 32,
            }}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}