import { Injectable } from "@angular/core";
import { jwtDecode } from "jwt-decode";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public $userData: any;

  constructor( private storageService: StorageService) {}

    getUserInfo(){
      try{
        const tokenSet = this.storageService.getTokenSetFromSessionStorage()!;
        console.log(tokenSet);
        this.$userData = jwtDecode(JSON.parse(tokenSet).id_token);
        console.log(this.$userData);
        return this.$userData; 
      } catch(e){
        let result = (e as Error).message;
        console.log(result);
      }
    }
}
