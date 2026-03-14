package com.tracker.job_tracker_backend;


import com.tracker.job_tracker_backend.Job;
import com.tracker.job_tracker_backend.JobStatus;
import com.tracker.job_tracker_backend.JobRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobRepository jobRepository;

    public JobController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    @GetMapping
    public List<Job> getAllJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String title
    ) {
        if (status != null) {
            return jobRepository.findByStatus(status);
        }
        if (company != null && !company.isBlank()) {
            return jobRepository.findByCompanyIgnoreCaseContaining(company);
        }
        if (title != null && !title.isBlank()) {
            return jobRepository.findByTitleIgnoreCaseContaining(title);
        }
        return jobRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        Optional<Job> job = jobRepository.findById(id);
        return job.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@Valid @RequestBody Job job) {
        job.setId(null);
        Job saved = jobRepository.save(job);
        return ResponseEntity.created(URI.create("/api/jobs/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable String id, @Valid @RequestBody Job updated) {
        return jobRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setCompany(updated.getCompany());
                    existing.setLocation(updated.getLocation());
                    existing.setLink(updated.getLink());
                    existing.setNotes(updated.getNotes());
                    existing.setStatus(updated.getStatus());
                    existing.setPriority(updated.getPriority());
                    Job saved = jobRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


