import { Injectable, Injector } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { Wso2Token } from "../../models/wso2-token";
import { ErrorService } from "./error.service";
import { RefreshTokenService } from "./refresh.service";
import { TimeoutService } from "./timeout.service";
import { ConfigService } from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class ActiveRefreshService {




  private emitChangeSource = new BehaviorSubject<boolean>(false);
  changeEmitted$ = this.emitChangeSource.asObservable()

  private wso2Token : Wso2Token | undefined;
  

  constructor(private timeoutService: TimeoutService,
    private errorService : ErrorService,
    private injector : Injector,
    private refreshTokenService : RefreshTokenService
  ) 
  { 
    const configLoader : ConfigService = this.injector.get(ConfigService) 
    const authConfig : OpenIdConfiguration =  configLoader.getConfig()
    const tokenEndpoint : string = authConfig.authWellknownEndpoints!.tokenEndpoint
  }

    async activeGetNewTokenSet():Promise<Wso2Token> {
      var callSuccesfull = this.refreshTokenService.asyncRefreshTokenCall()
      return callSuccesfull.then(wso2Tokens =>{
        /* console.log(wso2Tokens); */
        this.refreshTokenService.storeNewTokenSet(wso2Tokens);
        this.timeoutService.newTimeoutHasBeenSet()
        return wso2Tokens;
      },
      error =>{
        this.errorService.onActiveRenew(error)
        throw new Error("Error: "+ error)
      }
      )
    }
}
