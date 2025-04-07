import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private url: string = 'https://mindhaven.onrender.com';

  constructor(private httpClient: HttpClient) { }

  // POST request with JSON data
  public postRequest(endpoint: string, data: any, token: string | null): Observable<any> {
    const headers = this.createHeaders(token);
    return this.httpClient
      .post(`${this.url}${endpoint}`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  // GET request without token
  // public getRequest(endpoint: string): Observable<any> {
  //   console.log(`Making GET request to: ${this.url}${endpoint}`);
  //   return this.httpClient.get(`${this.url}${endpoint}`)
  //     .pipe(catchError(this.handleError));
  // }

  public getRequest(endpoint: string, token: string | null): Observable<any> {
    console.log(`Making authenticated GET request to: ${this.url}${endpoint}`);

    // Create headers without Content-Type for GET requests
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    headers = headers.set('ngrok-skip-browser-warning', '6024');

    return this.httpClient.get(`${this.url}${endpoint}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // DELETE request with token
  public deleteRequest(endpoint: string, token: string | null): Observable<any> {
    const headers = this.createHeaders(token);
    return this.httpClient.delete(`${this.url}${endpoint}`, { headers })
      .pipe(catchError(this.handleError));
  }

  // POST Request for File Upload (e.g., property images)
  public postFormData(endpoint: string, formData: FormData, token: string | null): Observable<any> {
    const headers = this.createHeaders(token, true);
    return this.httpClient.post(`${this.url}${endpoint}`, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  // Get therapists nearby (public endpoint)
  public getTherapistsNearby(latitude: number, longitude: number, radius: number): Observable<any> {
    const endpoint = `/api/open/therapists/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    return this.httpClient.get(`${this.url}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // Create headers method
  private createHeaders(token: string | null, isFormData: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    // Add any custom headers here
    headers = headers.set('ngrok-skip-browser-warning', '6024');

    return headers;
  }

  // Improved error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.error?.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else {
      // Generic server-side error
      errorMessage = `Server error: ${error.status} - ${error.statusText || 'Unknown error'}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}