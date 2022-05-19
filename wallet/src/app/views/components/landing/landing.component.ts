import { Component, OnInit } from '@angular/core';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

    @SessionStorage()
    public isLoggedIn: boolean

  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
  if(this.isLoggedIn == true){
    this.router.navigateByUrl('/dashboard');
  }
  }

}
