package com.tracker.tracker.user.controller;

import com.tracker.tracker.user.service.UserService;
import com.tracker.tracker.user.vo.UserVO;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.Authenticator;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    private UserService userService;

    //로그인 요청처리
    @PostMapping
    public ResponseEntity<Map<String, String>> login(@RequestBody UserVO loginRequest, HttpSession session) {
        System.out.println("로그인 컨트롤러 진입");
        Map<String, String> response = new HashMap<>();

        if (loginRequest.getUserId() == null || loginRequest.getUserId().trim().isEmpty()
                || loginRequest.getUserPassword() == null || loginRequest.getUserPassword().trim().isEmpty()) {

            response.put("error", "유저 아이디와 비밀번호는 필수입니다.");
            return ResponseEntity.badRequest().body(response);
        }

      boolean isAuthenticated = userService.authenticate(loginRequest.getUserId(), loginRequest.getUserPassword());

      if(isAuthenticated){
          session.setAttribute("userId", loginRequest.getUserId());
          response.put("message", "로그인 성공");
          return ResponseEntity.ok(response);
      } else {
          response.put("error" , "로그인 정보가 없습니다.");
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
      }
    }

    //로그아웃 처리
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session){
        session.invalidate();
        Map<String, String> response = new HashMap<>();
        response.put("message" , "로그아웃 되었습니다.");
        return  ResponseEntity.ok(response);
    }


}
