import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { TypeEntry } from 'app/model/Patrimonies';

@Component({
  selector: 'app-badge-type',
  templateUrl: './badge-type.component.html',
  styleUrl: './badge-type.component.scss',
  imports: [CommonModule],
})
export class BadgeTypeComponent {
  type = input.required<TypeEntry>();

  // Mapeia o valor enum para o texto amigável (evita pipe extra)
  private readonly labels: Record<TypeEntry, string> = {
    [TypeEntry.Compra]: 'Compra',
    [TypeEntry.Doação]: 'Doação',
    [TypeEntry.Transferência]: 'Transferência',
  };

  label = computed(() => this.labels[this.type()] ?? this.type());

  badgeClass = computed(() => ({
    'badge-compra': this.type() === TypeEntry.Compra,
    'badge-doacao': this.type() === TypeEntry.Doação,
    'badge-transferencia': this.type() === TypeEntry.Transferência,
  }));
}
