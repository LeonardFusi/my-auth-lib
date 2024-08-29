import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigLoaderService } from '../config/auth-config';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private authConfig = this.configService.getModuleConfiguration()

  constructor( private http: HttpClient,
    private configService: ConfigLoaderService) { }

    getUserInfo(){
      return this.http.get<any>(this.authConfig.authWellknownEndpoints!.userInfoEndpoint)
    }
}
