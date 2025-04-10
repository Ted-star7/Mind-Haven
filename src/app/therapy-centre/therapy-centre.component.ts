import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../services/consume.service';
import { MapboxService } from '../services/mapbox.service';
import * as mapboxgl from 'mapbox-gl';

interface Hospital {
  name: string;
  latitude: number;
  longitude: number;
  vicinity: string;
  rating?: number;
  photos?: string[];
  icon?: string;
}

@Component({
  selector: 'app-therapy-centre',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './therapy-centre.component.html',
  styleUrls: ['./therapy-centre.component.css']
})
export class TherapyCentreComponent implements OnInit, AfterViewInit, OnDestroy {
  hospitals: Hospital[] = [];
  map: mapboxgl.Map | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  locationQuery: string = '';
  readonly defaultLocation = { lat: -1.2921, lng: 36.8219 };
  radius: number = 5000;
  
  isMenuOpen = false; 
  loading: boolean = false;
  error: string | null = null;
  showDirections: boolean = false;
  private mapInitialized = false;

  constructor(
    private serviceService: ServicesService,
    private mapboxService: MapboxService
  ) { }

  ngOnInit(): void {
    this.getUserLocation();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }


  private withMap(callback: (map: mapboxgl.Map) => void): void {
    if (this.mapInitialized && this.map) {
      try {
        callback(this.map);
      } catch (error) {
        console.error('Map operation error:', error);
        this.error = 'Error interacting with map. Please try again.';
      }
    } else {
      console.warn('Map operation attempted before initialization');
    }
  }

  initializeMap(): void {
    try {
      this.map = this.mapboxService.createMap('map', {
        center: [this.defaultLocation.lng, this.defaultLocation.lat],
        zoom: 12
      });

      this.map.on('load', () => {
        this.mapInitialized = true;
        if (this.map) {
          this.map.addControl(this.mapboxService.getNavigationControl());
        }

        if (this.hospitals.length > 0) {
          this.addHospitalMarkers();
        }
      });

      this.map.on('error', (e: any) => {
        console.error('Map error:', e.error);
        this.error = 'Map loading error. Please refresh the page.';
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      this.error = 'Failed to initialize map. Please try again later.';
    }
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.fetchHospitals(this.userLocation.lat, this.userLocation.lng);
          this.centerMap(this.userLocation.lng, this.userLocation.lat);
          this.loading = false;
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.fetchHospitals(this.defaultLocation.lat, this.defaultLocation.lng);
          this.centerMap(this.defaultLocation.lng, this.defaultLocation.lat);
          this.loading = false;
        }
      );
    } else {
      console.warn('Geolocation not supported');
      this.fetchHospitals(this.defaultLocation.lat, this.defaultLocation.lng);
      this.centerMap(this.defaultLocation.lng, this.defaultLocation.lat);
    }
  }

  searchHospitals(): void {
    if (!this.locationQuery.trim()) return;

    this.loading = true;
    this.error = null;

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.locationQuery)}.json?access_token=${this.mapboxService.getAccessToken()}`)
      .then(response => response.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          this.fetchHospitals(lat, lng);
          this.centerMap(lng, lat);
        } else {
          this.error = 'Location not found. Using default location.';
          this.fetchHospitals(this.defaultLocation.lat, this.defaultLocation.lng);
          this.centerMap(this.defaultLocation.lng, this.defaultLocation.lat);
        }
        this.loading = false;
      })
      .catch(err => {
        console.error('Geocoding error:', err);
        this.error = 'Error searching location. Using default location.';
        this.fetchHospitals(this.defaultLocation.lat, this.defaultLocation.lng);
        this.centerMap(this.defaultLocation.lng, this.defaultLocation.lat);
        this.loading = false;
      });
  }

  fetchHospitals(lat: number, lng: number): void {
    this.loading = true;
    this.serviceService.getTherapistsNearby(lat, lng, this.radius)
      .subscribe({
        next: (response: any) => {
          this.hospitals = Array.isArray(response)
            ? response.map(h => ({
              ...h,
              latitude: h.latitude ?? lat,
              longitude: h.longitude ?? lng,
              rating: h.rating ?? 0,
              icon: h.icon || 'assets/hospital-icon.png'
            }))
            : [];
          this.addHospitalMarkers();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching hospitals:', err);
          this.error = 'Failed to load hospitals. Using default locations.';
          this.loading = false;
          this.hospitals = this.getDefaultHospitals();
          this.addHospitalMarkers();
        }
      });
  }

  centerMap(lng: number, lat: number): void {
    this.withMap(map => {
      map.flyTo({
        center: [lng, lat],
        essential: true
      });
    });
  }

  addHospitalMarkers(): void {
    this.withMap(map => {
      // Clear existing markers
      document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

      this.hospitals.forEach(hospital => {
        const el = document.createElement('div');
        el.className = 'hospital-marker';
        el.innerHTML = '<i class="fas fa-hospital"></i>';

        const popup = this.mapboxService.createPopup({ offset: 25 })
          .setHTML(`
            <h3>${hospital.name}</h3>
            <p>${hospital.vicinity}</p>
            ${hospital.rating ? `<p>Rating: ${this.getStarRating(hospital.rating)}</p>` : ''}
          `);

        this.mapboxService.createMarker(el)
          .setLngLat([hospital.longitude, hospital.latitude])
          .setPopup(popup)
          .addTo(map);
      });
    });
  }

  getDefaultHospitals(): Hospital[] {
    return [
      {
        name: 'Nairobi Mental Health Hospital',
        latitude: -1.2921,
        longitude: 36.8219,
        vicinity: 'Nairobi, Kenya',
        rating: 4.5,
        icon: 'assets/hospital-icon.png'
      },
      {
        name: 'Chiromo Lane Medical Centre',
        latitude: -1.2684,
        longitude: 36.8033,
        vicinity: 'Westlands, Nairobi',
        rating: 4.2,
        icon: 'assets/hospital-icon.png'
      }
    ];
  }

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return '★'.repeat(fullStars) +
      (halfStar ? '½' : '') +
      '☆'.repeat(emptyStars);
  }

  toggleDirections(): void {
    this.showDirections = !this.showDirections;
  }

  getRatingArray(rating: number | undefined): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }
 

  closeDirections() {
    this.showDirections = false;
  }

}