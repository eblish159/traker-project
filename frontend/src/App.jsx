import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import TaskListPage from "./pages/TaskListPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <Link to="/dashboard">대시보드</Link>
        <Link to="/tasks">작업목록</Link>
        <Link to="/tasks/new">작업등록</Link>
      </div>

      <Routes>
       {/* 홈 들어오면 대시보드로 */}
               <Route path="/" element={<Navigate to="/dashboard" replace />} />

               <Route path="/dashboard" element={<DashboardPage />} />

               {/* ✅ Task */}
               <Route path="/tasks" element={<TaskListPage />} />
               <Route path="/tasks/new" element={<TaskCreatePage />} />

               {/* ✅ 와일드카드는 맨 마지막 */}
               <Route path="*" element={<div style={{ padding: 20 }}>대시보드로 이동하세요</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;