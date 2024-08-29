import { Component } from '@angular/core';
import { LogoutService } from '../../services/logout.service';

@Component({
  selector: 'app-logout-callback-wso2',
  standalone: true,
  imports: [],
  template: ''
})
export class LogoutCallbackWSO2Component {
  constructor(private logoutService: LogoutService){}

  ngOnInit(): void {
    this.logoutService.redirectionURLChek();
  }

}
