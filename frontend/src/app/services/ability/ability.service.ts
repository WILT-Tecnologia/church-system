import { Injectable } from '@angular/core';
import { Actions, AppAbility, defineAbilitiesFor, Subjects } from '@app/model/Ability';
import { AuthService } from '@app/services/auth/auth.service';
import { PureAbility } from '@casl/ability';

@Injectable({
  providedIn: 'root',
})
export class AbilityService {
  ability: AppAbility;

  constructor(private authService: AuthService) {
    this.ability = new PureAbility([]);

    this.authService.permissions$.subscribe((permissions) => {
      this.ability.update(defineAbilitiesFor(permissions));
    });
  }

  can(action: Actions, subject: Subjects): boolean {
    return this.ability.can(action, subject);
  }
}
