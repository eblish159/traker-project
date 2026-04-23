package com.tracker.tracker.common.service;

import com.tracker.tracker.common.dao.TaskCategoryDAO;
import com.tracker.tracker.common.vo.TaskCategoryVO;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class TaskCategoryServiceImpl implements  TaskCategoryService{

    private final TaskCategoryDAO taskCategoryDAO;

    public TaskCategoryServiceImpl(TaskCategoryDAO taskCategoryDAO) {
        this.taskCategoryDAO = taskCategoryDAO;
    }
    @Override
    public List<TaskCategoryVO> getAllCategories() {
        return taskCategoryDAO.selectAll();
    }
}
