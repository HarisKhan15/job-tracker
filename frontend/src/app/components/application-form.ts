import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../core/api.service';
import { JOB_TYPES, JobApplication, JobApplicationRequest, STATUSES } from '../core/models';

const today = () => new Date().toLocaleDateString('sv-SE'); // yyyy-MM-dd in local time

@Component({
  selector: 'app-application-form',
  imports: [FormsModule],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="save()" #f="ngForm">
        <div class="modal-head">
          <h2>{{ existing() ? 'Edit application' : 'New application' }}</h2>
          <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Close">✕</button>
        </div>

        <div class="grid">
          <label>Company *
            <input name="company" [(ngModel)]="m.company" required maxlength="200" placeholder="e.g. Deutsche Bahn" autofocus />
          </label>
          <label>Position *
            <input name="position" [(ngModel)]="m.position" required maxlength="200" placeholder="e.g. Werkstudent Java Backend" />
          </label>
          <label>Type
            <select name="type" [(ngModel)]="m.type">
              @for (t of types; track t.value) { <option [value]="t.value">{{ t.label }}</option> }
            </select>
          </label>
          <label>Status
            <select name="status" [(ngModel)]="m.status">
              @for (s of statuses; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
            </select>
          </label>
          <label>Location
            <input name="location" [(ngModel)]="m.location" placeholder="Frankfurt / Remote" />
          </label>
          <label>Job link
            <input name="jobUrl" [(ngModel)]="m.jobUrl" type="url" placeholder="https://…" />
          </label>
          <label>Applied on
            <input name="appliedDate" [(ngModel)]="m.appliedDate" type="date" />
          </label>
          <label>Follow up on
            <input name="followUpDate" [(ngModel)]="m.followUpDate" type="date" />
          </label>
          <label>Contact person
            <input name="contactPerson" [(ngModel)]="m.contactPerson" placeholder="Prof. / HR name" />
          </label>
          <label>Contact email
            <input name="contactEmail" [(ngModel)]="m.contactEmail" type="email" />
          </label>
          <label class="span-2">Notes
            <textarea name="notes" [(ngModel)]="m.notes" rows="4" maxlength="5000"
              placeholder="Interview questions, what you sent, salary, anything…"></textarea>
          </label>
        </div>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <div class="modal-actions">
          <button type="button" class="btn" (click)="closed.emit()">Cancel</button>
          <button type="submit" class="btn primary" [disabled]="saving() || f.invalid">
            {{ saving() ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ApplicationForm implements OnInit {
  private api = inject(ApiService);

  existing = input<JobApplication | null>(null);
  saved = output<JobApplication>();
  closed = output<void>();

  statuses = STATUSES;
  types = JOB_TYPES;
  saving = signal(false);
  error = signal('');

  m: JobApplicationRequest = {
    company: '', position: '', type: 'WERKSTUDENT', status: 'APPLIED',
    location: 'Frankfurt', jobUrl: '', appliedDate: today(), followUpDate: null,
    contactPerson: '', contactEmail: '', notes: '',
  };

  ngOnInit() {
    const e = this.existing();
    if (e) {
      const { id, createdAt, updatedAt, ...rest } = e;
      this.m = { ...rest };
    }
  }

  save() {
    this.saving.set(true);
    this.error.set('');
    const body: JobApplicationRequest = {
      ...this.m,
      appliedDate: this.m.appliedDate || null,
      followUpDate: this.m.followUpDate || null,
    };
    const e = this.existing();
    const req = e ? this.api.update(e.id, body) : this.api.create(body);
    req.subscribe({
      next: app => { this.saving.set(false); this.saved.emit(app); },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(err.status === 400 ? 'Please check the fields (e.g. email format).' : 'Could not save. Try again.');
      },
    });
  }
}
