import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LoginService, SilentRefreshService } from 'my-auth-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule],
})
export class AppComponent implements OnInit{
  title = 'my-app';
  


  constructor(
    private loginService: LoginService,
    private silentRefreshService : SilentRefreshService){
     
    } 

  ngOnInit(){

  }
  
    
}
