import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { HttpModule } from '@angular/http'
import { NgxWebstorageModule } from 'ngx-webstorage'
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './views/components/landing/landing.component';
import { HeaderComponent } from './views/layouts/header/header.component';
import { FooterComponent } from './views/layouts/footer/footer.component';
import { RegisterComponent } from './views/auth/register/register.component';
import { LoginComponent } from './views/auth/login/login.component';
import { SidebarComponent } from './views/layouts/sidebar/sidebar.component';
import { DashboardComponent } from './views/components/dashboard/dashboard.component';
import { FindAccountComponent } from './views/components/find-account/find-account.component';
import { TxHistoryComponent } from './views/components/tx-history/tx-history.component';
import { MyAccountComponent } from './views/components/dashboard/my-account/my-account.component';
import { ControlMessagesComponent } from './views/components/control-messages/control-messages.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent,
    RegisterComponent,
    LoginComponent,
    SidebarComponent,
    DashboardComponent,
    FindAccountComponent,
    TxHistoryComponent,
    MyAccountComponent,
    ControlMessagesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpModule,
    NgxWebstorageModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
