import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeConfig {
  when: boolean | string | ((value: any) => boolean);
  label: string;
  variant: BadgeVariant;
  animated?: boolean;
}

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  imports: [CommonModule],
})
export class StatusBadgeComponent {
  value = input.required<any>();
  activeLabel = input<string>('Ativado');
  inactiveLabel = input<string>('Desativado');
  size = input<BadgeSize>('md');
  animated = input<boolean>(true);
  configs = input<BadgeConfig[]>([]);
  defaultVariant = input<BadgeVariant>('neutral');
  defaultLabel = input<string | null>(null);
  hideDot = input<boolean>(false);
  className = input<string>('');

  private resolvedConfig = computed<BadgeConfig | null>(() => {
    const cfgs = this.configs();
    const val = this.value();
    if (!cfgs.length) return null;

    return (
      cfgs.find((cfg) => {
        if (typeof cfg.when === 'function') return cfg.when(val);
        if (typeof cfg.when === 'string') return String(val).toLowerCase() === cfg.when.toLowerCase();
        return cfg.when === val;
      }) ?? null
    );
  });

  variant = computed<BadgeVariant>(() => {
    const cfg = this.resolvedConfig();
    if (cfg) return cfg.variant;
    if (this.configs().length) return this.defaultVariant();
    return this.value() ? 'success' : 'danger';
  });

  label = computed<string>(() => {
    const cfg = this.resolvedConfig();
    if (cfg) return cfg.label;
    if (this.defaultLabel() !== null) return this.defaultLabel()!;
    return this.value() ? this.activeLabel() : this.inactiveLabel();
  });

  showPing = computed<boolean>(() => {
    const cfgAnimated = this.resolvedConfig()?.animated;
    const isAnimated = cfgAnimated !== undefined ? cfgAnimated : this.animated();
    return isAnimated && this.variant() === 'success';
  });

  badgeClass = computed<string>(() =>
    ['status-badge', `status-badge--${this.variant()}`, `status-badge--${this.size()}`, this.className()]
      .filter(Boolean)
      .join(' '),
  );

  dotClass = computed<string>(() =>
    ['status-badge__dot', `status-badge__dot--${this.variant()}`, `status-badge__dot--${this.size()}`].join(' '),
  );

  pingClass = computed<string>(() => ['status-badge__ping', `status-badge__ping--${this.variant()}`].join(' '));
}
