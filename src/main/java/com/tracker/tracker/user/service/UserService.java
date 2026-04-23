package com.tracker.tracker.user.service;

public interface UserService {
    boolean authenticate(String userId, String password);
}