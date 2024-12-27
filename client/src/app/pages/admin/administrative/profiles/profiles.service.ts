import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Profile } from '../../../../model/Profile';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  constructor(private http: HttpClient) {}
  private api = `${environment.apiUrl}/admin/profiles`;

  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.api);
  }

  getProfileById(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/${id}`);
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.api, profile);
  }

  updateProfile(
    profileId: string,
    profileData: Partial<Profile>,
  ): Observable<Profile> {
    return this.http.put<Profile>(`${this.api}/${profileId}`, profileData);
  }

  updatedStatus(id: string, status: boolean): Observable<Profile> {
    const statusData = { status };
    return this.http.put<Profile>(`${this.api}/${id}`, statusData);
  }

  deleteProfile(profileId: string): Observable<Profile> {
    return this.http.delete<Profile>(`${this.api}/${profileId}`);
  }
}
