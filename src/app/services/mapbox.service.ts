import { Injectable } from '@angular/core';
import * as _mapboxgl from 'mapbox-gl';

// Workaround for TypeScript and ES modules
const mapboxgl = _mapboxgl as unknown as typeof _mapboxgl & {
  _customAccessToken?: string;
};

@Injectable({ providedIn: 'root' })
export class MapboxService {
  private readonly accessToken = 'pk.eyJ1IjoiYmlndGVkIiwiYSI6ImNtNDhnZW52cTBscHQyanNvYnQ2OGF5bmgifQ.F7Ujx1zVTzQWL3AdImiF5A';

  constructor() {
    // Custom solution for setting access token
    (mapboxgl as any)._customAccessToken = this.accessToken;
  }

  createMap(container: string, options: any): _mapboxgl.Map {
    return new mapboxgl.Map({
      container,
      accessToken: this.accessToken, // Explicitly pass token here
      style: 'mapbox://styles/mapbox/streets-v11',
      ...options
    });
  }

  createMarker(element?: HTMLElement): _mapboxgl.Marker {
    return new mapboxgl.Marker(element);
  }

  createPopup(options?: _mapboxgl.PopupOptions): _mapboxgl.Popup {
    return new mapboxgl.Popup(options);
  }

  getNavigationControl(): _mapboxgl.NavigationControl {
    return new mapboxgl.NavigationControl();
  }

  getAccessToken(): string {
    return this.accessToken;
  }
}