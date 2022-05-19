import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'
import { HostListener } from "@angular/core";

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Declare height and width variables
  scrHeight:any;
  scrWidth:any;

  @SessionStorage()
  public isLoggedIn;
  @SessionStorage()
  public privateKey;
  @SessionStorage()
  public publicKey;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
        this.scrHeight = window.innerHeight;
        this.scrWidth = window.innerWidth;
        console.log(this.scrHeight, this.scrWidth);
  }

  constructor() {
  this.getScreenSize();
}

  ngOnInit(): void {
  }

  public async logout(){
    this.isLoggedIn = false;
    this.privateKey = '';
    this.publicKey = '';
  }

  toggle_left() {
  $('.drawer-left').drawer();
  }

}
