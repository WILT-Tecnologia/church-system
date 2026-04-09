import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, input, numberAttribute } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TabDirective } from './tab.directive';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  imports: [MatTabsModule, NgTemplateOutlet],
})
export class TabsComponent {
  tabs = contentChildren(TabDirective);
  animationDuration = input(300, { transform: numberAttribute });
  stretchTabs = input<boolean>(false);
  alignTabs = input<'start' | 'center' | 'end'>('start');
}
