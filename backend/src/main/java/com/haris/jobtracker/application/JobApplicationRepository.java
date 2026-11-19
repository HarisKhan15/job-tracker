package com.haris.jobtracker.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findAllByOrderByUpdatedAtDesc();

    @Query("select a.status, count(a) from JobApplication a group by a.status")
    List<Object[]> countByStatus();
}
