import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "./config.service";


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private authConfig = this.configService.getConfig()

  constructor( private http: HttpClient,
    private configService: ConfigService) { }

    getUserInfo(){
      return this.http.get<any>(this.authConfig.authWellknownEndpoints!.userInfoEndpoint)
    }
}
