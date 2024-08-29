import { Injectable} from '@angular/core';
import { LoginService } from './login.service';
import { TimeoutService } from './timeout.service';
import { ErrorService } from './error.service';
import { Wso2Token } from '../../models/wso2-token';
import { RefreshTokenService } from './refresh.service';

@Injectable({
  providedIn: 'root'
})
export class SilentRefreshService{




  wso2Token : Wso2Token | undefined;
 
  private refIntervalId!: any;
  private isLoggedIn: boolean = false;
  private isRefreshing: boolean = false;
  private intervalOnSilentRenewChecks: number | undefined;
  
  

  /**
   * On creation of the service istance two subscription are made:
   * One is made to a BehaviorSubject set in LoginService listening for changes in auth state of the user
   * On auth of the user a Interval is set by the setSilentRenewTimeoutInterval method call taking as param the delayTimeForSilentRenewCheckInMs
   * set as field property of the Service
   * The other one is made to a BehaviorSubject listening for changes on the Interval managing the checks and eventual triggering the silent renew of the tokens 
   */
  constructor(
    private timeoutService: TimeoutService,
    private loginService: LoginService,
    private errorService : ErrorService,
    private refreshTokenService : RefreshTokenService
  ) 
    { 
      console.log("Silent Refresh Active");
      this.loginService.checkAuth().subscribe(loginInfo =>{    
        this.isLoggedIn = loginInfo
        if(this.isLoggedIn == true){
       
        this.intervalOnSilentRenewChecks = this.refreshTokenService.getSilentRenewChecksInterval()
        this.setSilentRenewTimeoutInterval(this.intervalOnSilentRenewChecks!)
        
      } else{
        this.removeSilentRenewTimeoutInterval();
      }
      })

      this.timeoutService.changeEmitted$.subscribe(refreshingTokens =>{
      this.isRefreshing = refreshingTokens
      if(this.isRefreshing == false){
        clearTimeout(this.refIntervalId)
        //console.log("timeout cleared");
      }else if(this.isRefreshing == true){
        this.setSilentRenewTimeoutInterval(this.intervalOnSilentRenewChecks!)
      }
      })
    }





  /**
    * Silent Renew of Tokens is a implicit way of renewing the Wso2 Token Set without the need for the user to intervine in the process 
    * The Silent renew process is composed of:
    * First step: compare between the Local's and the Session's Storage if Token Set are alligned
    *   In case that's not the case the allignment is made
    * next the validity a check is made on wheter the access token is still valid
    *   if the access token is valid but it's going to expire in a time span that's equal or less then the offset setted in the configuration
    * if those two requirments are met then a request for a token renew  is sent to wso2
  */
  silentRefresh(){
    //console.log("-----Silently Refreshing Tokens-----");
    var isActiveRenewNeeded = this.refreshTokenService.refreshTokenChecks()
    /* console.log(isActiveRenewNeeded); */
    
    if(isActiveRenewNeeded){
      this.refreshTokenService.refreshTokenCall().subscribe(
        response => {
        console.log("Silent Refresh completed with success");

        this.loginService.storeNewTokensSet(response)
        this.timeoutService.newTimeoutHasBeenSet()
        },  
        error => {
          this.timeoutService.newTimeoutHasBeenSet()
                    /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
          this.errorService.onSilentRenew(error);
        }
      );
    } else{
      this.timeoutService.newTimeoutHasBeenSet()
    }  
  }

/**
 * 
 * @param intervalOnSilentRenewProcess property of service
 * on call an Interval is setted and it's assigned to the omonimus property in the service
 * the Interval as duration euqaling the prefixed value of the property passed as argument
 * after delay the silentRefresh method is called
 */
  setSilentRenewTimeoutInterval(intervalOnSilentRenewProcess : number){    
    this.refIntervalId = setInterval(()=>{
      
      /* console.log("Timeout ended"); */
      
      this.silentRefresh()
    
    }, intervalOnSilentRenewProcess)
    //console.log("timeout set");
  }

  removeSilentRenewTimeoutInterval(){
    clearInterval(this.refIntervalId)
    //console.log("timeout removed");
  }



}








