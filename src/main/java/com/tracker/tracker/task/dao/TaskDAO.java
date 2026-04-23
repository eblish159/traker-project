package com.tracker.tracker.task.dao;

import com.tracker.tracker.task.vo.TaskVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskDAO {

    int insertTask(TaskVO taskVO);

    TaskVO selectTaskById(Long taskId);

    List<TaskVO> selectAllNotDeletedTasks();

    List<TaskVO> selectTasksByStatus(String status);

    List<TaskVO> selectTasksByTaskStatus(String taskStatus);

    List<TaskVO> selectTodayTasks(@Param("userId") String userId);

    List<TaskVO> selectOverdueTasks(@Param("userId") String userId);

    int updateTask(TaskVO taskVO);

    int updateTaskStatus(@Param("taskId") Long taskId, @Param("taskStatus") String taskStatus);

    int deleteTask(Long taskId);

    //페이지 네이션
    List<TaskVO> selectTaskPage(@Param("userId") String userId,
                                @Param("offset") int offset,
                                @Param("size") int size,
                                @Param("categoryId") Long categoryId,
                                @Param("taskStatus") String taskStatus);

    int countTasks(@Param("userId") String userId,
                   @Param("categoryId") Long getCategoryId,
                    @Param("taskStatus") String taskStatus);

}