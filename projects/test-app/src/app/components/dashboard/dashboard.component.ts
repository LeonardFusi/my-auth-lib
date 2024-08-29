import { Component } from '@angular/core';
import { BinService } from 'src/app/services/bin.service';
import { LogoutService } from '../../auth/services/logout.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private binService : BinService, private logoutService : LogoutService){}

  onClickOutsideCall() {
    this.binService.getWhatEva().subscribe(data => {
      console.log(data);
      
    }
    );
  }

  onClickLogout() {
    this.logoutService.logout()
  }
}
