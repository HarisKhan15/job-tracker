package com.haris.jobtracker.application;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationRepository repository;

    public JobApplicationController(JobApplicationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<JobApplication> list() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    @GetMapping("/{id}")
    public JobApplication get(@PathVariable Long id) {
        return find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobApplication create(@Valid @RequestBody JobApplicationRequest request) {
        JobApplication app = new JobApplication();
        request.applyTo(app);
        if (app.getAppliedDate() == null && app.getStatus() != ApplicationStatus.WISHLIST) {
            app.setAppliedDate(LocalDate.now());
        }
        return repository.save(app);
    }

    @PutMapping("/{id}")
    @Transactional
    public JobApplication update(@PathVariable Long id, @Valid @RequestBody JobApplicationRequest request) {
        JobApplication app = find(id);
        request.applyTo(app);
        return repository.save(app);
    }

    public record StatusChange(ApplicationStatus status) {}

    /** One-click status change from the list. */
    @PatchMapping("/{id}/status")
    @Transactional
    public JobApplication changeStatus(@PathVariable Long id, @RequestBody StatusChange change) {
        if (change == null || change.status() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        JobApplication app = find(id);
        app.setStatus(change.status());
        if (app.getAppliedDate() == null && change.status() != ApplicationStatus.WISHLIST) {
            app.setAppliedDate(LocalDate.now());
        }
        return repository.save(app);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repository.delete(find(id));
    }

    @GetMapping("/stats")
    public Map<ApplicationStatus, Long> stats() {
        Map<ApplicationStatus, Long> result = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus s : ApplicationStatus.values()) {
            result.put(s, 0L);
        }
        for (Object[] row : repository.countByStatus()) {
            result.put((ApplicationStatus) row[0], (Long) row[1]);
        }
        return result;
    }

    /** Backup of everything as a CSV file (opens in Excel). */
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> export() {
        StringBuilder sb = new StringBuilder();
        sb.append("Company,Position,Type,Status,Location,Applied,Follow up,Contact,Contact email,Job URL,Notes\n");
        for (JobApplication a : repository.findAllByOrderByUpdatedAtDesc()) {
            sb.append(csv(a.getCompany())).append(',')
              .append(csv(a.getPosition())).append(',')
              .append(csv(a.getType())).append(',')
              .append(csv(a.getStatus())).append(',')
              .append(csv(a.getLocation())).append(',')
              .append(csv(a.getAppliedDate())).append(',')
              .append(csv(a.getFollowUpDate())).append(',')
              .append(csv(a.getContactPerson())).append(',')
              .append(csv(a.getContactEmail())).append(',')
              .append(csv(a.getJobUrl())).append(',')
              .append(csv(a.getNotes())).append('\n');
        }
        // BOM so Excel opens umlauts (ä, ö, ü) correctly
        byte[] body = ("﻿" + sb).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"job-applications.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(body);
    }

    private static String csv(Object value) {
        if (value == null) return "";
        String s = value.toString().replace("\"", "\"\"");
        return "\"" + s + "\"";
    }

    private JobApplication find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }
}
