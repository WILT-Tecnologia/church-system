import { FlatTreeControl } from '@angular/cdk/tree';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Modules } from 'app/model/Modules';
import { Profile, ProfileModule } from 'app/model/Profile';
import { ValidationService } from 'app/services/validation/validation.service';

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
  controlName?: string; // can_read, can_write, etc.
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
    ActionsComponent,
    ColumnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfileComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);
  private readonly loading = inject(LoadingService);
  private readonly toast = inject(ToastService);
  private readonly profilesService = inject(ProfilesService);
  private readonly moduleService = inject(ModuleService);
  private readonly dialogRef = inject(MatDialogRef<ProfileComponent>);
  readonly data = inject<{ profile: Profile } | undefined>(MAT_DIALOG_DATA, { optional: true });

  profileForm: FormGroup;
  profile: Profile[] = [];
  modules: Modules[] = [];
  profileModule: ProfileModule[] = [];
  readonly displayedColumns: string[] = ['name', 'can_read', 'can_write', 'can_delete'];
  isEditMode: boolean = false;

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

  constructor() {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadModules();
    if (this.data?.profile) {
      this.isEditMode = true;
      this.patchProfile(this.data.profile);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [this.data?.profile?.id ?? ''],
      name: [this.data?.profile?.name ?? '', [Validators.required, Validators.minLength(1)]],
      description: [this.data?.profile?.description ?? '', [Validators.maxLength(255)]],
      status: [this.data?.profile?.status ?? true],
      guard_name: [this.data?.profile?.guard_name ?? 'sanctum'],
      modules: this.fb.array([]),
    });
  }

  get isAllSelected(): boolean {
    const controls = this.modulesFormArray.controls;
    if (controls.length === 0) return false;

    return controls.every((group) => {
      const val = group.value;
      // Verifica se as 3 permissões estão true
      return val.can_read === true && val.can_write === true && val.can_delete === true;
    });
  }

  get modulesFormArray(): FormArray {
    return this.profileForm.get('modules') as FormArray;
  }

  toggleSelectAll(): void {
    const shouldSelect = !this.isAllSelected; // Se tudo estiver marcado, o próximo estado é false

    this.modulesFormArray.controls.forEach((group) => {
      // Usamos emitEvent: false se quiser evitar disparos excessivos,
      // mas aqui deixamos padrão para atualizar a UI corretamente
      group.patchValue({
        can_read: shouldSelect,
        can_write: shouldSelect,
        can_delete: shouldSelect,
      });
    });

    this.cdr.markForCheck(); // Garante atualização visual no OnPush
  }

  get isAllExpanded(): boolean {
    const expandableNodes = this.treeControl.dataNodes.filter((n) => n.expandable);
    if (expandableNodes.length === 0) return false;

    return expandableNodes.every((node) => this.treeControl.isExpanded(node));
  }

  /** Alterna entre expandir tudo e recolher tudo */
  toggleExpandAll(): void {
    if (this.isAllExpanded) {
      this.treeControl.collapseAll();
    } else {
      this.treeControl.expandAll();
    }
  }

  loadModules(): void {
    this.loading.show();
    this.moduleService.getAll().subscribe({
      next: (allModules) => {
        this.modules = allModules;

        if (this.isEditMode && this.data?.profile?.id) {
          this.profilesService.getProfileById(this.data.profile.id).subscribe({
            next: (profileData) => {
              this.patchProfile(profileData);

              const modulesArray = Array.isArray(profileData.modules)
                ? (profileData.modules as unknown as ProfileModuleData[])
                : [];
              this.initModulesFormArray(modulesArray);
              this.loading.hide();
              this.cdr.detectChanges();
            },
            error: () => this.onError(MESSAGES.LOADING_ERROR),
            complete: () => this.loading.hide(),
          });
        } else {
          // Modo Criação: Inicia tudo como falso
          this.initModulesFormArray([]);
          this.loading.hide();
          this.cdr.detectChanges();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
    });
  }

  initModulesFormArray(profileModules: ProfileModuleData[]): void {
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
          { name: 'Visualizar registros', controlName: 'can_read', parentFormGroup: group },
          { name: 'Editar registros', controlName: 'can_write', parentFormGroup: group },
          { name: 'Excluir registros', controlName: 'can_delete', parentFormGroup: group },
        ],
      });
    });

    this.dataSource.data = treeData;

    if (this.isEditMode) {
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
    const values = this.getChildControls(node).map((c) => c.parentFormGroup?.get(c.controlName!)?.value as boolean);
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
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  private onSuccess(message: string): void {
    this.loading.hide();
    this.toast.openSuccess(message);
    this.dialogRef.close(this.profileForm.value);
  }

  private onError(message: string): void {
    this.loading.hide();
    this.toast.openError(message);
  }

  handleBack(): void {
    this.dialogRef.close();
  }

  handleSubmit(): void {
    const profile = this.profileForm.value;

    if (!profile) {
      return;
    }

    if (this.isEditMode) {
      this.handleUpdate(profile.id, profile);
    } else {
      this.handleCreate(profile);
    }
  }

  handleCreate(data: Profile): void {
    this.loading.show();
    this.profilesService.createProfile(data).subscribe({
      next: () => this.onSuccess(MESSAGES.CREATE_SUCCESS),
      error: () => this.onError(MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  handleUpdate(id: string, data: Profile): void {
    this.loading.show();
    this.profilesService.updateProfile(id, data).subscribe({
      next: () => this.onSuccess(MESSAGES.UPDATE_SUCCESS),
      error: () => this.onError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private patchProfile(profile: Profile): void {
    this.profileForm.patchValue({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      status: profile.status,
    });
  }

  private getChildControls(node: FlatNode): FlatNode[] {
    return this.treeControl.getDescendants(node).filter((n) => n.controlName);
  }
}
