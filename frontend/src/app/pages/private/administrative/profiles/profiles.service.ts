import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Module, Profile, ProfileModule } from 'app/model/Profile';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  constructor(private http: HttpClient) {}

  private api = `${environment.apiUrl}/admin/profiles`;
  private apiUrlPermission = `${environment.apiUrl}/admin/modules`;

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

  getPermissions(): Observable<ProfileModule[]> {
    return this.http.get<ProfileModule[]>(this.apiUrlPermission);
  }

  getProfilePermissions(profileId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.api}/${profileId}/modules`);
  }

  updatePermission(
    profileId: string,
    permissionId: string,
    data: any,
  ): Observable<ProfileModule> {
    return this.http.patch<ProfileModule>(
      `${this.apiUrlPermission}/profiles/${profileId}/modules/${permissionId}`,
      data,
    );
  }
}
