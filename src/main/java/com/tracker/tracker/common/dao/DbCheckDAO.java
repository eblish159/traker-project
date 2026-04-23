package com.tracker.tracker.common.dao;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DbCheckDAO {
    int selectOneFromDual();
}

