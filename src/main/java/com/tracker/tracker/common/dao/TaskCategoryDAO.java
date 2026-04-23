package com.tracker.tracker.common.dao;

import com.tracker.tracker.common.vo.TaskCategoryVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TaskCategoryDAO {
    List<TaskCategoryVO> selectAll();
}
