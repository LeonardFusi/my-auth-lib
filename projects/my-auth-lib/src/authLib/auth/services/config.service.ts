import { Injectable, Inject, InjectionToken } from "@angular/core";
import { OpenIdConfiguration } from "../../models/open-id-configuration";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";

export const LIBRARY_CONFIG = new InjectionToken<any>('library.config');
 
@Injectable({
  providedIn: 'root'
})
export class ConfigService {


  private auth_config!: OpenIdConfiguration;


  constructor(private http: HttpClient, @Inject('CONFIG_FILE_PATH') private configFilePath: string) {}

  loadConfig(): void {
    this.http.get<OpenIdConfiguration>(this.configFilePath).pipe(
      tap(config => {
        console.log(config);
        
        this.auth_config = config;
      })
    ).subscribe();
  }

  getConfig(): OpenIdConfiguration{
    return this.auth_config;
  }
}
