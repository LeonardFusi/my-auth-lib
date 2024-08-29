
import { Injectable, InjectionToken, Provider } from '@angular/core';
//import { HttpBackend, HttpClient } from '@angular/common/http';
import { OpenIdConfiguration } from '../../models/open-id-configuration';
//import { firstValueFrom } from 'rxjs';
//import EndpointLocalJSON from "./endpoint.json";
import { StsConfigLoader, StsConfigStaticLoader } from './config-loader';
//import { environment } from 'src/environments/environment';

export interface PassedInitialConfig {
  config?: OpenIdConfiguration;
  loader?: Provider;
}



export function createStaticLoader(
  passedConfig: PassedInitialConfig
): StsConfigLoader {
  if (!passedConfig?.config) {
    throw new Error('No config provided!');
  }

  return new StsConfigStaticLoader(passedConfig.config);
}

export const PASSED_CONFIG = new InjectionToken<PassedInitialConfig>(
  'PASSED_CONFIG'
);

 /* 
@Injectable({
  providedIn: 'root',
})
export class ConfigLoaderService {
 
  private config!: PassedIntitialConfig;
  public moduleConfig!: OpenIdConfiguration; 
   
  
  private httpClient: HttpClient;
   
  constructor(private handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }
  
  getModuleConfiguration() {
    return this.moduleConfig!;
  }



  public async loadConfig(): Promise<any> {
    //if (!environment.production) {
      this.moduleConfig = (JSON.parse(JSON.stringify(EndpointLocalJSON.auth)))
      var managedEndPString : string = EndpointLocalJSON.auth.managedEndpoints 
      this.moduleConfig.managedEndpoints = managedEndPString.split(',')
    /*  } else {
      return firstValueFrom<any>(
        this.httpClient
        .get('assets/config.json')
        .pipe((settings) => settings)
        ).then((config : Config) => {
          var configOBJ = (JSON.parse(JSON.stringify(config)));
          var configuritation : OpenIdConfiguration = configOBJ.auth
          var managedEndPString : string = configOBJ.auth.managedEndpoints 
          this.moduleConfig = configuritation;
          this.moduleConfig.managedEndpoints = managedEndPString.split(',')
        }
      )
    } 
  } 
}*/


