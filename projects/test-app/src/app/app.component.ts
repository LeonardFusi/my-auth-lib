import { Component, OnInit } from '@angular/core';
import { LoginService, SilentRefreshService } from 'my-auth-lib';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
