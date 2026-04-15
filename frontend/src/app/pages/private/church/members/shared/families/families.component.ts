import { ChangeDetectionStrategy, Component, inject, OnInit, output, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Families } from '@app/model/Families';
import { FormService } from '@app/services/form-service.service';
import { MembersService } from '../../members.service';
import { FamiliesFormComponent } from './families-form/families-form.component';
import { FamiliesService } from './families.service';

@Component({
  selector: 'app-families',
  templateUrl: './families.component.html',
  styleUrls: ['./families.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CrudComponent],
})
export class FamiliesComponent implements OnInit {
  private readonly confirmService = inject(ConfirmService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);
  private readonly familiesService = inject(FamiliesService);
  private readonly modal = inject(ModalService);
  private readonly formService = inject(FormService);
  private readonly membersService = inject(MembersService);
  public readonly data = inject(MAT_DIALOG_DATA);

  public readonly families = signal<Families[]>([]);
  public readonly rendering = signal(true);
  public readonly dataSourceMat = new MatTableDataSource<Families>([]);
  public readonly familyUpdated = output<Families[]>();
  public families$ = toObservable(this.families);

  public readonly columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'is_member', header: 'A filiação é membro?', type: 'YesNo' },
    { key: 'combinedName', header: 'Nome', type: 'string' },
    { key: 'kinship.name', header: 'Parentesco', type: 'string' },
  ];

  public readonly actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (family: Families) => this.handleUpdate(family),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (family: Families) => this.handleDelete(family),
    },
  ];

  ngOnInit() {
    this.getFamiliesAll();
  }

  private getFamiliesAll() {
    const memberId = this.membersService.getEditingMemberId();
    if (memberId) {
      this.membersService.getFamilyOfMemberId(memberId).subscribe({
        next: (familiesResp) => {
          const mapped = familiesResp.map((family) => ({
            ...family,
            combinedName: family.person ? family.person.name : family.name || '',
          }));
          this.families.set(mapped);
          this.dataSourceMat.data = mapped;
        },
        error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
        complete: () => this.loadingService.hide(),
      });
    } else {
      this.toastService.openError(
        'Não foi encontrado dados do membro para encontrar suas filiações.',
      );
      this.loadingService.hide();
    }
  }

  onCreate() {
    const memberId = this.membersService.getEditingMemberId();

    if (!memberId) {
      this.toastService.openError(
        'Não foi possível identificar o membro para adicionar a filiação.',
      );
      return;
    }

    const modal = this.formService.openFormModal(
      'Adicionando uma filiação',
      FamiliesFormComponent,
      { families: { member: { id: memberId } } as Families },
      ['cancel', 'save'],
      true,
    );

    modal.subscribe((result: Families) => {
      if (result) {
        this.familiesService.create(result).subscribe({
          next: () => {
            this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS);
            this.getFamiliesAll();
          },
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadingService.hide(),
        });
      }
    });
  }

  handleUpdate(family: Families) {
    const familyName = family.person ? family.person.name : family.name;

    const modal = this.formService.openFormModal(
      `Editando uma filiação ${familyName}`,
      FamiliesFormComponent,
      { families: family, id: family.id },
      ['cancel', 'save'],
      true,
    );

    modal.subscribe((result: Families) => {
      if (result) {
        this.familiesService.updateFamilies(result).subscribe({
          next: () => {
            this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS);
            this.getFamiliesAll();
          },
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadingService.hide(),
        });
      }
    });
  }

  handleDelete(family: Families) {
    const nameFamily = family.is_member
      ? `${family.person?.name} | ${family.kinship?.name}`
      : `${family.name} | ${family.kinship?.name}`;

    const modal = this.confirmService.openConfirm(
      'Exclusão de filiação',
      `Tem certeza que deseja excluir a filiação: ${nameFamily}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.familiesService.deleteFamily(family).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => {
            this.getFamiliesAll();
            this.loadingService.hide();
          },
        });
      }
    });
  }
}
