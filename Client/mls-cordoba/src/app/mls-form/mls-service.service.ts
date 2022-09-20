import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SelecItem } from './models/selectItem';
import { environment } from './../../environments/environment';
import { Barrio } from './models/barrios';

@Injectable({
  providedIn: 'root',
})
export class MlsServiceService {
  constructor(private http: HttpClient) {}

  public getBarrios(): Observable<Barrio[]> {
    return this.http.get<any>(`${environment.apiUrl}/barrios`).pipe(
      map((data) => {
        console.log(data);
        return data.map((item: any) => ({
          id: item._id,
          value: item.Identificador,
          tipoBarrio: item['Tipo de barrio'],
        }));
      })
    );
  }

  public saveDepartamento(departamento: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/departamento`,
      departamento
    );
  }

  public saveCasa(casa: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/casa`, casa);
  }

  public saveLote(lote: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/lote`, lote);
  }
}
