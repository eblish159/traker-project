package com.tracker.tracker.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration //Mybatis설정이 있구나 인식
@MapperScan("com.tracker.tracker.**.dao")//이 패키지 아래에 있는 인터페이스들을 전부 dao(mapper)로 인식해라
//
public class MyBatisConfig {
}
