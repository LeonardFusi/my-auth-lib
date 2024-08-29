import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeoutService {
  private emitChangeSource = new Subject<boolean>();
  changeEmitted$ = this.emitChangeSource.asObservable()

  constructor(){}

  newTimeoutHasBeenSet(){
    /* console.log("oldTimeoutHasBeenUnset"); */
    this.emitChangeSource.next(false)
    /* console.log("newTimeoutHasBeenSet"); */
    this.emitChangeSource.next(true)
  }
}