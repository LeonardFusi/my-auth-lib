import { Injectable, Inject } from "@angular/core";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { AuthConfig } from "../config/default-config";
 
@Injectable({
  providedIn: 'root'
})
export class ConfigService {


  private auth_config!: OpenIdConfiguration;


  constructor( @Inject('CONFIG') private config: OpenIdConfiguration) {
    if(config){
      this.auth_config = config;
     if(!this.auth_config.timeoutFactor && !this.auth_config.renewTimeBeforeTokenExpiresInMilliseconds){
        this.auth_config.timeoutFactor = AuthConfig.timeoutFactor;
      }
      console.log( this.auth_config);
        
    }else{
      console.log('something wrong');
    }
  }
  

  getConfig(): OpenIdConfiguration{
    return this.auth_config;
  }
}
