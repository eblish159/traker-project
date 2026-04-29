package com.tracker.tracker.task.service;

import com.tracker.tracker.task.vo.TaskVO;

import com.tracker.tracker.task.vo.TaskListResponseVO;

import java.util.List;

public interface TaskService {

    // 작업 생성
    TaskVO createTask(TaskVO taskVO);

    // 작업 단건 조회
    TaskVO selectTaskById(Long taskId);

    // 데이터 상태 기준 조회 (ACTIVE / DELETED)
    List<TaskVO> getTasks(String status);

    // 작업 진행 상태 기준 조회 (TODO / DOING / DONE)
    List<TaskVO> getTasksByTaskStatus(String taskStatus);

    // 작업 내용 수정
    TaskVO updateTask(TaskVO taskVO);

    // 작업 진행 상태만 변경
    TaskVO updateTaskStatus(Long taskId, String taskStatus);

    // 논리 삭제
    void deleteTask(Long taskId);

    //오늘 마감 조회
    List<TaskVO> getTodayTasks(String userId);

    //지연 작업 조회
    List<TaskVO> getOverdueTasks(String userId);

    //페이지
    TaskListResponseVO getTaskPage(String userId, int page, int size, Long categoryId, String taskStatus, String due);
}