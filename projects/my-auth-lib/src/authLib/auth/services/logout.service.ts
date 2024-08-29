import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthConfig } from "../config/default-config";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { LoginService } from "./login.service";
import { StorageService } from "./storage.service";
import { ConfigService } from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private authConfig : OpenIdConfiguration = this.configLoader.getConfig()

  private oAuthLogoutUri: string = this.authConfig.authWellknownEndpoints!.endSessionEndpoint;
  private originUrl: string = window.location.origin;
  private postLogoutRedirectUri: string | undefined = this.authConfig.postLogoutRedirectUri;
  private logoutCallbackUri: string = AuthConfig.logoutCallbackUri!;
  private revokeEndpoint :string = this.authConfig.authWellknownEndpoints!.revokeEndpoint 
  private clientId :string = this.authConfig.clientId 

  constructor(
    private router : Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private storageService : StorageService,
    private loginService : LoginService,
    private configLoader : ConfigService
  ) { }

  propagateLogout(){
    
    this.storageService.clearSessionStorage()
        
    this.storageService.clearLocalStorage() 

    this.loginService.propagateLogInfo(false)
    
  }

  logout(){

    /* console.log("CALLING LOGOUT METHOD"); */
    
    
    if(this.postLogoutRedirectUri == undefined){
      this.postLogoutRedirectUri = this.originUrl
    }


    let wso2Tokens = this.storageService.getTokenSetFromSessionStorage()
    
    let wso2TokensJson = JSON.parse(wso2Tokens!)
    let idToken = wso2TokensJson.id_token
   
    this.openLogoutUrl(idToken, window.location.href)
    
    
    
  }
  private openLogoutUrl(idToken: string, originUrl : string) {
   
    let params: HttpParams = new HttpParams();
    params = params.append('id_token_hint', idToken)
    params = params.append('post_logout_redirect_uri', this.getRedirectUriEncoded(originUrl))
    params = params.append('state', 'logged_out')

    let href = this.oAuthLogoutUri+'?'+params.toString();
    

    /* console.log(href); */
    
    window.location.href = href
  }



  /**
 * Auxiliary method using given encodeURIComponent to encode URI built in getRedirectUri()
 * @param originUrl 
 * @returns encoded URL
 */
  
  getRedirectUriEncoded(originUrl: string): string {
    return (this.getRedirectUri(originUrl));
  }
/**
 * Auxiliary method using given encodeURIComponent to encode URI and add string to make URL param
 *
 * @param originUrl 
 * @returns 
 */
private getRedirectUri(originUrl: string): string {
  /* console.log(originUrl); */
  
    let url = this.originUrl+this.logoutCallbackUri!;
    url = url + "?" + 'originUrl' + "=" + (originUrl);
    /* console.log(url); */
    
    return url;
  }



  redirectionURLChek() {
    var paramKeyOnUncompletedLogout :string = 'error_description'
    var paramValueOnUncompletedLogout : string = 'End User denied the logout request'

 
      this.activatedRoute.queryParams.subscribe(queryParams => {
        /* console.log(queryParams) */
      if(queryParams['state']){
        /* console.log(queryParams[paramKeyOnUncompletedLogout] == paramValueOnUncompletedLogout); */
        if(!queryParams[paramKeyOnUncompletedLogout] || queryParams[paramKeyOnUncompletedLogout] !== paramValueOnUncompletedLogout){
          /* console.log("Logout Completed"); */
          
          this.revokeRefreshToken(); 
          this.revokeAccessToken();
          this.propagateLogout();
        
          this.router.navigate([this.postLogoutRedirectUri!])
        }else{
          /* console.log(queryParams['originUrl']); */
          
          let originUrl = queryParams['originUrl']
          originUrl = originUrl.replace(this.originUrl,'')
          originUrl = decodeURIComponent(originUrl)
          let redirectUrl : string = originUrl

          this.router.navigateByUrl(redirectUrl)
        }
      } else {
        return
      }
      


      
    });
  }
  revokeAccessToken() {
    //curl -k -v -d "token=<refresh_token_to_be_revoked>&token_type_hint=<access_token_or_refresh_token>" -H "Authorization: Basic <base64 encoded (clientId:clientSecret)>" -H Content-Type: application/x-www-form-urlencoded https://localhost:8243/revoke
     
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        //'Access-Control-Allow-Origin' : window.location.origin
      })
    }
    let body = new URLSearchParams();
    if(this.storageService.isTokenSetAllignedInStorages()){
      let tokenSet = this.storageService.getTokenSetFromSessionStorage()
      let tokenSetJson = JSON.parse(tokenSet!)
      var access_token = tokenSetJson.access_token
    }
    
    body.append('token', access_token);
    body.append('token_type_hint', 'access_token');
    body.append('client_id', this.clientId!);

    this.http.post<any>(
      this.revokeEndpoint, 
      body.toString(), 
      httpOptions
    ).subscribe({
      next: (resp) => 
        console.log(resp)
        
      ,
      error: (err) => 
        console.log(err)
      ,
      complete() {
          
      },
    })
    
  }
  revokeRefreshToken() {
    //curl -k -v -d "token=<refresh_token_to_be_revoked>&token_type_hint=<access_token_or_refresh_token>" -H "Authorization: Basic <base64 encoded (clientId:clientSecret)>" -H Content-Type: application/x-www-form-urlencoded https://localhost:8243/revoke
     
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        //'Access-Control-Allow-Origin' : window.location.origin
      })
    }
    let body = new URLSearchParams();
    if(this.storageService.isTokenSetAllignedInStorages()){
      let tokenSet = this.storageService.getTokenSetFromSessionStorage()
      let tokenSetJson = JSON.parse(tokenSet!)
      var refresh_token = tokenSetJson.refresh_token
    }
    
    body.append('token', refresh_token);
    body.append('token_type_hint', 'refresh_token');
    body.append('client_id', this.clientId!);

    this.http.post<any>(
      this.revokeEndpoint, 
      body.toString(), 
      httpOptions
    ).subscribe({
      next: (resp) => 
        console.log(resp)
        
        
      ,
      error: (err) => 
        console.log(err)
      ,
      complete() {
          
      },
    })
  } 
    
    
}
