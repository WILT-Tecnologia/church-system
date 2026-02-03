import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from 'app/services/auth/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permissions: string[] = [];
  private requireAll = false;
  private destroy$ = new Subject<void>();

  @Input() set hasPermission(permissions: string | string[]) {
    this.permissions = Array.isArray(permissions) ? permissions : [permissions];
    this.updateView();
  }

  @Input() set hasPermissionRequireAll(requireAll: boolean) {
    this.requireAll = requireAll;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authService.permissions$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const hasPermission = this.requireAll
      ? this.authService.hasPermission
      : this.authService.hasAnyPermission(this.permissions);

    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
