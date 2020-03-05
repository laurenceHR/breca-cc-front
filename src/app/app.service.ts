import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';

@Injectable()
export class AppService {
  private baseUrl = environment.backend;
  constructor(private http: HttpClient) { }

  getVenues() {
    return this.http.get(this.baseUrl + '/venues');
  }

  getVenueTenants(venueId: number) {
    return this.http.get(this.baseUrl + '/venue/' + venueId + '/tenants');
  }

  getTenantCounts(tenantId: number) {
    return this.http.get(this.baseUrl + '/tenant/' + tenantId + '/counts');
  }
}
