package com.tracker.tracker.user.service;

import com.tracker.tracker.user.dao.UserDAO;
import com.tracker.tracker.user.vo.UserVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserDAO userDAO, PasswordEncoder passwordEncoder) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean authenticate(String userId, String password) {

        if (userId == null || userId.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {
            return false;
        }

        UserVO user = userDAO.findByUserId(userId);

        if (user == null) {
            System.out.println("로그인 정보가 없습니다.");
            return false;
        }

        boolean isValidPassword = passwordEncoder.matches(password, user.getUserPassword());
        System.out.println("비밀번호 검증 결과: " + isValidPassword);

        return isValidPassword;
    }
}