import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router : Router){}

  isLoggedIn = true
  isAdmin = true

  isAutenticated(){


    if(this.isLoggedIn == false){
      this.router.navigate(['/login'], {queryParams: {originUrl: window.location.href}})
    }
    
    return this.isLoggedIn
  }

  setAuthenticated(){
    
    if(!sessionStorage.getItem('wso2Tokens')){
       this.isLoggedIn = false
    } else{
      this.isLoggedIn == true
    } 
  }

  
}
