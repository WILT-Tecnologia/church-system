import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTab]',
})
export class TabDirective {
  label = input.required<string>();
  template = inject(TemplateRef);
}
