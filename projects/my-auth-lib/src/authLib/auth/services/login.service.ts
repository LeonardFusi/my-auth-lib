import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { AuthConfig } from "../config/default-config";
import { Wso2Token } from "../../models/wso2-token";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { StorageService } from "./storage.service";
import { ConfigService } from "./config.service";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private emitChangeSource = new BehaviorSubject<boolean>(false);
  private changeEmitted$ = this.emitChangeSource.asObservable();

  public wso2Token!: Wso2Token;
  private appBaseUrl!: string;
  private originUrl: string | undefined;
  public queryParamCode = 'code';

  private authConfig: OpenIdConfiguration;
  private postLoginRedirectUri: string | undefined;
  private responseType: string | undefined;
  private scope: string | undefined;
  private tokenEndpoint: string;
  private authorizationEndpoint: string;
  private clientId: string;
  private loginCallbackUri = AuthConfig.loginCallbackUri;

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
    private storageService: StorageService,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.authConfig = this.configService.getConfig();

    this.postLoginRedirectUri = this.authConfig.postLoginRedirectUri;
    this.responseType = this.authConfig.responseType;
    this.scope = this.authConfig.scope;
    this.tokenEndpoint = this.authConfig.authWellknownEndpoints!.tokenEndpoint;
    this.authorizationEndpoint = this.authConfig.authWellknownEndpoints!.authorizationEndpoint;
    this.clientId = this.authConfig.clientId;

    if (this.isBrowser) {
      if (this.storageService.isTokenSetPresentInLocalStorage()) {
        if (!this.storageService.getTokenSetFromSessionStorage()) {
          this.storageService.alignTokenSetInSessionToLocal();
        }
        this.propagateLogInfo(true);
      }

      this.appBaseUrl = window.location.origin;
      this.originUrl = this.appBaseUrl;
    }
  }

  setOriginURL(originUrlPassed: string) {
    if (this.isBrowser) {
      this.originUrl = originUrlPassed;
    }
  }

  checkCallbackfromWs02() {
    if (this.isBrowser) {
      this.activatedRoute.queryParams.subscribe(queryParams => {
        let code: string | undefined = queryParams[this.queryParamCode];
        let originUrlParam: string | undefined = queryParams['originUrl'];

        if (!code) return;

        if (code && originUrlParam !== 'undefined') {
          this.originUrl = originUrlParam;
          this.obtainTokenfromWso2(code, this.originUrl!);
        } else if (code && !originUrlParam && this.postLoginRedirectUri) {
          this.obtainTokenfromWso2(code, this.postLoginRedirectUri);
        } else {
          this.originUrl = this.appBaseUrl;
          this.obtainTokenfromWso2(code, this.originUrl!);
        }
      });
    }
  }

  propagateLogInfo(val: boolean) {
    this.emitChangeSource.next(val);
  }

  toLoginPageRedirection() {
    if (this.isBrowser) {
      let url = this.authorizationEndpoint + "?" +
        "client_id=" + this.clientId + 
        "&redirect_uri=" + this.getRedirectUriEncoded(this.originUrl ?? this.postLoginRedirectUri!) + 
        "&response_type=" + this.responseType + 
        "&scope=" + this.scope;

      window.location.href = url;
    }
  }

  getRedirectUriEncoded(originUrl: string): string {
    return encodeURIComponent(this.getRedirectUri(originUrl));
  }

  private getRedirectUri(originUrl: string): string {
    return this.appBaseUrl + this.loginCallbackUri + "?" + 'originUrl' + "=" + encodeURIComponent(originUrl);
  }

  obtainTokenfromWso2(code: string, originUrl: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      })
    };
    let body = new URLSearchParams();

    body.append('grant_type', 'authorization_code');
    body.append('client_id', this.clientId!);
    body.append('code', code);
    body.append('redirect_uri', this.getRedirectUri(originUrl));

    this.httpClient.post<Wso2Token>(this.tokenEndpoint, body.toString(), httpOptions).subscribe(
      response => {
        this.storeNewTokensSet(response);
        this.propagateLogInfo(true);

        originUrl = originUrl.replace(this.appBaseUrl, '');
        this.originUrl = decodeURIComponent(originUrl);
        this.router.navigateByUrl(this.originUrl!);
      },
      error => {
        console.log(error);
        this.router.navigate([this.appBaseUrl]);
      }
    );
  }

  storeNewTokensSet(wso2Token: Wso2Token) {
    this.storageService.setTokenSetInSessionStorage(wso2Token);
    let sessionWso2Tokens = this.storageService.getTokenSetFromSessionStorage();
    if (sessionWso2Tokens) {
      this.storageService.alignTokenSetInLocalToSession();
    }
  }

  checkAuth() {
    return this.changeEmitted$;
  }
}
