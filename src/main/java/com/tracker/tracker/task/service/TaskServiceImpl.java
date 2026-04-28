package com.tracker.tracker.task.service;

import com.tracker.tracker.task.dao.TaskDAO;
import com.tracker.tracker.task.vo.TaskListResponseVO;
import com.tracker.tracker.task.vo.TaskVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private static final Set<String> ALLOWED_TASK_STATUS = Set.of("TODO", "DOING", "DONE");

    private final TaskDAO taskDAO;

    public TaskServiceImpl(TaskDAO taskDAO){
        this.taskDAO = taskDAO;
    }

    @Override
    public TaskVO createTask(TaskVO taskVO){

        normalizeForCreate(taskVO);

        int inserted = taskDAO.insertTask(taskVO);
        if(inserted != 1){
            throw new IllegalStateException("Task 생성 실패");
        }

        if(taskVO.getTaskId() == null) {
            return taskVO;
        }

        return selectTaskById(taskVO.getTaskId());
    }

    @Override
    @Transactional(readOnly = true)
    public TaskVO selectTaskById(Long taskId) {
        if(taskId == null){
            throw new IllegalArgumentException("taskId는 필수입니다.");
        }

        TaskVO found = taskDAO.selectTaskById(taskId);
        if(found == null){
            throw new NoSuchElementException("해당 task를 찾을 수 없습니다.");
        }

        return found;
    }

    /**
     * 기존 getTasks(status)는 그대로 유지하되,
     * 이제 status는 데이터 상태(ACTIVE/DELETED) 조회용으로만 사용
     */
    @Override
    @Transactional(readOnly = true)
    public List<TaskVO> getTasks(String status) {
        if (!StringUtils.hasText(status)) {
            return taskDAO.selectAllNotDeletedTasks();
        }
        return taskDAO.selectTasksByStatus(status);
    }

    /**
     * 작업 진행 상태(TODO / DOING / DONE) 기준 조회
     */
    @Override
    @Transactional(readOnly = true)
    public List<TaskVO> getTasksByTaskStatus(String taskStatus) {
        validateTaskStatus(taskStatus);
        return taskDAO.selectTasksByTaskStatus(taskStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskVO> getTodayTasks(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("USER_ID는 필수입니다.");
        }
        return taskDAO.selectTodayTasks(userId);
    }


    @Override
    @Transactional(readOnly = true)
    public List<TaskVO> getOverdueTasks(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("USER_ID는 필수입니다.");
        }
        return taskDAO.selectOverdueTasks(userId);
    }

    @Override
    @Transactional
    public TaskVO updateTask(TaskVO taskVO){

        if(taskVO == null || taskVO.getTaskId() == null){
            throw new IllegalArgumentException("수정할 taskId는 필수입니다.");
        }

        TaskVO existing = selectTaskById(taskVO.getTaskId());

        normalizeForUpdate(taskVO, existing);

        int updated = taskDAO.updateTask(taskVO);
        if(updated != 1){
            throw new IllegalArgumentException("Task 수정에 실패했습니다.");
        }

        return selectTaskById(taskVO.getTaskId());
    }

    /**
     * 작업 진행 상태만 변경
     */
    @Override
    @Transactional
    public TaskVO updateTaskStatus(Long taskId, String taskStatus) {
        if (taskId == null) {
            throw new IllegalArgumentException("taskId는 필수입니다.");
        }

        validateTaskStatus(taskStatus);

        TaskVO existing = selectTaskById(taskId);

        if ("DELETED".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalStateException("삭제된 작업은 상태를 변경할 수 없습니다.");
        }

        int updated = taskDAO.updateTaskStatus(taskId, taskStatus);
        if (updated != 1) {
            throw new IllegalStateException("작업 상태 변경에 실패했습니다. taskId = " + taskId);
        }

        return selectTaskById(taskId);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId){
        if(taskId == null){
            throw new IllegalArgumentException("taskId는 필수입니다.");
        }

        TaskVO existing = taskDAO.selectTaskById(taskId);
        if(existing == null) {
            throw new NoSuchElementException("Task를 찾을 수 없습니다. taskId = " + taskId);
        }

        if ("DELETED".equalsIgnoreCase(existing.getStatus())){
            return;
        }

        int deleted = taskDAO.deleteTask(taskId);
        if(deleted != 1){
            throw new IllegalArgumentException("Task 삭제에 실패했습니다. taskId = " + taskId);
        }
    }

    @Override
    public TaskListResponseVO getTaskPage(String userId, int page, int size, Long categoryId, String taskStatus, String due) {

        //page 랑 size가 이상한값으로 들어오는것 방지
        if(page < 1) {
            page = 1;
        }

        if(size < 1) {
            size = 10;
        }

        // 몇개를 건너뛸지 계산
        int offset = (page - 1) * size;

        // 현재 페이지 목록 조회
        List<TaskVO> taskList = taskDAO.selectTaskPage(userId, offset, size, categoryId, taskStatus, due);

        // 전체 개수 조회
        int totalCount = taskDAO.countTasks(userId, categoryId, taskStatus, due);

        // 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalCount / size);

        // 응답 객체에 값 담기
        TaskListResponseVO response = new TaskListResponseVO();
        response.setContent(taskList);
        response.setCurrentPage(page);
        response.setSize(size);
        response.setTotalCount(totalCount);
        response.setTotalPages(totalPages);

        return response;
    }







    private void normalizeForCreate(TaskVO taskVO) {
        if (taskVO == null) {
            throw new IllegalArgumentException("요청 바디가 비어있습니다.");
        }

        if (!StringUtils.hasText(taskVO.getTaskTitle())) {
            throw new IllegalArgumentException("TASK_TITLE은 필수입니다.");
        }
        if (!StringUtils.hasText(taskVO.getUserId())) {
            throw new IllegalArgumentException("USER_ID는 필수입니다.");
        }
        if (taskVO.getCategoryId() == null) {
            throw new IllegalArgumentException("CATEGORY_ID는 필수입니다.");
        }

        if (!StringUtils.hasText(taskVO.getPriority())) {
            taskVO.setPriority("NORMAL");
        }

        // 데이터 상태
        if (!StringUtils.hasText(taskVO.getStatus())) {
            taskVO.setStatus("ACTIVE");
        }

        // 작업 진행 상태
        if (!StringUtils.hasText(taskVO.getTaskStatus())) {
            taskVO.setTaskStatus("TODO");
        } else {
            validateTaskStatus(taskVO.getTaskStatus());
        }
    }

    private void normalizeForUpdate(TaskVO taskVO, TaskVO existing) {
        if (!StringUtils.hasText(taskVO.getTaskTitle())) {
            throw new IllegalArgumentException("TASK_TITLE은 필수입니다.");
        }
        if (!StringUtils.hasText(taskVO.getUserId())) {
            throw new IllegalArgumentException("USER_ID는 필수입니다.");
        }
        if (taskVO.getCategoryId() == null) {
            throw new IllegalArgumentException("CATEGORY_ID는 필수입니다.");
        }

        if (!StringUtils.hasText(taskVO.getPriority())) {
            taskVO.setPriority("NORMAL");
        }

        // STATUS는 일반 수정에서 사용자가 임의 변경하지 않게 기존값 유지
        taskVO.setStatus(existing.getStatus());

        // TASK_STATUS가 비어 있으면 기존값 유지
        if (!StringUtils.hasText(taskVO.getTaskStatus())) {
            taskVO.setTaskStatus(existing.getTaskStatus());
        } else {
            validateTaskStatus(taskVO.getTaskStatus());
        }
    }

    private void validateTaskStatus(String taskStatus) {
        if (!StringUtils.hasText(taskStatus)) {
            throw new IllegalArgumentException("TASK_STATUS는 필수입니다.");
        }

        if (!ALLOWED_TASK_STATUS.contains(taskStatus.toUpperCase())) {
            throw new IllegalArgumentException("허용되지 않은 TASK_STATUS입니다. TODO, DOING, DONE만 가능합니다.");
        }
    }
}