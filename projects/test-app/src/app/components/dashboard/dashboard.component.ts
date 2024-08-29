import { Component } from '@angular/core';
import { BinService } from '../../services/bin.service';
import { LogoutService } from 'my-auth-lib';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: []
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
