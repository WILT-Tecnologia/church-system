import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'environments/environment';

import { ProfilePermissions } from 'app/model/Modules';
import { Profile, ProfileModule } from 'app/model/Profile';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/admin/profiles`;
  private apiUrl_modules = `${environment.apiUrl}/admin/modules`;

  finAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.api);
  }

  getProfileById(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/${id}`);
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(this.api, profile);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.api}/${profile.id}`, profile);
  }

  updatedStatus(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.api}/${profile.id}`, profile);
  }

  deleteProfile(profileId: string): Observable<Profile> {
    return this.http.delete<Profile>(`${this.api}/${profileId}`);
  }

  getPermissions(): Observable<ProfileModule[]> {
    return this.http.get<ProfileModule[]>(this.apiUrl_modules);
  }

  getProfilePermissions(profileId: string): Observable<ProfilePermissions[]> {
    return this.http.get<ProfilePermissions[]>(`${this.api}/${profileId}/modules`);
  }

  updatePermission(profileId: string, permissionId: string, data: Partial<ProfileModule>): Observable<ProfileModule> {
    return this.http.patch<ProfileModule>(`${this.apiUrl_modules}/profiles/${profileId}/modules/${permissionId}`, data);
  }
}
