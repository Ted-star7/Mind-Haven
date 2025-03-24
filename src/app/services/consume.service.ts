import { Injectable } from '@angular/core'; 
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private url: string = 'https://mindhaven.onrender.com';

  constructor(private httpClient: HttpClient) {}

  // POST request with JSON data
  public postRequest(endpoint: string, data: any, token: string | null): Observable<any> {
    const headers = this.createHeaders(token);
    return this.httpClient
      .post(`${this.url}${endpoint}`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  public getTherapistsNearby(latitude: number, longitude: number, radius: number): Observable<any> {
    const endpoint = `/api/open/therapists/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    return this.httpClient.get(`${this.url}${endpoint}`).pipe(catchError(this.handleError));
  }



  // POST Request for File Upload (e.g., property images)
  public postFormData(endpoint: string, formData: any): Observable<any> {
    return this.httpClient.post(`${this.url}${endpoint}`, formData)
      .pipe(catchError(this.handleError));
  }

  public getRequest(endpoint: string): Observable<any> {
    console.log(`Making GET request to: ${this.url}${endpoint}`);
    return this.httpClient.get(`${this.url}${endpoint}`)
      .pipe(
        catchError(this.handleError),
        
      );
  }

  public deleteRequest(endpoint: string, token: string | null): Observable<any> {
    const headers = this.createHeaders(token);
    return this.httpClient.delete(`${this.url}${endpoint}`, { headers })
      .pipe(catchError(this.handleError));
  }
  // Create headers method
private createHeaders(token: string | null, isFormData: boolean = false): HttpHeaders {
  let headers = new HttpHeaders({
    'ngrok-skip-browser-warning': '6024',  // Optional custom header
  });

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set 'Content-Type' for FormData, as the browser handles it
  if (!isFormData) {
    headers = headers.set('Content-Type', 'application/json');
  }

  return headers;
}


  // Handle errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}



