import { Inject, Injectable } from '@angular/core';
import { OpenIdConfiguration } from '../../models/open-id-configuration';
import { PassedInitialConfig } from '../../oidc-auth/oidc-auth.module';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {


  private auth_config: OpenIdConfiguration;


  constructor(@Inject('config') private customConfig:PassedInitialConfig) {
    this.auth_config =  customConfig.config!;
  }

  getConfig(): OpenIdConfiguration{
    return this.auth_config
  }
}
