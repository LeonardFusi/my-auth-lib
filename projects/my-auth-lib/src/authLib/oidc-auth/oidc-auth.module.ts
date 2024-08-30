import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { OutgoingRequestsInterceptor } from '../auth/interceptors/outgoing-requests.interceptor';
import { TokenRefreshInterceptor } from '../auth/interceptors/token-refresh.interceptor';
import { StorageService } from '../auth/services/storage.service';
import { LogoutCallbackWSO2Component } from '../auth/components/logout-callback-wso2/logout-callback-wso2.component';
import { LoginCallbackWSO2Component } from '../auth/components/login-callback-wso2/login-callback-wso2.component';
import { ConfigService } from '../auth/services/config.service';
import { OpenIdConfiguration } from '../models/open-id-configuration';

let routing = RouterModule.forChild([
  {path:'auth', children:[
    {path: "loginCallback", component: LoginCallbackWSO2Component},
    {path: "logoutCallback", component: LogoutCallbackWSO2Component},
    
  ]}
])

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    CommonModule,
    routing,
  ],
  providers: [],
})
export class OidcAuthModule {
  static forRoot(config: OpenIdConfiguration): ModuleWithProviders<OidcAuthModule> {
    return {
      ngModule: OidcAuthModule,
      providers: [
        {
          provide: 'CONFIG',
          useValue: config
        },
        { provide: HTTP_INTERCEPTORS, useClass: OutgoingRequestsInterceptor, multi: true, deps: [ StorageService, Injector] },//
        { provide: HTTP_INTERCEPTORS, useClass: TokenRefreshInterceptor, multi: true, deps: [StorageService , Injector] },
        ]
      };
    } 
    constructor(configService: ConfigService){

    }
 }
