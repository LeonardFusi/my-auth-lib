import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService, LogoutService, UserService } from 'my-auth-lib';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{


  public isLoggedIn: boolean = false;
  
 
  constructor(
    private router : Router, 
    private loginService : LoginService,
    private logoutService : LogoutService,
    private userService : UserService) {
      loginService.checkAuth().subscribe(loginInfo =>{
        this.isLoggedIn = loginInfo
      })
      
     }
  ngOnInit(): void {
    
    console.log(this.isLoggedIn);
    
   
  }


  retriveUserData(){
    this.userService.getUserInfo()
  }



  
  onClickLogout() {
    this.logoutService.logout()
  }

  toLogin() {
    this.router.navigate(['/login']);
  }
  toDashBoard() {
    this.router.navigate(['/dashboard']);
    }
  
  

}
