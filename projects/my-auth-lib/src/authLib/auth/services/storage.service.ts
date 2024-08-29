import { Injectable } from '@angular/core';
import { Wso2Token } from '../../models/wso2-token';

@Injectable({
  providedIn: 'root'
})
export class StorageService{


  private keyInStoragesForTokens = 'wso2Tokens';

  readLocalStorageItem(key: string) { 
    return localStorage.getItem(key);
  }

  writeLocalStorage(key: string, value :string): void {
    localStorage.setItem(key,value);
  }

  removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  clearLocalStorage(): void {
    localStorage.clear()
  }
  readSessionStorageItem(key: string) { 
    return sessionStorage.getItem(key);
  }

  writeSessionStorage(key: string, value :string): void {
    sessionStorage.setItem(key,value);
  }

  removeSessionStorage(key: string): void {
    sessionStorage.removeItem(key);
  }

  clearSessionStorage(): void {
    sessionStorage.clear()
  }
 
  allignSessionToLocal(key : string){
    /* console.log("Storages allignment start") */
    let value = localStorage.getItem(key)
    if( value){
      sessionStorage.setItem(key, value)
      
    }
    /* console.log("Storages allignment finished") */
  }

  allignLocalToSession(key : string){
    /* console.log("Storages allignment start") */
    let value = sessionStorage.getItem(key)
    if( value){
      localStorage.setItem(key, value)
    }
    /* console.log("Storages allignment finished") */
  } 

  isItemAllignedInStorages(key : string) : boolean{
    let valueSession = sessionStorage.getItem(key)
    let valueLocal = localStorage.getItem(key)
    if(valueSession && valueLocal){
      if(valueSession == valueLocal){
        return true
      }
      return false
    }
    return false
  }

  isTokenSetPresentInSessionStorage(){
    if(sessionStorage.getItem(this.keyInStoragesForTokens) == null){
      return false
    }
    return true
  }
  isTokenSetPresentInLocalStorage(){
    if(localStorage.getItem(this.keyInStoragesForTokens) == null){
      return false
    }
    return true
  }

  getTokenSetFromSessionStorage(){
    return sessionStorage.getItem(this.keyInStoragesForTokens);
  }
  getTokenSetFromLocalStorage(){
    return localStorage.getItem(this.keyInStoragesForTokens);
  }
  isTokenSetAllignedInStorages() : boolean{
    let valueSession = sessionStorage.getItem(this.keyInStoragesForTokens)
    let valueLocal = localStorage.getItem(this.keyInStoragesForTokens)
    if(valueSession && valueLocal){
      if(valueSession == valueLocal){
        return true
      }
      return false
    }
    return false
  }

  allignTokenSetInSessionToLocal(){
    /* console.log("Storages allignment start") */
    let value = localStorage.getItem(this.keyInStoragesForTokens)
    if( value){
      sessionStorage.setItem(this.keyInStoragesForTokens, value)
      
    }
    /* console.log("Storages allignment finished") */
  }

  allignTokenSetInLocalToSession(){
    /* console.log("Storages allignment start") */
    let value = sessionStorage.getItem(this.keyInStoragesForTokens)
    if( value){
      localStorage.setItem(this.keyInStoragesForTokens, value)
    }
    /* console.log("Storages allignment finished") */
  }

  isKeyValuePairPresentInSessionStorage(key: string){
    
    if(sessionStorage.getItem(key) == null){
      return false
    }
    return true
  }

  isKeyValuePairPresentInLocalStorage(key: string){
    if(localStorage.getItem(key) == null){
      return false
    }
    return true
  }


  setTokenSetInSessionStorage( wso2TokenSet :Wso2Token): void {
    let expires_at = Number(Date.now())+(Number(wso2TokenSet.expires_in)*1000)
    var value : string = '{"access_token" : '+'"'+wso2TokenSet.access_token+'"'+', "refresh_token" : '+'"'+wso2TokenSet.refresh_token+'"'+', "id_token" : '+'"'+wso2TokenSet.id_token+'"'+', "expires_in" : '+Number(wso2TokenSet.expires_in)*1000+', "expires_at" : '+expires_at+'}'

    sessionStorage.setItem(this.keyInStoragesForTokens,value);
  }
  setTokenSetInLocalStorage( value :string): void {
    localStorage.setItem(this.keyInStoragesForTokens,value);
  }



}
