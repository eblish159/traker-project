package com.tracker.tracker.config;

import com.tracker.tracker.task.dao.TaskDAO;
import com.tracker.tracker.task.vo.TaskVO;
import com.tracker.tracker.tasklog.dao.TaskLogDAO;
import com.tracker.tracker.tasklog.vo.TaskLogVO;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 포트폴리오 시연용 데모 데이터 시더.
 * 오늘 날짜를 기준으로 상대적인 마감일을 가진 테스트 데이터를 생성한다.
 * 기본 프로필에서는 절대 실행되지 않고, "seed" 프로필로 명시적으로 실행했을 때만 동작한다.
 * 예: ./gradlew bootRun --args='--spring.profiles.active=seed'
 */
@Component
@Profile("seed")
public class DemoDataSeeder implements CommandLineRunner {

    private static final String USER_ID = "testuser";
    private static final String[] PRIORITIES = {"HIGH", "NORMAL", "LOW"};

    // 카테고리 ID(1~10) -> 이름
    private static final Map<Long, String> CATEGORY_NAMES = new LinkedHashMap<>();
    static {
        CATEGORY_NAMES.put(1L, "개발");
        CATEGORY_NAMES.put(2L, "운동");
        CATEGORY_NAMES.put(3L, "회의");

        CATEGORY_NAMES.put(4L, "문서");
        CATEGORY_NAMES.put(5L, "테스트");
        CATEGORY_NAMES.put(6L, "버그");
        CATEGORY_NAMES.put(7L, "배포");
        CATEGORY_NAMES.put(8L, "디자인");
        CATEGORY_NAMES.put(9L, "학습");
        CATEGORY_NAMES.put(10L, "개인");
    }

    // 카테고리별 제목 후보
    private static final Map<Long, String[]> TITLES_BY_CATEGORY = new HashMap<>();
    static {
        TITLES_BY_CATEGORY.put(1L, new String[]{"API 설계", "로그인 기능 구현", "DB 스키마 검토", "예외 처리 보완", "리팩터링"});
        TITLES_BY_CATEGORY.put(2L, new String[]{"헬스장 가기", "러닝 30분", "스트레칭", "요가 수업"});
        TITLES_BY_CATEGORY.put(3L, new String[]{"주간 팀 회의", "기획 회의", "코드 리뷰 미팅", "스프린트 회고"});
        TITLES_BY_CATEGORY.put(4L, new String[]{"요구사항 정리", "README 작성", "기획서 작성", "회의록 정리"});
        TITLES_BY_CATEGORY.put(5L, new String[]{"테스트 코드 작성", "통합 테스트", "API 테스트", "회귀 테스트"});
        TITLES_BY_CATEGORY.put(6L, new String[]{"로그인 오류 수정", "날짜 계산 버그 수정", "화면 깨짐 수정", "널포인터 예외 수정"});
        TITLES_BY_CATEGORY.put(7L, new String[]{"배포 스크립트 점검", "서버 배포", "배포 자동화 설정", "롤백 테스트"});
        TITLES_BY_CATEGORY.put(8L, new String[]{"화면 목업 제작", "컬러 팔레트 정리", "아이콘 디자인", "반응형 레이아웃 수정"});
        TITLES_BY_CATEGORY.put(9L, new String[]{"스프링 강의 수강", "알고리즘 문제 풀이", "기술 블로그 읽기", "새 프레임워크 학습"});
        TITLES_BY_CATEGORY.put(10L, new String[]{"병원 예약", "은행 업무", "책 읽기", "집 정리"});
    }

    private final TaskDAO taskDAO;
    private final TaskLogDAO taskLogDAO;

    public DemoDataSeeder(TaskDAO taskDAO, TaskLogDAO taskLogDAO) {
        this.taskDAO = taskDAO;
        this.taskLogDAO = taskLogDAO;
    }

    @Override
    public void run(String... args) {
        List<Long> existingTaskIds = taskDAO.selectTaskIdsByUserId(USER_ID);
        if (!existingTaskIds.isEmpty()) {
            taskLogDAO.deleteTaskLogsByTaskIds(existingTaskIds);
        }
        taskDAO.deleteTasksByUserId(USER_ID);

        List<TaskVO> tasks = buildDemoTasks();
        Random random = new Random();

        for (TaskVO task : tasks) {
            taskDAO.insertTask(task); // useGeneratedKeys=true라 이 시점에 task.getTaskId()가 채워짐

            if ("DONE".equals(task.getTaskStatus())) {
                Date completedDate = randomDateBetween(task.getCreatedDate(), task.getDueDate(), random);

                TaskLogVO log = new TaskLogVO();
                log.setTaskId(task.getTaskId());
                log.setUserId(USER_ID);
                log.setActionType("STATUS_CHANGE");
                log.setBeforeStatus("DOING");
                log.setAfterStatus("DONE");
                log.setCreatedDate(completedDate);

                taskLogDAO.insertTaskLog(log);
            }
        }

        System.out.println("[DemoDataSeeder] 오늘(" + new Date() + ") 기준 데모 데이터 "
                + tasks.size() + "건 생성 완료");
    }

    private List<TaskVO> buildDemoTasks() {
        List<TaskVO> tasks = new ArrayList<>();
        Random random = new Random();

        // {오프셋(일), 상태} - 최근 7일(-7~+7) 구간 안에 완료/진행중/할일/지연이 골고루 섞이도록 직접 설계
        Object[][] plan = {
                // 과거(-7~-1일): 완료된 것도 있고, 완료 못 해서 지연 중인 것도 섞음
                {-7, "DONE"},
                {-6, "DONE"}, {-6, "DOING"},
                {-5, "DONE"}, {-5, "TODO"},     // TODO = 지연 작업
                {-4, "DONE"}, {-4, "DOING"},
                {-3, "DONE"}, {-3, "TODO"},     // 지연 작업
                {-2, "DOING"}, {-2, "TODO"},    // 지연 작업
                {-1, "DONE"}, {-1, "DOING"}, {-1, "TODO"}, // 지연 작업

                // 오늘(0일): 이미 끝낸 것 + 아직 진행중/예정
                {0, "DONE"}, {0, "DOING"}, {0, "TODO"},

                // 미래(+1~+7일): 미리 끝낸 것도 일부, 대부분은 진행중/할일
                {1, "DONE"}, {1, "DOING"},
                {2, "DOING"}, {2, "TODO"},
                {3, "TODO"}, {3, "DOING"},
                {4, "TODO"},
                {5, "TODO"},
                {6, "TODO"},
                {7, "TODO"},

                // 최근 7일 범위 밖 과거 (전체 기간 지연 작업 수 채우기용, 대부분 미완료)
                {-14, "TODO"}, {-12, "TODO"}, {-10, "DONE"}, {-10, "TODO"}, {-9, "TODO"}
        };

        for (Object[] item : plan) {
            int offset = (int) item[0];
            String taskStatus = (String) item[1];

            long categoryId = random.nextInt(10) + 1L;
            String[] titleOptions = TITLES_BY_CATEGORY.get(categoryId);
            String title = titleOptions[random.nextInt(titleOptions.length)];

            TaskVO task = new TaskVO();
            task.setTaskTitle(title);
            task.setTaskContent("[" + CATEGORY_NAMES.get(categoryId) + "] " + title + " 관련 상세 설명입니다.");
            task.setUserId(USER_ID);
            task.setCategoryId(categoryId);
            task.setPriority(PRIORITIES[random.nextInt(PRIORITIES.length)]);
            task.setStatus("ACTIVE");

            Date dueDate = addDays(today(), offset);
            task.setDueDate(dueDate);
            task.setTaskStatus(taskStatus);

            Date createdDate = addDays(dueDate, -(1 + random.nextInt(5))); // 마감일보다 며칠 전 등록
            task.setCreatedDate(createdDate);
            task.setUpdatedDate(addDays(createdDate, random.nextInt(3)));

            tasks.add(task);
        }
        return tasks;
    }

    /**
     * start ~ end 사이의 임의의 날짜(시간 포함)를 반환한다.
     * end가 start보다 앞서는 경우(마감일이 생성일보다 이른 경우)를 대비해 방어 처리한다.
     */
    private Date randomDateBetween(Date start, Date end, Random random) {
        long startMillis = start.getTime();
        long endMillis = Math.max(end.getTime(), startMillis);
        long diff = endMillis - startMillis;
        long randomMillis = startMillis + (long) (random.nextDouble() * diff);
        return new Date(randomMillis);
    }

    private Date today() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private Date addDays(Date date, int days) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, days);
        return cal.getTime();
    }
}