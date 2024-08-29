import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Observable, from, lastValueFrom } from "rxjs";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { Wso2Token } from "../../models/wso2-token";
import { ActiveRefreshService } from "../services/active-refresh.service";
import { RefreshTokenService } from "../services/refresh.service";
import { StorageService } from "../services/storage.service";
import { ConfigService } from "../services/config.service";

@Injectable()
export class OutgoingRequestsInterceptor implements HttpInterceptor {
  constructor(
    private storageService : StorageService, 
    private injector: Injector,
    
    ) {}

  private sessionWso2Tokens!: string | null;
  private accessToken : string | undefined
 
  private isManagedURL : boolean = false;
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const refreshTokenService : RefreshTokenService = this.injector.get(RefreshTokenService)
    
    const configLoader : ConfigService = this.injector.get(ConfigService) 
    const authConfig : OpenIdConfiguration =  configLoader.getConfig()
  
    const tokenEndpoint : string = authConfig.authWellknownEndpoints!.tokenEndpoint 
    const wso2LogoutURL: string = authConfig.authWellknownEndpoints!.endSessionEndpoint 
    const userInfoEndpoint : string = authConfig.authWellknownEndpoints!.userInfoEndpoint
    const jwksUri: string =  authConfig.authWellknownEndpoints!.jwksUri
    const revokeEndpoint : string =  authConfig.authWellknownEndpoints!.revokeEndpoint
    const managedEndpoints : Array<string>| undefined = authConfig.managedEndpoints;
      
      

    var isActiveRenewNeeded : boolean = false;
    
    if(  request.url == tokenEndpoint|| request.url == wso2LogoutURL ){/**/
      return next.handle(request)
    }   
    if(request.url == userInfoEndpoint|| request.url == jwksUri){
      isActiveRenewNeeded = refreshTokenService.refreshTokenChecks()
    
      if(isActiveRenewNeeded){
        return from(this.handleActiveRenew(request,next)) 
      } else{
        wso2TokensJson = JSON.parse(this.storageService.getTokenSetFromSessionStorage()!)
      this.accessToken = wso2TokensJson.access_token
      let changedReq = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + this.accessToken),
      }); 
      return next.handle(changedReq)
      }
    }else if( request.url == revokeEndpoint){
      wso2TokensJson = JSON.parse(this.storageService.getTokenSetFromSessionStorage()!)
      this.accessToken = wso2TokensJson.access_token
      let changedReq = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + this.accessToken),
      }); 
      return next.handle(changedReq)
    }
    
    
    /**
     * If Dev Config has a distincts IdP protected URls 
     * else business as usual
     */
    if(managedEndpoints?.toString()){
      for(let i=0; i<managedEndpoints.length; i++){
        if(request.url.startsWith(managedEndpoints[i])){
          this.isManagedURL = true;
          break;
        }
      }
      if(this.isManagedURL == false){
        return next.handle(request)
      }
    }
    this.sessionWso2Tokens = this.storageService.getTokenSetFromSessionStorage()
    let localStorageWso2Tokens = this.storageService.getTokenSetFromLocalStorage() 
    
    if(this.sessionWso2Tokens && localStorageWso2Tokens)
    {
      isActiveRenewNeeded = refreshTokenService.refreshTokenChecks()
    
      if(isActiveRenewNeeded){
        return from(this.handleActiveRenew(request,next)) 
      } else{
        var wso2TokensJson = JSON.parse(this.storageService.getTokenSetFromSessionStorage()!)
        this.accessToken = wso2TokensJson.access_token 
        request = request.clone({
          headers: request.headers.set('Authorization', 'Bearer ' + this.accessToken),
        }); 
        /* console.log("Appending Access Token"); */
        
        return next.handle(request);
      }
    }
    return next.handle(request);
  }


  private async handleActiveRenew(request: HttpRequest<any>, next: HttpHandler):Promise<HttpEvent<any>> {
    const activeRefreshService : ActiveRefreshService = this.injector.get(ActiveRefreshService)
    const wso2Token: Wso2Token = await activeRefreshService.activeGetNewTokenSet()
    if(!this.storageService.isTokenSetPresentInSessionStorage()){
      throw new Error('Auth Token Set could not be store in Session Storage');
    }
    if(!this.storageService.isTokenSetAllignedInStorages()){
      throw new Error('Storages could not be alligned');
    }
    
    let wso2TokensJson = JSON.parse(this.storageService.getTokenSetFromSessionStorage()!)
    this.accessToken = wso2TokensJson.access_token  
    let changedReq = request.clone({
      headers: request.headers.set('Authorization', 'Bearer ' + this.accessToken),
    }); 
    return await lastValueFrom(next.handle(changedReq));
  }

}








