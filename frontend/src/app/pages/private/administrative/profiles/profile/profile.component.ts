import { FlatTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { ColumnComponent } from '@app/components/column/column.component';
import { LoadingService } from '@app/components/loading/loading.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Modules } from '@app/model/Modules';
import { Profile, ProfileModule } from '@app/model/Profile';
import { ValidationService } from '@app/services/validation/validation.service';
import { Subject, takeUntil } from 'rxjs';
import { ModuleService } from '../../modules/modules.service';
import { ProfilesService } from '../profiles.service';

interface ProfileModuleData {
  module_id: string;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

interface ModuleNode {
  name: string;
  id?: string;
  controlName?: string;
  parentFormGroup?: FormGroup;
  children?: ModuleNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  controlName?: string;
  parentFormGroup?: FormGroup;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    MatTreeModule,
    ColumnComponent,
    MatTabsModule,
  ],
})
export class ProfileComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastService);
  private readonly profilesService = inject(ProfilesService);
  private readonly moduleService = inject(ModuleService);
  private readonly dialogRef = inject(MatDialogRef<ProfileComponent>);
  private readonly data: { profile: Profile; submitSubject?: Subject<void> } =
    inject(MAT_DIALOG_DATA);

  profileForm: FormGroup = this.createForm();
  profile: Profile[] = [];
  modules: Modules[] = [];
  profileModule: ProfileModule[] = [];
  isEditMode = signal(false);
  private destroy$ = new Subject<void>();

  private readonly _transformer = (node: ModuleNode, level: number): FlatNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      controlName: node.controlName,
      parentFormGroup: node.parentFormGroup,
    };
  };

  readonly treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );
  readonly treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );
  readonly dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  readonly hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit() {
    this.loadModules();
    if (this.data && this.data?.profile) {
      this.isEditMode.set(true);
      this.profileForm.patchValue({
        id: this.data.profile.id,
        name: this.data.profile.name,
        description: this.data.profile.description,
        status: this.data.profile.status,
      });
    }

    if (this.data?.submitSubject) {
      this.data.submitSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.handleSubmit();
      });
    }
  }

  private createForm(): FormGroup {
    const profile = this.data?.profile;
    return this.fb.group({
      id: [profile?.id ?? ''],
      name: [profile?.name ?? '', [Validators.required, Validators.minLength(1)]],
      description: [profile?.description ?? '', [Validators.maxLength(255)]],
      status: [profile?.status ?? true],
      guard_name: [profile?.guard_name ?? 'sanctum'],
      modules: this.fb.array([]),
    });
  }

  get isAllSelected(): boolean {
    const controls = this.modulesFormArray.controls;
    if (controls.length === 0) return false;

    return controls.every((group) => {
      const val = group.value;

      return val.can_read === true && val.can_write === true && val.can_delete === true;
    });
  }

  get modulesFormArray(): FormArray {
    return this.profileForm.get('modules') as FormArray;
  }

  toggleSelectAll(): void {
    const shouldSelect = !this.isAllSelected;

    this.modulesFormArray.controls.forEach((group) => {
      group.patchValue({
        can_read: shouldSelect,
        can_write: shouldSelect,
        can_delete: shouldSelect,
      });
    });

    this.cdr.markForCheck();
  }

  get isAllExpanded(): boolean {
    const expandableNodes = this.treeControl.dataNodes.filter((n) => n.expandable);
    if (expandableNodes.length === 0) return false;

    return expandableNodes.every((node) => this.treeControl.isExpanded(node));
  }

  toggleExpandAll(): void {
    if (this.isAllExpanded) {
      this.treeControl.collapseAll();
    } else {
      this.treeControl.expandAll();
    }
  }

  private loadModules(): void {
    this.moduleService.findAll().subscribe({
      next: (allModules) => {
        this.modules = allModules;

        if (this.isEditMode() && this.data?.profile?.id) {
          this.profilesService.getProfileById(this.data.profile.id).subscribe({
            next: (profileData) => {
              this.profileForm.patchValue({
                id: profileData.id,
                name: profileData.name,
                description: profileData.description,
                status: profileData.status,
              });

              const modulesArray = Array.isArray(profileData.modules)
                ? (profileData.modules as unknown as ProfileModuleData[])
                : [];
              this.initModulesFormArray(modulesArray);
              this.loadingService.hide();
              this.cdr.detectChanges();
            },
            error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
            complete: () => this.loadingService.hide(),
          });
        } else {
          this.initModulesFormArray([]);
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.openError(MESSAGES.LOADING_ERROR);
      },
    });
  }

  private initModulesFormArray(profileModules: ProfileModuleData[]): void {
    const modulesArray = this.modulesFormArray;
    modulesArray.clear();

    const treeData: ModuleNode[] = [];

    this.modules.forEach((module) => {
      const existingModule = profileModules.find((pm) => pm.module_id === module.id);

      const group = this.fb.group({
        module_id: [module.id],
        module_name: [module.name],
        can_read: [existingModule ? existingModule.can_read : false],
        can_write: [existingModule ? existingModule.can_write : false],
        can_delete: [existingModule ? existingModule.can_delete : false],
      });

      modulesArray.push(group);

      treeData.push({
        name: module.name,
        children: [
          { name: 'Ler registros', controlName: 'can_read', parentFormGroup: group },
          { name: 'Editar registros', controlName: 'can_write', parentFormGroup: group },
          { name: 'Excluir registros', controlName: 'can_delete', parentFormGroup: group },
        ],
      });
    });

    this.dataSource.data = treeData;

    if (this.isEditMode()) {
      this.expandActiveNodes();
    }
  }

  private expandActiveNodes(): void {
    this.treeControl.dataNodes.forEach((node) => {
      if (this.hasChild(0, node) && this.isParentSelected(node)) {
        this.treeControl.expand(node);
      }
    });
  }

  isParentSelected(node: FlatNode): boolean {
    const group = this.getChildControls(node)[0]?.parentFormGroup;
    if (!group) return false;
    return (
      (group.get('can_read')?.value as boolean) ||
      (group.get('can_write')?.value as boolean) ||
      (group.get('can_delete')?.value as boolean)
    );
  }

  isParentIndeterminate(node: FlatNode): boolean {
    const values = this.getChildControls(node).map(
      (c) => c.parentFormGroup?.get(c.controlName!)?.value as boolean,
    );
    const selectedCount = values.filter((v) => v === true).length;
    return selectedCount > 0 && selectedCount < values.length;
  }

  toggleParent(node: FlatNode): void {
    const isSelected = this.isParentSelected(node);
    const children = this.getChildControls(node);
    children.forEach((c) => {
      c.parentFormGroup?.get(c.controlName!)?.setValue(!isSelected);
    });
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.profileForm.get(controlName);
    if (!control) return null;
    return this.validationService.getErrorMessage(control);
  }

  handleSubmit(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid) {
      const formValue = this.profileForm.getRawValue();
      const selectedModules = formValue.modules.filter(
        (m: any) => m.can_read || m.can_write || m.can_delete,
      );

      if (selectedModules.length === 0) {
        this.toastService.openWarning('Por favor, selecione ao menos um módulo e uma permissão.');
        return;
      }

      this.loadingService.show();
      const profileData = { ...formValue, modules: selectedModules };
      const request$ = this.isEditMode()
        ? this.profilesService.updateProfile(profileData)
        : this.profilesService.createProfile(profileData);

      request$.subscribe({
        next: () => {
          this.toastService.openSuccess(
            this.isEditMode() ? MESSAGES.UPDATE_SUCCESS : MESSAGES.CREATE_SUCCESS,
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loadingService.hide();
          if (err.status === 422 && err.error?.errors) {
            const errors = err.error.errors;
            Object.keys(errors).forEach((key) => {
              const messages = errors[key];
              if (Array.isArray(messages)) {
                messages.forEach((msg: string) => this.toastService.openError(msg));
              }
            });
          } else {
            this.toastService.openError(
              this.isEditMode() ? MESSAGES.UPDATE_ERROR : MESSAGES.CREATE_ERROR,
            );
          }
        },
        complete: () => this.loadingService.hide(),
      });
    } else {
      this.toastService.openWarning(MESSAGES.FORM_VALUES_NOT_FOUND);
    }
  }

  private getChildControls(node: FlatNode): FlatNode[] {
    return this.treeControl.getDescendants(node).filter((n) => n.controlName);
  }
}
