import { Component, OnInit } from '@angular/core';
import { DrmService } from '../../../services/drm.service';
import { CryptoService } from '../../../services/crypto.service';
import Eos from '../../../../assets/lib/eos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {

  }

}
