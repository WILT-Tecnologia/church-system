import { inject, Injectable, Type } from '@angular/core';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { Observable, Subject } from 'rxjs';

export type FormAction = 'cancel' | 'save' | ModalAction;

@Injectable({
  providedIn: 'root',
})
export class FormServiceService {
  private modalService = inject(ModalService);

  public openFormModal(
    title: string,
    component: Type<any>,
    data?: any,
    actions?: FormAction[] | ((submitSubject: Subject<void>) => FormAction[]),
    fullscreen?: boolean,
  ): Observable<any> {
    const submitSubject = new Subject<void>();
    const formAction = this.resolveActions(submitSubject, actions);

    return this.modalService
      .openModal(
        `modal-${Math.random()}`,
        component,
        title,
        true,
        true,
        { ...data, submitSubject },
        undefined,
        fullscreen ?? false,
        formAction,
      )
      .afterClosed();
  }

  /**
   * @returns Retorna os botões padrão de formulário (Cancelar e Salvar)
   */
  public getStandardActions(submitSubject: Subject<void>): ModalAction[] {
    return [this.getCancelAction(), this.getSaveAction(submitSubject)];
  }

  /**
   * @returns Resolve quais ações exibir baseado no parâmetro informado
   */
  private resolveActions(
    submitSubject: Subject<void>,
    actions?: FormAction[] | ((submitSubject: Subject<void>) => FormAction[]),
  ): ModalAction[] {
    let baseActions: FormAction[];

    if (typeof actions === 'function') {
      baseActions = actions(submitSubject);
    } else if (actions && actions.length > 0) {
      baseActions = actions;
    } else {
      baseActions = ['cancel', 'save'];
    }

    return baseActions.map((action) => {
      if (action === 'cancel') return this.getCancelAction();
      if (action === 'save') return this.getSaveAction(submitSubject);
      return action;
    });
  }

  /**
   * @returns Retorna o botão de cancelar
   */
  private getCancelAction(): ModalAction {
    return {
      label: 'Cancelar',
      type: 'stroked',
      color: 'warn',
      icon: 'close',
      onClick: (ref) => ref.close(),
    };
  }

  /**
   * @returns Retorna o botão de salvar
   */
  private getSaveAction(submitSubject: Subject<void>): ModalAction {
    return {
      label: 'Salvar',
      type: 'flat',
      color: 'primary',
      icon: 'save',
      onClick: () => submitSubject.next(),
    };
  }
}
