import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { filter } from 'rxjs';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  constructor(private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private httpclient: HttpClient) { }

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
    .pipe(
      filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
    )
    .subscribe((result: EventMessage) => {
      console.log(result);
    });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      })
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }


  devConfig = 'https://pcl-dev-artisan-api.azurewebsites.net/api/account/configuration/district/01/c09e1016-6d87-4937-8477-cf8c7c511cdc'
  localConfig = 'https://localhost/CraftWorksST.Services/api/account/configuration/district/01/2E2EB122-89BD-4E29-A3AC-8FE52B4341A4'
  test = 'https://pcl-dev-best-api.azurewebsites.net/api/User/me'
  sendRequest(){
    this.httpclient.get(this.devConfig)
    .subscribe((response) => {
      alert(JSON.stringify(response));
    },(error) => {
      alert(JSON.stringify(error));
    });
  }

  sendLocalRequest(){
    this.httpclient.get(this.localConfig)
    .subscribe((response) => {
      alert(JSON.stringify(response));
    },(error) => {
      alert(JSON.stringify(error));
    });
  }

}
