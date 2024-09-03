import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Wso2Token } from '../../models/wso2-token';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private keyInStoragesForTokens = 'wso2Tokens';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // LocalStorage Methods

  readLocalStorageItem(key: string): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    }
    return null; // Fallback for SSR
  }

  writeLocalStorage(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  removeLocalStorage(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  clearLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.clear();
    }
  }

  // SessionStorage Methods

  readSessionStorageItem(key: string): string | null {
    if (this.isBrowser) {
      return sessionStorage.getItem(key);
    }
    return null; // Fallback for SSR
  }

  writeSessionStorage(key: string, value: string): void {
    if (this.isBrowser) {
      sessionStorage.setItem(key, value);
    }
  }

  removeSessionStorage(key: string): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(key);
    }
  }

  clearSessionStorage(): void {
    if (this.isBrowser) {
      sessionStorage.clear();
    }
  }

  // Alignment Methods

  alignSessionToLocal(key: string): void {
    if (this.isBrowser) {
      const value = localStorage.getItem(key);
      if (value) {
        sessionStorage.setItem(key, value);
      }
    }
  }

  alignLocalToSession(key: string): void {
    if (this.isBrowser) {
      const value = sessionStorage.getItem(key);
      if (value) {
        localStorage.setItem(key, value);
      }
    }
  }

  isItemAlignedInStorages(key: string): boolean {
    if (this.isBrowser) {
      const valueSession = sessionStorage.getItem(key);
      const valueLocal = localStorage.getItem(key);
      return valueSession === valueLocal;
    }
    return false; // Fallback for SSR
  }

  // Token Methods

  isTokenSetPresentInSessionStorage(): boolean {
    if (this.isBrowser) {
      return sessionStorage.getItem(this.keyInStoragesForTokens) !== null;
    }
    return false; // Fallback for SSR
  }

  isTokenSetPresentInLocalStorage(): boolean {
    if (this.isBrowser) {
      return localStorage.getItem(this.keyInStoragesForTokens) !== null;
    }
    return false; // Fallback for SSR
  }

  getTokenSetFromSessionStorage(): string | null {
    if (this.isBrowser) {
      return sessionStorage.getItem(this.keyInStoragesForTokens);
    }
    return null; // Fallback for SSR
  }

  getTokenSetFromLocalStorage(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.keyInStoragesForTokens);
    }
    return null; // Fallback for SSR
  }

  isTokenSetAlignedInStorages(): boolean {
    if (this.isBrowser) {
      const valueSession = sessionStorage.getItem(this.keyInStoragesForTokens);
      const valueLocal = localStorage.getItem(this.keyInStoragesForTokens);
      return valueSession === valueLocal;
    }
    return false; // Fallback for SSR
  }

  alignTokenSetInSessionToLocal(): void {
    if (this.isBrowser) {
      const value = localStorage.getItem(this.keyInStoragesForTokens);
      if (value) {
        sessionStorage.setItem(this.keyInStoragesForTokens, value);
      }
    }
  }

  alignTokenSetInLocalToSession(): void {
    if (this.isBrowser) {
      const value = sessionStorage.getItem(this.keyInStoragesForTokens);
      if (value) {
        localStorage.setItem(this.keyInStoragesForTokens, value);
      }
    }
  }

  // General Key-Value Methods

  isKeyValuePairPresentInSessionStorage(key: string): boolean {
    if (this.isBrowser) {
      return sessionStorage.getItem(key) !== null;
    }
    return false; // Fallback for SSR
  }

  isKeyValuePairPresentInLocalStorage(key: string): boolean {
    if (this.isBrowser) {
      return localStorage.getItem(key) !== null;
    }
    return false; // Fallback for SSR
  }

  setTokenSetInSessionStorage(wso2TokenSet: Wso2Token): void {
    if (this.isBrowser) {
      const expires_at = Number(Date.now()) + (Number(wso2TokenSet.expires_in) * 1000);
      const value: string = JSON.stringify({
        access_token: wso2TokenSet.access_token,
        refresh_token: wso2TokenSet.refresh_token,
        id_token: wso2TokenSet.id_token,
        expires_in: Number(wso2TokenSet.expires_in) * 1000,
        expires_at: expires_at
      });

      sessionStorage.setItem(this.keyInStoragesForTokens, value);
    }
  }

  setTokenSetInLocalStorage(value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.keyInStoragesForTokens, value);
    }
  }
}
