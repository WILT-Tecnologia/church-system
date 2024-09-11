import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingService } from 'app/components/loading/loading.service';
import { MemberOrigin } from 'app/model/MemberOrigins';
import { Members } from 'app/model/Members';
import { Person } from 'app/model/Person';
import { CoreService } from 'app/service/core/core.service';
import { NavigationService } from 'app/service/navigation/navigation.service';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { provideNgxMask } from 'ngx-mask';
import { map, Observable, startWith } from 'rxjs';
import { MembersService } from '../../../members.service';

@Component({
  selector: 'app-spiritual-data-form',
  templateUrl: './spiritual-data-form.component.html',
  styleUrls: ['./spiritual-data-form.component.scss'],
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    provideNgxMask(),
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatCheckboxModule,
  ],
})
export class SpiritualDataFormComponent implements OnInit {
  @Input() memberFormio!: FormGroup;
  memberForm: FormGroup;
  memberId: string | null = null;
  isEditMode: boolean = false;
  activeTabIndex: number = 0;
  persons: Person[] = [];
  memberOrigins: MemberOrigin[] = [];
  searchControl = new FormControl();
  filterMemberOrigins: Observable<MemberOrigin[]>;
  @Output() memberCreated = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private snackbarService: SnackbarService,
    private membersService: MembersService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    public navigationService: NavigationService
  ) {
    this.memberForm = this.fb.group({
      baptism_date: ['', [Validators.required]],
      baptism_locale: ['', [Validators.maxLength(255)]],
      baptism_official: ['', [Validators.maxLength(255)]],
      baptism_holy_spirit: [false],
      baptism_holy_spirit_date: [''],
      member_origin_id: ['', [Validators.required]],
      receipt_date: ['', [Validators.required]],
    });

    this.filterMemberOrigins = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((searchTerm) => this.filterMemberOrigin(searchTerm ?? ''))
    );

    this.navigationService.activeTabIndex$.subscribe((index) => {
      this.activeTabIndex = index;
    });
  }

  ngOnInit() {
    this.fetchMemberOrigins();
  }

  onCheckboxChange(fieldName: string, checkboxControlName: string): void {
    const isChecked = this.memberForm.get(checkboxControlName)?.value;
    if (!isChecked) {
      this.clearDate(fieldName);
    }
  }

  clearDate(fieldName: string): void {
    this.memberForm.get(fieldName)?.setValue(null);
  }

  getErrorMessage(controlName: string) {
    const control = this.memberForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleBack = () => {
    this.core.handleBack();
  };

  handleSubmit = () => {
    if (this.memberForm.invalid) {
      this.snackbarService.openError(
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
      return;
    }

    this.loadingService.show();
    const memberData = this.memberForm.value;

    const saveObservable = this.isEditMode
      ? this.membersService.updateMember(this.memberId!, memberData)
      : this.membersService.createMember(memberData);

    saveObservable.subscribe({
      next: (response: Members) => {
        this.memberId = response.id;
        this.snackbarService.openSuccess(
          this.isEditMode
            ? 'Dados espirituais atualizados com sucesso!'
            : 'Dados espirituais salvos com sucesso!'
        );
        this.isEditMode = true;
        this.navigationService.nextTab();
        this.memberCreated.emit(this.memberId);
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError(
          'Erro ao salvar os dados espirituais. Por favor, tente novamente.'
        );
      },
      complete: () => this.loadingService.hide(),
    });
  };

  handleEditMode = () => {
    this.loadingService.show();
    this.membersService
      .getMemberById(this.memberId!)
      .subscribe((member: Members) => {
        const formattedMembers = dayjs(member.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss'
        );

        this.memberForm.patchValue({
          ...member,
          updated_at: formattedMembers,
        });

        this.loadingService.hide();
      });
    this.loadingService.hide();
  };

  updateMember = () => {
    this.loadingService.show();
    this.membersService
      .updateMember(this.memberId!, this.memberForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess('Membro atualizado com sucesso.');
          this.core.handleBack();
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError(
            `Erro ao atualizar o membro. Verique os dados e tente novamente.`
          );
        },
        complete: () => this.loadingService.hide(),
      });
  };

  fetchMemberOrigins = () => {
    this.loadingService.show();
    this.membersService.getMemberOrigins().subscribe({
      next: (memberOrigin) => {
        this.memberOrigins = memberOrigin.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.filterMemberOrigins = this.searchControl.valueChanges.pipe(
          startWith(''),
          map((searchTerm) => this.filterMemberOrigin(searchTerm ?? ''))
        );
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError('Erro ao buscar a origem do membro.');
      },
    });
    this.loadingService.hide();
  };

  filterMemberOrigin(searchTerm: string): MemberOrigin[] {
    return this.memberOrigins.filter((memberOrigin) =>
      memberOrigin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getMemberOriginName(): string {
    const memberOriginId = this.memberForm.get('member_origin_id')?.value;
    if (memberOriginId) {
      const memberOrigin = this.memberOrigins.find(
        (r) => r.id === memberOriginId
      );
      return memberOrigin?.name ?? '';
    }
    return memberOriginId
      ? 'Selecione a origem do membro'
      : 'Selecione a origem do membro';
  }

  onSelectOpenedChangeMemberOrigin = (isOpen: boolean) => {
    if (isOpen) {
      this.fetchMemberOrigins();
    }
  };
}
