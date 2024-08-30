import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { LoginService } from "../services/login.service";
import { RefreshTokenService } from "../services/refresh.service";
import { StorageService } from "../services/storage.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private appBaseUrl!: string;
  private isBrowser: boolean;

  constructor(
    private storageService: StorageService,
    private loginService: LoginService,
    private refreshTokenService: RefreshTokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.appBaseUrl = window.location.origin;
    }
  }

  isLoggedIn = false;
  isAdmin = true;
  wso2Tokens: string | null | undefined;

  isAuthenticated() {
    return this.isLoggedIn;
  }

  async setAuthentication(): Promise<boolean> {
    if (this.isBrowser && this.storageService.isTokenSetPresentInLocalStorage()) {
      if (!this.refreshTokenService.refreshTokenChecks()) {
        this.isLoggedIn = true;
        return this.isLoggedIn;
      } else {
        const callSuccessful = await this.refreshTokenService.asyncRefreshTokenCall();
        if (callSuccessful) {
          this.refreshTokenService.storeNewTokenSet(callSuccessful);
          this.isLoggedIn = true;
        }
      }
    }
    return this.isLoggedIn;
  }

  checkAuthentication() {
    if (this.isAuthenticated()) {
      return true;
    } else {
      if (this.isBrowser) {
        this.storageService.clearLocalStorage();
        this.storageService.clearSessionStorage();
        this.loginService.setOriginURL(this.appBaseUrl);
        this.loginService.toLoginPageRedirection();
      }
      return false;
    }
  }
}
