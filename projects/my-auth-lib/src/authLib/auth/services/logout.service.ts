import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { AuthConfig } from "../config/default-config";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { LoginService } from "./login.service";
import { StorageService } from "./storage.service";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private authConfig: OpenIdConfiguration;
  private oAuthLogoutUri: string;
  private originUrl: string | undefined;
  private postLogoutRedirectUri: string | undefined;
  private logoutCallbackUri: string;
  private revokeEndpoint: string;
  private clientId: string;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private storageService: StorageService,
    private loginService: LoginService,
    private configLoader: ConfigService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    this.authConfig = this.configLoader.getConfig();
    this.oAuthLogoutUri = this.authConfig.authWellknownEndpoints!.endSessionEndpoint;
    this.postLogoutRedirectUri = this.authConfig.postLogoutRedirectUri;
    this.logoutCallbackUri = AuthConfig.logoutCallbackUri!;
    this.revokeEndpoint = this.authConfig.authWellknownEndpoints!.revokeEndpoint;
    this.clientId = this.authConfig.clientId;

    if (this.isBrowser) {
      this.originUrl = window.location.origin;
    }
  }

  propagateLogout() {
    if (this.isBrowser) {
      this.storageService.clearSessionStorage();
      this.storageService.clearLocalStorage();
      this.loginService.propagateLogInfo(false);
    }
  }

  logout() {
    if (!this.isBrowser) {
      return;
    }

    if (this.postLogoutRedirectUri == undefined) {
      this.postLogoutRedirectUri = this.originUrl;
    }

    const wso2Tokens = this.storageService.getTokenSetFromSessionStorage();
    if (wso2Tokens) {
      const wso2TokensJson = JSON.parse(wso2Tokens);
      const idToken = wso2TokensJson.id_token;
      this.openLogoutUrl(idToken, window.location.href);
    }
  }

  private openLogoutUrl(idToken: string, originUrl: string) {
    if (!this.isBrowser) {
      return;
    }

    let params: HttpParams = new HttpParams();
    params = params.append('id_token_hint', idToken);
    params = params.append('post_logout_redirect_uri', this.getRedirectUriEncoded(originUrl));
    params = params.append('state', 'logged_out');

    const href = `${this.oAuthLogoutUri}?${params.toString()}`;

    console.log(href);

    window.location.href = href;
  }

  getRedirectUriEncoded(originUrl: string): string {
    return this.getRedirectUri(originUrl);
  }

  private getRedirectUri(originUrl: string): string {
    if (!this.isBrowser || !this.originUrl) {
      return '';
    }

    let url = `${this.originUrl}${this.logoutCallbackUri!}`;
    url = `${url}?originUrl=${encodeURIComponent(originUrl)}`;

    return url;
  }

  redirectionURLCheck() {
    if (!this.isBrowser) {
      return;
    }

    const paramKeyOnUncompletedLogout: string = 'error_description';
    const paramValueOnUncompletedLogout: string = 'End User denied the logout request';

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams['state']) {
        if (!queryParams[paramKeyOnUncompletedLogout] || queryParams[paramKeyOnUncompletedLogout] !== paramValueOnUncompletedLogout) {
          this.revokeRefreshToken();
          this.revokeAccessToken();
          this.propagateLogout();
          this.router.navigate([this.postLogoutRedirectUri!]);
        } else {
          let originUrl = queryParams['originUrl'];
          originUrl = originUrl.replace(this.originUrl!, '');
          originUrl = decodeURIComponent(originUrl);
          this.router.navigateByUrl(originUrl);
        }
      }
    });
  }

  revokeAccessToken() {
    if (!this.isBrowser) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      })
    };
    
    if (this.storageService.isTokenSetAlignedInStorages()) {
      const tokenSet = this.storageService.getTokenSetFromSessionStorage();
      if (tokenSet) {
        const tokenSetJson = JSON.parse(tokenSet);
        const access_token = tokenSetJson.access_token;

        const body = new URLSearchParams();
        body.append('token', access_token);
        body.append('token_type_hint', 'access_token');
        body.append('client_id', this.clientId);

        this.http.post<any>(
          this.revokeEndpoint, 
          body.toString(), 
          httpOptions
        ).subscribe({
          next: (resp) => console.log(resp),
          error: (err) => console.log(err),
        });
      }
    }
  }

  revokeRefreshToken() {
    if (!this.isBrowser) {
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      })
    };
    
    if (this.storageService.isTokenSetAlignedInStorages()) {
      const tokenSet = this.storageService.getTokenSetFromSessionStorage();
      if (tokenSet) {
        const tokenSetJson = JSON.parse(tokenSet);
        const refresh_token = tokenSetJson.refresh_token;

        const body = new URLSearchParams();
        body.append('token', refresh_token);
        body.append('token_type_hint', 'refresh_token');
        body.append('client_id', this.clientId);

        this.http.post<any>(
          this.revokeEndpoint, 
          body.toString(), 
          httpOptions
        ).subscribe({
          next: (resp) => console.log(resp),
          error: (err) => console.log(err),
        });
      }
    }
  }
}
