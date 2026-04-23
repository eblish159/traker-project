package com.tracker.tracker.user.dao;

import com.tracker.tracker.user.vo.UserVO;

public interface UserDAO {
    UserVO findByUserId(String userId);
}
