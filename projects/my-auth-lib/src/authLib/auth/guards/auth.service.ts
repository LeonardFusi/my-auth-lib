import { Injectable } from '@angular/core';

import { LoginService } from '../services/login.service';
import { StorageService } from '../services/storage.service';
import { RefreshTokenService } from '../services/refresh.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private storageService : StorageService,
    private loginService : LoginService,
    private refreshTokenService : RefreshTokenService){}

  isLoggedIn = false
  isAdmin = true
  wso2Tokens: string | null | undefined;

  isAutenticated(){
    return this.isLoggedIn
  }

  async setAuthentication() : Promise<boolean>{
   
    if(this.storageService.isTokenSetPresentInLocalStorage()){
      if(!this.refreshTokenService.refreshTokenChecks()){
        return this.isLoggedIn = true
      } else {
          var callSuccesfull = this.refreshTokenService.asyncRefreshTokenCall()
          callSuccesfull.then(wso2Tokens =>{
            /* console.log(wso2Tokens); */
            
            if(wso2Tokens){
              this.refreshTokenService.storeNewTokenSet(wso2Tokens)
              return this.isLoggedIn = true
            } else{
              return this.isLoggedIn
            }
          })
      }
    }
    return this.isLoggedIn
  }

  checkAuthentication(){
    
    if(this.isAutenticated()){
      
      return true
    }
    else {
      this.storageService.clearLocalStorage()
      this.storageService.clearSessionStorage()
      this.loginService.setOriginURL( window.location.href);
      this.loginService.toLoginPageRedirection()
      return false 
    }
  }

  
}
