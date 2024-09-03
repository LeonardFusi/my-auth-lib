import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { take, lastValueFrom } from "rxjs";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { Wso2Token } from "../../models/wso2-token";
import { LoginService } from "./login.service";
import { StorageService } from "./storage.service";
import { ConfigService } from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {
  wso2Tokens:string | undefined | null ;
  
  private configService : ConfigService;
  private authConfig : OpenIdConfiguration 
  private isLoggedIn: boolean = false;
  private intervalForSilentRenewChecks: number| undefined;
  private offSetOnRenew!: number;
  private tokenEndpoint: string ;
  
  constructor(private storageService : StorageService, 
    private injector : Injector,
    private loginService :LoginService,
    private http : HttpClient) {
      
      this.configService = injector.get(ConfigService)
      this.authConfig = this.configService.getConfig()
      this.tokenEndpoint = this.authConfig.authWellknownEndpoints!.tokenEndpoint

      this.loginService.checkAuth().subscribe(loginInfo =>{
        this.isLoggedIn = loginInfo
        if(this.isLoggedIn == true){
          this.obtainRenewTimeBeforeTokenExpiresInMs()
          /* console.log("ASAS LoggedIn and Time is been calculated ASAS"); */
          
          /* console.log(this.offSetOnRenew); */
        }
      })
   }

  renewBeforeConfigurationCases(): number{
    //se è stato definito un timeoutfactor in percentuale nella config
    //allora uso quello
    if(this.authConfig.timeoutFactor && !this.authConfig.renewTimeBeforeTokenExpiresInMilliseconds){
      return 1;
    }
    //altrimenti se è stato definito in millisecondi
    //uso quest'altro
    else if(this.authConfig.renewTimeBeforeTokenExpiresInMilliseconds && !this.authConfig.timeoutFactor){
      return 2;
    }
    //se sono stati settati entrmbi prendo la percentuale 
    else {
      return 3;
    }
  }


  obtainRenewTimeBeforeTokenExpiresInMs(){
    var timeoutFactorInPercentageOnAccessTokenLifeSpan: number|undefined;
    var limitOnLifeSpanOfTokenInMs: number | undefined;
    var renewConfigCase : number = this.renewBeforeConfigurationCases();
    /* console.log(renewConfigCase); */
    
    switch(renewConfigCase){
      case 1:
        timeoutFactorInPercentageOnAccessTokenLifeSpan = this.authConfig.timeoutFactor;
        limitOnLifeSpanOfTokenInMs = undefined;
        break;
      case 2:
        var renewBeforeinMs = this.authConfig.renewTimeBeforeTokenExpiresInMilliseconds
        limitOnLifeSpanOfTokenInMs = renewBeforeinMs
        timeoutFactorInPercentageOnAccessTokenLifeSpan = undefined;
        break;
      case 3:
        timeoutFactorInPercentageOnAccessTokenLifeSpan = this.authConfig.timeoutFactor;
        limitOnLifeSpanOfTokenInMs = undefined;
        break;
    }

    let tokenSet = this.storageService.getTokenSetFromSessionStorage()
    let tokenSetToJson = JSON.parse(tokenSet!);
    console.log(tokenSetToJson);
    
    let onePercentOfLifeSpanAccToken = (tokenSetToJson.expires_in)/ 100;
    this.intervalForSilentRenewChecks = onePercentOfLifeSpanAccToken * 25;
    //se uso la percentuale
    if(!limitOnLifeSpanOfTokenInMs && timeoutFactorInPercentageOnAccessTokenLifeSpan){
      let timeoutFactorToPercentage = (1-timeoutFactorInPercentageOnAccessTokenLifeSpan) * 100;
      limitOnLifeSpanOfTokenInMs = onePercentOfLifeSpanAccToken * timeoutFactorToPercentage;
      this.offSetOnRenew = limitOnLifeSpanOfTokenInMs;
    }
    //se uso i ms 
    else if(limitOnLifeSpanOfTokenInMs && !timeoutFactorInPercentageOnAccessTokenLifeSpan) {
      this.offSetOnRenew = limitOnLifeSpanOfTokenInMs
    }
  }

  refreshTokenChecks() : boolean{
    var isActiveRenewNeeded : boolean = false;

  
    if(!this.storageService.isTokenSetAlignedInStorages()){
      this.storageService.alignTokenSetInSessionToLocal();
    }
    this.wso2Tokens = this.storageService.getTokenSetFromSessionStorage()
    if(this.wso2Tokens){
      var wso2TokensJson = JSON.parse(this.wso2Tokens)
      if(Date.now() >= (wso2TokensJson.expires_at - this.offSetOnRenew)){
        return isActiveRenewNeeded = true;
      }
      return isActiveRenewNeeded;
    }
    throw new Error("Something went wrong with token Storaging")
  }

  getSilentRenewChecksInterval(){
    return this.intervalForSilentRenewChecks;
  }

  refreshTokenCall(){
    let params: HttpParams = new HttpParams();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

    return this.http.post<Wso2Token>
    (
      this.tokenEndpoint,
      params,
      { headers: headers, withCredentials: false }, 
    )
  }

  async asyncRefreshTokenCall(){
    let params: HttpParams = new HttpParams();
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    const newWso2TokenSet = this.http.post<Wso2Token>(
      this.tokenEndpoint,
      params,
      { headers: headers, withCredentials: false }, 
    ).pipe(take(1))
    return await lastValueFrom<Wso2Token>(newWso2TokenSet);
  }
  storeNewTokenSet(wso2TokenSet : Wso2Token){
    this.storageService.setTokenSetInSessionStorage(wso2TokenSet)
    this.storageService.alignTokenSetInLocalToSession()
  }

}
