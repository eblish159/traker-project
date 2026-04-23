package com.tracker.tracker.task.vo;

import java.util.List;

public class TaskListResponseVO {

    private List<TaskVO> content;
    private int currentPage; //현재 페이지번호
    private int size;// 한 페이지당 보여줄 데이터 개수
    private int totalCount;// 전체 데이터 개수
    private int totalPages;// 전페 페이지 수

    public TaskListResponseVO() {}

    public List<TaskVO> getContent() {
        return content;
    }

    public void setContent(List<TaskVO> content) {
        this.content = content;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}