import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'my-auth-lib';
@Component({
  selector: 'app-welcome',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: []
})
export class LoginComponent implements OnInit{
   @Input() isLoggedIn : boolean = false

  constructor(private loginService : LoginService, private router : Router) 
  {
    
    loginService.checkAuth().subscribe(loginInfo =>{
      this.isLoggedIn = loginInfo
                      
      if(this.isLoggedIn == true){

        this.router.navigate(['/home'])
      }
    })
  }
  ngOnInit(): void {
    this.loginService.checkCallbackfromWs02()
  }


  login(){
    this.loginService.toLoginPageRedirection()
  } 
  
}