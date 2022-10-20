import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration, MSAL_INSTANCE } from '@azure/msal-angular';
import { Component, OnInit } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';

import { Subject, takeUntil, filter } from 'rxjs';
import { InteractionStatus, RedirectRequest, EventType, PublicClientApplication } from '@azure/msal-browser';
import { Inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'msal-angular-tutorial';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor( private authService: MsalService,
    @Inject(MSAL_GUARD_CONFIG)private msalGuardConfig: MsalGuardConfiguration,
    private broadcastService: MsalBroadcastService    
    ) {
      
     }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    this.setLoginDisplay();
    
    this.broadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    )
    .subscribe( () => {
      this.setLoginDisplay();
      this.checkAndSetActiveAccount();      
    })
  }

  login() {
    if (this.msalGuardConfig.authRequest){
      this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest)
    }else{
      this.authService.loginRedirect();
    }
  }

  checkAndSetActiveAccount(){
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  async login2(){
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    // Set active acccount on page load
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0) {
      await this.authService.instance.setActiveAccount(accounts[0]);
    }

    await this.authService.instance.addEventCallback(async (event) => {
      // set active account after redirect
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        await this.authService.instance.setActiveAccount(account);
      }
    });

    console.log('get active account', await this.authService.instance.getActiveAccount());

    // handle auth redired/do all initial setup for msal
    await this.authService.instance.handleRedirectPromise().then(async authResult=>{
      // Check if user signed in 
      if(!authResult){
        const account = await this.authService.instance.getActiveAccount();
        if(!account){
          // redirect anonymous user to login page 
          
  
          this.broadcastService.inProgress$
          .pipe(
            filter((status:InteractionStatus) => status === InteractionStatus.None),
            takeUntil(this._destroying$)
          )
          .subscribe(async() => {
            
            console.log("Interaction status is none.")
            await this.authService.loginRedirect();
        
          }, (error) => {
            console.log(error.message);
          })
        }
      }
      
    }).catch(err=>{
      // TODO: Handle errors
      console.log(err);
    });
  }

  logout(){
    this.authService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200'
    })
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}