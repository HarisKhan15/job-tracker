import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationStatus, JobApplication, JobApplicationRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api/applications';

  list(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.base);
  }

  create(body: JobApplicationRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.base, body);
  }

  update(id: number, body: JobApplicationRequest): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.base}/${id}`, body);
  }

  changeStatus(id: number, status: ApplicationStatus): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/export`, { responseType: 'blob' });
  }
}
