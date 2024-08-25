import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from './loading.service';
@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  imports: [MatProgressSpinnerModule, CommonModule],
})
export class LoadingComponent implements OnInit {
  public activeLoading = true;
  public controlLoaderChanges: any;

  loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {}
}
