import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { Church } from 'app/model/Church';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChurchesService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formats = new FormatsPipe();

  private readonly api = `${environment.apiUrl}/admin/churches`;
  private readonly selectedChurchSubject = new BehaviorSubject<Church | null>(null);

  readonly selectedChurch$ = this.selectedChurchSubject.asObservable();

  constructor() {
    const selectedChurchId = localStorage.getItem('selectedChurch');
    if (selectedChurchId) {
      this.getChurchById(selectedChurchId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((church) => this.selectedChurchSubject.next(church));
    }
  }

  getChurches(): Observable<Church[]> {
    return this.http.get<Church[]>(this.api).pipe(
      map((churches) =>
        churches.map((church) => ({
          ...church,
          cnpj: this.formats.cnpjFormat(church.cnpj),
        })),
      ),
    );
  }

  getChurchById(id: string): Observable<Church> {
    return this.http.get<Church>(`${this.api}/${id}`);
  }

  setSelectedChurch(church: Church): void {
    localStorage.setItem('selectedChurch', church.id);
    this.selectedChurchSubject.next(church);
  }

  getSelectedChurch(): Observable<Church | null> {
    return this.selectedChurch$;
  }

  clearSelectedChurch(): void {
    localStorage.removeItem('selectedChurch');
    this.selectedChurchSubject.next(null);
  }

  createChurch(church: Church): Observable<Church> {
    return this.http.post<Church>(this.api, church);
  }

  updateChurch(id: string, data: Partial<Church>): Observable<Church> {
    return this.http.put<Church>(`${this.api}/${id}`, data);
  }

  deleteChurch(church: Church): Observable<Church> {
    return this.http.delete<Church>(`${this.api}/${church.id}`);
  }
}
