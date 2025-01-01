import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Profile } from 'app/model/Profile';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  constructor(private http: HttpClient) {}
  private api = `${environment.apiUrl}/admin/profiles`;
  private apiUrlPermission = `${environment.apiUrl}/admin/permissions`;

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

  getPermissions(): Observable<Permissions[]> {
    return this.http.get<Permissions[]>(this.apiUrlPermission);
  }

  updatePermission(
    profileId: string,
    permissionId: string,
    data: any,
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrlPermission}/profiles/${profileId}/permissions/${permissionId}`,
      data,
    );
  }
}
