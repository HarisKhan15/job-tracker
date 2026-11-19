import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { ApplicationForm } from '../components/application-form';
import {
  ApplicationStatus, JOB_TYPES, JobApplication, JobType, STATUSES, statusLabel, typeLabel,
} from '../core/models';

type SortKey = 'updated' | 'applied' | 'company';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, ApplicationForm],
  templateUrl: './dashboard.html',
})
export class DashboardPage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  statuses = STATUSES;
  types = JOB_TYPES;
  statusLabel = statusLabel;
  typeLabel = typeLabel;

  apps = signal<JobApplication[]>([]);
  loading = signal(true);
  loadError = signal(false);

  search = signal('');
  statusFilter = signal<ApplicationStatus | 'ALL' | 'FOLLOW_UP'>('ALL');
  typeFilter = signal<JobType | 'ALL'>('ALL');
  sort = signal<SortKey>('updated');

  formOpen = signal(false);
  editing = signal<JobApplication | null>(null);
  expandedId = signal<number | null>(null);

  counts = computed(() => {
    const c: Record<string, number> = {};
    for (const s of STATUSES) c[s.value] = 0;
    for (const a of this.apps()) c[a.status]++;
    return c;
  });

  followUpCount = computed(() => this.apps().filter(a => this.followUpDue(a)).length);

  active = computed(() =>
    this.apps().filter(a => a.status === 'APPLIED' || a.status === 'INTERVIEW').length);

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const st = this.statusFilter();
    const ty = this.typeFilter();
    const list = this.apps().filter(a => {
      if (st === 'FOLLOW_UP' && !this.followUpDue(a)) return false;
      if (st !== 'ALL' && st !== 'FOLLOW_UP' && a.status !== st) return false;
      if (ty !== 'ALL' && a.type !== ty) return false;
      if (!q) return true;
      return [a.company, a.position, a.location, a.notes, a.contactPerson]
        .some(v => v?.toLowerCase().includes(q));
    });
    const s = this.sort();
    return [...list].sort((x, y) => {
      if (s === 'company') return x.company.localeCompare(y.company);
      if (s === 'applied') return (y.appliedDate ?? '').localeCompare(x.appliedDate ?? '');
      return y.updatedAt.localeCompare(x.updatedAt);
    });
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.list().subscribe({
      next: list => { this.apps.set(list); this.loading.set(false); },
      error: () => { this.loading.set(false); this.loadError.set(true); },
    });
  }

  openNew() {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(a: JobApplication) {
    this.editing.set(a);
    this.formOpen.set(true);
  }

  onSaved(app: JobApplication) {
    this.apps.update(list => {
      const i = list.findIndex(a => a.id === app.id);
      return i >= 0 ? list.map(a => (a.id === app.id ? app : a)) : [app, ...list];
    });
    this.formOpen.set(false);
  }

  changeStatus(a: JobApplication, status: ApplicationStatus) {
    const before = a.status;
    this.apps.update(list => list.map(x => (x.id === a.id ? { ...x, status } : x)));
    this.api.changeStatus(a.id, status).subscribe({
      next: updated => this.apps.update(list => list.map(x => (x.id === a.id ? updated : x))),
      error: () => this.apps.update(list => list.map(x => (x.id === a.id ? { ...x, status: before } : x))),
    });
  }

  remove(a: JobApplication) {
    if (!confirm(`Delete "${a.position}" at ${a.company}?`)) return;
    this.api.delete(a.id).subscribe(() => this.apps.update(list => list.filter(x => x.id !== a.id)));
  }

  toggle(a: JobApplication) {
    this.expandedId.update(id => (id === a.id ? null : a.id));
  }

  exportCsv() {
    this.api.exportCsv().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-applications-${new Date().toLocaleDateString('sv-SE')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  followUpDue(a: JobApplication): boolean {
    if (!a.followUpDate) return false;
    if (a.status !== 'APPLIED' && a.status !== 'INTERVIEW' && a.status !== 'WISHLIST') return false;
    return a.followUpDate <= new Date().toLocaleDateString('sv-SE');
  }

  daysAgo(date: string | null): string {
    if (!date) return '';
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const d = Math.round((midnight.getTime() - new Date(date + 'T00:00:00').getTime()) / 86_400_000);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return `${d} days ago`;
    const m = Math.round(d / 30);
    return m === 1 ? '1 month ago' : `${m} months ago`;
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
