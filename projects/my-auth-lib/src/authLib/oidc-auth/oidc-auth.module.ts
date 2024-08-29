import { Injector, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { OutgoingRequestsInterceptor } from '../auth/interceptors/outgoing-requests.interceptor';
import { TokenRefreshInterceptor } from '../auth/interceptors/token-refresh.interceptor';
import { StorageService } from '../auth/services/storage.service';
import { OpenIdConfiguration } from '../models/open-id-configuration';
import { LogoutCallbackWSO2Component } from '../auth/components/logout-callback-wso2/logout-callback-wso2.component';
import { LoginCallbackWSO2Component } from '../auth/components/login-callback-wso2/login-callback-wso2.component';
import { PassedInitialConfig } from 'my-auth-lib';
import { _provideAuth } from '../auth/config/provide.auth';

let routing = RouterModule.forChild([
  {path:'auth', children:[
    {path: "loginCallback", component: LoginCallbackWSO2Component},
    {path: "logoutCallback", component: LogoutCallbackWSO2Component},
    
  ]}
])

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    routing,
  ],
  providers: [
    
    
    
  
  ],
})
export class OidcAuthModule {
  static forRoot(
    passedConfig: PassedInitialConfig
  ): ModuleWithProviders<OidcAuthModule> {
    return {
      ngModule: OidcAuthModule,
      providers: [
        {..._provideAuth(passedConfig)},
        { provide: HTTP_INTERCEPTORS, useClass: OutgoingRequestsInterceptor, multi: true, deps: [ StorageService, Injector] },//
        { provide: HTTP_INTERCEPTORS, useClass: TokenRefreshInterceptor, multi: true, deps: [StorageService , Injector] },
        ]
      };
    }  
 }
