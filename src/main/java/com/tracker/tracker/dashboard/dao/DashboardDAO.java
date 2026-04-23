package com.tracker.tracker.dashboard.dao;

import com.tracker.tracker.dashboard.vo.GroupCountVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DashboardDAO {
    int countTotalTasks(@Param("userId") String userId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate,
                        @Param("categoryId") Long categoryId);

    int countDoneTasks(@Param("userId") String userId,
                       @Param("startDate") String startDate,
                       @Param("endDate") String endDate,
                       @Param("categoryId") Long categoryId);



    List<GroupCountVO> countByPriority(@Param("userId") String userId,
                                       @Param("startDate") String startDate,
                                       @Param("endDate") String endDate,
                                       @Param("categoryId") Long categoryId);


    List<GroupCountVO> countByCategory(@Param("userId") String userId,
                                       @Param("startDate") String startDate,
                                       @Param("endDate") String endDate);
}
