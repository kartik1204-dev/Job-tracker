package com.tracker.job_tracker_backend;

import com.tracker.job_tracker_backend.Job;
import com.tracker.job_tracker_backend.JobStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {

    List<Job> findByStatus(JobStatus status);

    List<Job> findByCompanyIgnoreCaseContaining(String company);

    List<Job> findByTitleIgnoreCaseContaining(String title);
}


