import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { AuthConfig } from "../config/default-config";
import { Wso2Token } from "../../models/wso2-token";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { StorageService } from "./storage.service";
import { ConfigService } from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class LoginService{

  private emitChangeSource = new BehaviorSubject<boolean>(false);
  private changeEmitted$ = this.emitChangeSource.asObservable()

  public wso2Token!: Wso2Token;
  private appBaseUrl : string = window.location.origin
  private originUrl: string| undefined = this.appBaseUrl;

  public queryParamCode = 'code'

  private authConfig : OpenIdConfiguration

  
  private postLoginRedirectUri : string | undefined 
  private responseType : string | undefined 
  private scope : string | undefined 
  private tokenEndpoint: string 
  private authorizationEndpoint : string  
  private clientId: string 
  private loginCallbackUri = AuthConfig.loginCallbackUri
  


  constructor( 
    private router : Router,
    private activatedRoute: ActivatedRoute,
    private httpClient : HttpClient,
    private storageService : StorageService,
    private configService: ConfigService) {
     
      this.authConfig = this.configService.getConfig()
 
      this.postLoginRedirectUri = this.authConfig.postLoginRedirectUri
      this.responseType = this.authConfig.responseType
      this.scope = this.authConfig.scope
      this.tokenEndpoint= this.authConfig.authWellknownEndpoints!.tokenEndpoint;
      this.authorizationEndpoint = this.authConfig.authWellknownEndpoints!.authorizationEndpoint
      this.clientId = this.authConfig.clientId

      if(this.storageService.isTokenSetPresentInLocalStorage()){
        if(!this.storageService.getTokenSetFromSessionStorage()){
          this.storageService.allignTokenSetInSessionToLocal()
        }
        this.propagateLogInfo(true) 
      }   
    }


    setOriginURL(originUrlPassed : string){
      this.originUrl = originUrlPassed;
    }

    /**
     * Called on Navigation to a Component implementing the login Service 
     *  A check is made on query parameters passed with the URL, this chek has a double objective
     * One is to find if a origin URl is passed and to store it in a field of the service 
     * The other is to check if a Wso2 authorization code is passed, meaning a redirection after a successfull login on WSO2
     * If present both the params are passed to the obtainTokenFromWso2 method, 
     * if none is the method stops, 
     * if only the code is present the originURl is setted to the Home Component   
     */

    checkCallbackfromWs02(){
      /* console.log("CheckCallBack is being called"); */
      
      this.activatedRoute.queryParams.subscribe(queryParams => {
       /*  console.log(queryParams); */
        
        let code : string | undefined  = queryParams[this.queryParamCode];
        let originUrlParam : string | undefined= queryParams['originUrl']; 
        
        if (code == null){
          return
        }
        if(code && originUrlParam !== 'undefined'){
          this.originUrl = originUrlParam
          this.obtainTokenfromWso2(code,this.originUrl!);
        } else if(code && !originUrlParam && this.postLoginRedirectUri){
          this.obtainTokenfromWso2(code,this.postLoginRedirectUri);
        }  else{
          this.originUrl = this.appBaseUrl
          this.obtainTokenfromWso2(code,this.originUrl);
        }
        
    });
    
  }
  
    propagateLogInfo(val : boolean){
    /* console.log("Changing LoggedIn Info") */
    this.emitChangeSource.next(val)
  }
  /**
   * OnLoginClick method first checks the service field originUrl, 
   * if the field has a value it means that the login action started from an URL that's not the Home Page URL
   *  and the User needs to be redirected there after login is completed, else it means the user can be redirected to the Home page
   * with that and the other WSO2's requested params, the url for the redirection to the WSO2's login page is completed
   * User is redirected to URL
   */
  

  toLoginPageRedirection() {

    /* console.log(this.originUrl); */
    
    var url =''
    
    if(this.originUrl !== null && this.originUrl !== undefined){
      
      url = this.authorizationEndpoint + "?"
      + "client_id=" +  this.clientId
      + "&redirect_uri=" + this.getRedirectUriEncoded(this.originUrl) 
      + "&response_type="+this.responseType
      + "&scope="+this.scope
      ;
    }else{
      
      url = this.authorizationEndpoint + "?"
      + "client_id=" + this.clientId
      + "&redirect_uri=" + this.getRedirectUriEncoded(this.postLoginRedirectUri!)  /* this.getRedirectUriEncoded(tokenEndpoint, wso2AuthorizeUrl, clientId) */
      + "&response_type="+this.responseType
      + "&scope="+this.scope
      ;
    }
      
    window.location.href = url;
  }

/**
 * Auxiliary method using given encodeURIComponent to encode URI built in getRedirectUri()
 * @param originUrl 
 * @returns encoded URL
 */
  
  getRedirectUriEncoded(originUrl: string): string {
    return encodeURIComponent(this.getRedirectUri(originUrl));
  }
/**
 * Auxiliary method using given encodeURIComponent to encode URI and add string to make URL param
 *
 * @param originUrl 
 * @returns 
 */
private getRedirectUri(originUrl: string): string {
  
    let url = this.appBaseUrl!+this.loginCallbackUri;
    
    url = url + "?" + 'originUrl' + "=" + encodeURIComponent(originUrl);
    return url;
  }

  /**
   * Called By checkCallbackfromWs02() 
   * @param code 
   * @param originUrl 
   * After callback to App By WSO2 with Authorization code appendend as URL param 
   * Requst is sent from App to WSO2 token endpoint, appending auth code and setting originURL
   * OriginUrl can either be a protected path that culdn't be accessed before auth by the user or the home page path
   */

  obtainTokenfromWso2(code : string, originUrl : string){
    /* console.log(originUrl); */
    
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      })
    }
    let body = new URLSearchParams();
    
    
    body.append('grant_type', 'authorization_code');
    body.append('client_id', this.clientId!);
    body.append('code', code);
    body.append('redirect_uri', this.getRedirectUri(originUrl));
    
    
    /* console.log("Sending Req to wso2's token endpoint "); */

    this.httpClient.post<Wso2Token>(
      this.tokenEndpoint, 
      body.toString(), 
      httpOptions
    ).subscribe(
      response => {
        /* console.log(response); */
        
        this.storeNewTokensSet(response)
        this.propagateLogInfo(true)
        
        originUrl = originUrl?.replace(this.appBaseUrl!,'')
  
        this.originUrl = decodeURIComponent(originUrl!)
        let redirectUrl : string = this.originUrl!
        
        this.router.navigateByUrl(redirectUrl)
        
      },  
      error => {
        console.log(error);          
        this.router.navigate([this.appBaseUrl]);
      }
    );
  }

  storeNewTokensSet(wso2Token : Wso2Token){
    
    this.storageService.setTokenSetInSessionStorage(wso2Token)
    let sessionWso2Tokens = this.storageService.getTokenSetFromSessionStorage()
    if(sessionWso2Tokens){
      this.storageService.allignTokenSetInLocalToSession()
    }
    /* console.log(sessionWso2Tokens); */
    
  }

  checkAuth(){
    return this.changeEmitted$;
  }

}
