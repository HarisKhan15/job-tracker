package com.haris.jobtracker.application;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** What the frontend sends when creating or editing an application. */
public record JobApplicationRequest(
        @NotBlank @Size(max = 200) String company,
        @NotBlank @Size(max = 200) String position,
        JobType type,
        ApplicationStatus status,
        @Size(max = 200) String location,
        @Size(max = 1000) String jobUrl,
        LocalDate appliedDate,
        LocalDate followUpDate,
        @Size(max = 200) String contactPerson,
        @Email @Size(max = 200) String contactEmail,
        @Size(max = 5000) String notes
) {

    void applyTo(JobApplication app) {
        app.setCompany(company.trim());
        app.setPosition(position.trim());
        app.setType(type != null ? type : JobType.WERKSTUDENT);
        app.setStatus(status != null ? status : ApplicationStatus.APPLIED);
        app.setLocation(blankToNull(location));
        app.setJobUrl(blankToNull(jobUrl));
        app.setAppliedDate(appliedDate);
        app.setFollowUpDate(followUpDate);
        app.setContactPerson(blankToNull(contactPerson));
        app.setContactEmail(blankToNull(contactEmail));
        app.setNotes(blankToNull(notes));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
