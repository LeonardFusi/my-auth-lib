import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpParams } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { StorageService } from "../services/storage.service";
import { ConfigService } from "../services/config.service";


@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  
  constructor(
    private storageService : StorageService, 
    private injector : Injector,
    
      ){}
  private sessionWso2Tokens!: string | null;
  private accessToken! : string 
  private refreshToken! : string 
  private idToken : string | undefined
  
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const configLoader : ConfigService = this.injector.get(ConfigService) 
    const authConfig : OpenIdConfiguration =  configLoader.getConfig()
    const tokenEndpoint: string = authConfig.authWellknownEndpoints!.tokenEndpoint;
    const clientId : string = authConfig.clientId;
    if(request.url == tokenEndpoint){


      if(!this.storageService.isTokenSetPresentInSessionStorage() && !this.storageService.isTokenSetPresentInLocalStorage()){
        return next.handle(request)
      }
      
      if(!this.storageService.isTokenSetPresentInSessionStorage() || !this.storageService.isTokenSetPresentInLocalStorage()){
        throw new Error('Something went wrong. You should reauthenticate')
      }

      this.sessionWso2Tokens = this.storageService.getTokenSetFromSessionStorage()
      let localStorageWso2Tokens = this.storageService.getTokenSetFromLocalStorage()
      var wso2TokensJson = JSON.parse(this.sessionWso2Tokens!)


    
      /* console.log("Inside Refresh Interceptor") */
      if(this.storageService.isTokenSetAlignedInStorages()){
        this.accessToken = wso2TokensJson.access_token
        this.idToken= wso2TokensJson.id_token
        this.refreshToken= wso2TokensJson.refresh_token   
      }else if(localStorageWso2Tokens) {  
        this.storageService.alignTokenSetInSessionToLocal()
        this.sessionWso2Tokens = this.storageService.getTokenSetFromSessionStorage()
        var newWso2TokensJson = JSON.parse(this.sessionWso2Tokens!)
        this.accessToken = newWso2TokensJson.access_token
        this.idToken= newWso2TokensJson.id_token
        this.refreshToken= newWso2TokensJson.refresh_token   
      }
      let params: HttpParams = new HttpParams();
        request = request.clone({
          params: request.params
            .set('grant_type', 'refresh_token')
            .set('refresh_token', this.refreshToken!)
            .set('client_id', clientId)

        });  
      
      return next.handle(request)
    }
    return next.handle(request);
  }
    
}


