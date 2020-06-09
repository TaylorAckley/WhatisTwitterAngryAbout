import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Trend } from './../../../logic/models/trends';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get<Array<Trend>>(`${environment.api}/data`).pipe(take(1));
  }
}
