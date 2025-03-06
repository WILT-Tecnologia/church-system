import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private currentEditingMemberId: string | null = null;

  setEditingMemberId(memberId: string | null): string | null {
    return (this.currentEditingMemberId = memberId);
  }

  getEditingMemberId(): string | null {
    return this.currentEditingMemberId;
  }
}
