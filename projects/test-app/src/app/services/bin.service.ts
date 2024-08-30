import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BinService {

  constructor(private http : HttpClient) { }

getWhatEva(){
  return this.http.get("https://wso2.icc.crifnet.com:8244/httpbin/1.0.0/get")
}

}
