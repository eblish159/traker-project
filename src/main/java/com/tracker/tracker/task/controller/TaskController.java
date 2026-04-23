package com.tracker.tracker.task.controller;

import com.tracker.tracker.task.service.TaskService;
import com.tracker.tracker.task.vo.TaskListResponseVO;
import com.tracker.tracker.task.vo.TaskVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    // 개발용 고정 유저
    private static final String DEV_USER_ID = "testuser";

    public TaskController(TaskService taskService){
        this.taskService = taskService;
    }

    @PostMapping
    public TaskVO createTask(@RequestBody TaskVO taskVO) {

        // =========================
        // 개발용 코드 (활성화)
        // =========================
        taskVO.setUserId(DEV_USER_ID);
        return taskService.createTask(taskVO);

        // =========================
        // 기존 세션 방식 코드 (비활성화 보관)
        // =========================
        // String userId = (String) session.getAttribute("userId");
        //
        // if (userId == null) {
        //     throw new RuntimeException("로그인이 필요합니다.");
        // }
        //
        // taskVO.setUserId(userId);
        // return taskService.createTask(taskVO);
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayTasks() {

        // =========================
        // 개발용 코드 (활성화)
        // =========================
        return ResponseEntity.ok(taskService.getTodayTasks(DEV_USER_ID));

        // =========================
        // 기존 세션 방식 코드 (비활성화 보관)
        // =========================
        // String userId = (String) session.getAttribute("userId");
        //
        // if (userId == null) {
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        // }
        //
        // return ResponseEntity.ok(taskService.getTodayTasks(userId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdueTasks() {

        // =========================
        // 개발용 코드 (활성화)
        // =========================
        return ResponseEntity.ok(taskService.getOverdueTasks(DEV_USER_ID));

        // =========================
        // 기존 세션 방식 코드 (비활성화 보관)
        // =========================
        // String userId = (String) session.getAttribute("userId");
        //
        // if (userId == null) {
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        // }
        //
        // return ResponseEntity.ok(taskService.getOverdueTasks(userId));
    }

    @GetMapping("/{taskId}")
    public TaskVO getTask(@PathVariable Long taskId) {
        return taskService.selectTaskById(taskId);
    }

    @GetMapping
    public ResponseEntity<?> getTaskPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String taskStatus
    ) {

        // =========================
        // 개발용 코드 (활성화)
        // =========================
        TaskListResponseVO response = taskService.getTaskPage(DEV_USER_ID, page, size, categoryId, taskStatus);
        return ResponseEntity.ok(response);

        // =========================
        // 기존 세션 방식 코드 (비활성화 보관)
        // =========================
        // String userId = (String) session.getAttribute("userId");
        //
        // if (userId == null) {
        //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        // }
        //
        // TaskListResponseVO response = taskService.getTaskPage(userId, page, size, categoryId);
        // return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}")
    public TaskVO updateTask(@PathVariable Long taskId, @RequestBody TaskVO taskVO){

        // =========================
        // 개발용 코드 (활성화)
        // =========================
        taskVO.setTaskId(taskId);
        taskVO.setUserId(DEV_USER_ID);
        return taskService.updateTask(taskVO);

        // =========================
        // 기존 세션 방식 코드 (비활성화 보관)
        // =========================
        // String userId = (String) session.getAttribute("userId");
        //
        // if (userId == null) {
        //     throw new RuntimeException("로그인이 필요합니다.");
        // }
        //
        // taskVO.setTaskId(taskId);
        // taskVO.setUserId(userId);
        // return taskService.updateTask(taskVO);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<TaskVO> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> request
    ) {
        String taskStatus = request.get("taskStatus");
        TaskVO updatedTask = taskService.updateTaskStatus(taskId, taskStatus);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId){
        taskService.deleteTask(taskId);
    }
}