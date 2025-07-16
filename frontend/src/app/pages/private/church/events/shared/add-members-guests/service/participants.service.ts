// app/services/participants.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ParticipantsService {
  private participantIdsByEvent: { [eventId: string]: string[] } = {};

  addParticipant(eventId: string, participantId: string) {
    if (!this.participantIdsByEvent[eventId]) {
      this.participantIdsByEvent[eventId] = [];
    }
    if (!this.participantIdsByEvent[eventId].includes(participantId)) {
      this.participantIdsByEvent[eventId].push(participantId);
    }
  }

  getParticipantIds(eventId: string): string[] {
    return this.participantIdsByEvent[eventId] || [];
  }

  clearParticipantIds(eventId: string) {
    delete this.participantIdsByEvent[eventId];
  }
}
