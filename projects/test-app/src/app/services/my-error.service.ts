import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MyErrorService {

  constructor() { }


  onSilentRefresh(error: any){
    alert("My Customizable Method was triggered at Error on Silent Refresh Process, log error: "+ error)
  }

  onActiveRefresh(error: any){
    alert("My Customizable Method was triggered at Error on Active Refresh Process, log error: "+ error)
  }
}
