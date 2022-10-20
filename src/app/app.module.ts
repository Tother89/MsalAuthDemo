import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import {  MsalModule,
  MsalService,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalGuard,
  MsalGuardConfiguration,
  MsalBroadcastService,   
  MsalRedirectComponent, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG } from '@azure/msal-angular';
import { IPublicClientApplication, 
  PublicClientApplication, 
  InteractionType, 
  BrowserCacheLocation,
   AuthenticationResult, 
   InteractionStatus, 
   RedirectRequest, 
   PopupRequest,
   LogLevel } from '@azure/msal-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '3dd3e86d-b187-47de-be44-8438052e77f5', //'283117c9-dc39-4791-a7dc-b595355df354',
      authority: 'https://login.microsoftonline.com/pclconnects.onmicrosoft.com/',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',            
    },
    cache: {
        cacheLocation : BrowserCacheLocation.SessionStorage,
        storeAuthStateInCookie: isIE, // set to true for IE 11
    },  
    system:
    {
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false
      }
      //proxyUrl: environment.apiBaseUrl
    }
  
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  //protectedResourceMap.set("https://graph.microsoft.com/v1.0/me", [,"openid", "profile"]);
  protectedResourceMap.set("https://pcl-dev-artisan-api.azurewebsites.net/", ['https://pclconnects.onmicrosoft.com/pcl-dev-artisan-api//user_impersonation', "openid", "profile"]);
  protectedResourceMap.set("https://localhost/CraftWorksST.Services", ['https://pclconnects.onmicrosoft.com/pcl-dev-artisan-api//user_impersonation', "openid", "profile"]);
  
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { 
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['https://pclconnects.onmicrosoft.com/pcl-dev-artisan-api//user_impersonation', 'openid','profile']
    },
    loginFailedRoute: "/login-failed",    
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MsalModule
    
    // MsalModule.forRoot(
    //   new PublicClientApplication({
    //     auth: {
    //       clientId: '3dd3e86d-b187-47de-be44-8438052e77f5', //'b18538ce-cf10-4849-a38c-f1c383740354', -- webpreview
    //       authority: "https://login.microsoftonline.com/434E9D2B-D8D3-4BD9-BD27-03B20A16D863",
    //       redirectUri: 'http://localhost:4200',
    //       //postLogoutRedirectUri: 'http://localhost:4200',      
    //     },
    //     cache: {
    //         cacheLocation : BrowserCacheLocation.SessionStorage,
    //         storeAuthStateInCookie: false, // set to true for IE 11
    //     },  
    //     system:
    //     {
    //       loggerOptions: {
    //         loggerCallback,
    //         logLevel: LogLevel.Info,
    //         piiLoggingEnabled: false
    //       }
    //       //proxyUrl: environment.apiBaseUrl
    //     }
    //   }),
    //   {
    //     interactionType: InteractionType.Redirect,
    //     authRequest: {
    //       scopes: ['email', 'openid','profile',"user.read"],
    //     },
    //   },
    //   {
    //     interactionType: InteractionType.Redirect,
    //     protectedResourceMap: new Map([
    //       ["/api/", ['api://64835620-bb2b-4872-96d5-2d0d68cdc7fb/user_impersonation']],
    //       ["/api/", ['https://pclconnects.onmicrosoft.com/pcl-dev-artisan-api//user_impersonation']],
    //     ]),
    //   }
    // ),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
