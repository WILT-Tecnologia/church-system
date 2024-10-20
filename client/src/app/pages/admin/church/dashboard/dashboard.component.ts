import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from 'app/components/modal/modal.service';
import { FamiliesComponent } from '../members/shared/families/families.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MatButtonModule],
})
export class DashboardComponent implements OnInit {
  constructor(private modalService: ModalService) {}

  ngOnInit() {}

  openModal = () => {
    this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesComponent,
      'Teste',
      true,
      [],
      true,
    );
  };
}
