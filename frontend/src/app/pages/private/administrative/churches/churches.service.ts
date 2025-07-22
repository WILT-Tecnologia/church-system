import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { FormatsPipe } from 'app/components/crud/pipes/formats.pipe';
import { Church } from 'app/model/Church';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChurchsService {
  private selectedChurchSubject = new BehaviorSubject<Church | null>(null);
  selectedChurch$ = this.selectedChurchSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inicializar a igreja selecionada do localStorage, se disponível
    const selectedChurchId = localStorage.getItem('selectedChurch');
    if (selectedChurchId) {
      this.getChurchById(selectedChurchId).subscribe((church) => {
        this.selectedChurchSubject.next(church);
      });
    }
  }

  private api = `${environment.apiUrl}/admin/churches`;
  private formats = new FormatsPipe();

  getChurch(): Observable<Church[]> {
    return this.http.get<Church[]>(this.api).pipe(
      map((churches: Church[]) => {
        return churches.map((church: Church) => {
          church.cnpj = this.formats.cnpjFormat(church.cnpj);
          return church;
        });
      }),
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

  updateChurch(churchId: string, churchData: Partial<Church>): Observable<Church> {
    return this.http.put<Church>(`${this.api}/${churchId}`, churchData);
  }

  deleteChurch(church: Church): Observable<Church> {
    return this.http.delete<Church>(`${this.api}/${church.id}`);
  }
}
