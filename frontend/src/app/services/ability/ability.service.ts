import { Injectable } from '@angular/core';

import { PureAbility } from '@casl/ability';
import { Actions, AppAbility, defineAbilitiesFor, Subjects } from 'app/model/Ability';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AbilityService {
  ability: AppAbility;

  constructor(private authService: AuthService) {
    this.ability = new PureAbility([]);

    // Atualiza sempre que as permissões mudarem
    this.authService.permissions$.subscribe((permissions) => {
      this.ability.update(defineAbilitiesFor(permissions));
    });
  }

  can(action: Actions, subject: Subjects): boolean {
    return this.ability.can(action, subject);
  }
}
