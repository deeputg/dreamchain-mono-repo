import { Component, OnInit } from '@angular/core';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import { HostListener } from "@angular/core";

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Declare height and width variables
  scrHeight:any;
  scrWidth:any;
  @SessionStorage()
  public isLoggedIn: boolean

  public buttonRight: boolean

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
        this.scrHeight = window.innerHeight;
        this.scrWidth = window.innerWidth;
        console.log(this.scrHeight, this.scrWidth);
  }
  constructor(
   public router: Router,
  ) {
    this.getScreenSize();
  }

  ngOnInit(): void {
    this.buttonRight=true;
    this.getScreenSize()
  }
  toggle_right(){
      document.getElementById("mySidebar").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      this.buttonRight=false;
}

    close(){
      document.getElementById("mySidebar").style.width = "0";
      document.getElementById("main").style.marginLeft= "0";
      this.buttonRight=true;
    }
  }
