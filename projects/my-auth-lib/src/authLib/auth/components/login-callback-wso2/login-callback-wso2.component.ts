import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login-callback-wso2',
  standalone: true,
  imports: [RouterModule],
  template: ''
})
export class LoginCallbackWSO2Component implements OnInit{

  constructor(private loginService :LoginService){}
    ngOnInit(): void {
      this.loginService.checkCallbackfromWs02()
    }

}