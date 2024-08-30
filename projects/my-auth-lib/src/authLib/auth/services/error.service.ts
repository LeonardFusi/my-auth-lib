import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  onActiveRenew(error: any){/* 
    alert("On Active Token's Refreshing process this error was registered: "+error) */
  }
  
  onSilentRenew(error: any){/* 
    console.log("On Silent Token's Refreshing process this error was registered: "+error) */
  }
}
