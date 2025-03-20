import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as mapboxgl from 'mapbox-gl';
import { ServicesService } from '../services/consume.service';

interface Hospital {
  name: string;
  latitude: number;
  longitude: number;
  vicinity: string;
  rating: number;
  photos?: string[];
  icon: string;
}

@Component({
  selector: 'app-therapy-centre',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './therapy-centre.component.html',
  styleUrls: ['./therapy-centre.component.css'],
})
export class TherapyCentreComponent implements OnInit {
  hospitals: Hospital[] = [];
  map?: mapboxgl.Map;
  readonly latitude = -1.2921; // Default Nairobi latitude
  readonly longitude = 36.8219; // Default Nairobi longitude
  radius: number = 5000; // 5km radius
  readonly mapboxToken = 'pk.eyJ1IjoiYmlndGVkIiwiYSI6ImNtNDhnZW52cTBscHQyanNvYnQ2OGF5bmgifQ.F7Ujx1zVTzQWL3AdImiF5A';

  transportMode: string = 'driving';
  travelMode: string = 'driving'; // Default travel mode
  startPoint?: mapboxgl.LngLat; // Starting point
  endPoint?: mapboxgl.LngLat; // Destination point
  distance?: number; // Distance in kilometers
  duration?: number; // Duration in minutes
  loading: boolean = false; // Loading state
  startPointName: string = ''; // Name for the start point
  endPointName: string = ''; // Name for the end point

  constructor(private serviceService: ServicesService) { }

  ngOnInit(): void {
    this.initializeMap();
    this.fetchHospitals();
  }

  fetchHospitals(): void {
    this.loading = true; // Start loading
    this.serviceService
      .getTherapistsNearby(this.latitude, this.longitude, this.radius)
      .subscribe(
        (response: any) => {
          this.loading = false; // Stop loading
          if (Array.isArray(response)) {
            this.hospitals = response.map((hospitalData: any) => ({
              ...hospitalData,
              latitude: hospitalData.latitude ?? this.latitude,
              longitude: hospitalData.longitude ?? this.longitude,
              icon: hospitalData.icon || 'assets/signup.jpg',
            }));
            this.addHospitalMarkers();
          } else {
            console.error('Invalid hospital data format:', response);
            this.hospitals = [];
          }
        },
        (error) => {
          this.loading = false; // Stop loading
          console.error('Error fetching therapists:', error);
          this.hospitals = [];
        }
      );
  }

  initializeMap(): void {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitude, this.latitude],
      zoom: 12,
      accessToken: this.mapboxToken,
    });

    // Add click event for setting points
    this.map.on('click', (event) => this.handleMapClick(event));
  }

  addHospitalMarkers(): void {
    if (!this.map || this.hospitals.length === 0) {
      console.warn('No map or hospitals to display markers for');
      return;
    }

    // Clear existing markers
    const markers = document.getElementsByClassName('hospital-marker');
    while (markers[0]) {
      markers[0].parentNode?.removeChild(markers[0]);
    }

    this.hospitals.forEach((hospital) => {
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.style.backgroundImage = `url(${hospital.icon})`;
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = 'contain';

      new mapboxgl.Marker(el)
        .setLngLat([hospital.longitude, hospital.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h3>${hospital.name}</h3>
             <p>${hospital.vicinity}</p>
             <p>Rating: ${hospital.rating ?? 'Not available'}</p>`
          )
        )
        .addTo(this.map!);
    });
  }

  handleMapClick(event: mapboxgl.MapMouseEvent): void {
    const coords = event.lngLat;

    if (!this.startPoint) {
      this.startPoint = coords; // Set as starting point
      this.startPointName = 'Start Point'; // You can change this as needed
      new mapboxgl.Marker({ color: 'green' })
        .setLngLat(coords)
        .addTo(this.map!);
    } else if (!this.endPoint) {
      this.endPoint = coords; // Set as destination point
      this.endPointName = 'End Point'; // You can change this as needed
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coords)
        .addTo(this.map!);
      this.calculateRoute(); // Calculate route when both points are set
    }
  }

  calculateRoute(): void {
    if (!this.startPoint || !this.endPoint) return;

    const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/${this.transportMode}/${this.startPoint.lng},${this.startPoint.lat};${this.endPoint.lng},${this.endPoint.lat}?geometries=geojson&access_token=${this.mapboxToken}`;

    fetch(routeUrl)
      .then((response) => response.json())
      .then((data) => {
        if (this.map && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates;

          this.distance = parseFloat((route.distance / 1000).toFixed(2)); // Distance in km
          this.duration = Math.round(route.duration / 60); // Duration in minutes

          const routeGeoJSON: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates,
              },
            }],
          };

          // If source already exists, update the data, otherwise add a new source
          if (this.map.getSource('route')) {
            (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
          } else {
            this.map.addSource('route', {
              type: 'geojson',
              data: routeGeoJSON
            });
            this.map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#007cbf',
                'line-width': 4,
              },
            });
          }
        }
      })
      .catch((error) => console.error('Error fetching route:', error));
  }



  changeTravelMode(mode: string): void {
    this.travelMode = mode;
    if (this.startPoint && this.endPoint) {
      this.calculateRoute(); // Recalculate route when travel mode changes
    }
  }

  searchPlaces(query: string): void {
    console.log('Searching for places:', query);
    // Implement your search logic here (e.g., API call or filtering)
  }

  // Adding missing methods and properties to resolve errors
  onLocationInputChange(event: any): void {
    console.log('Location input changed', event);
  }

  setTransportMode(mode: string): void {
    this.travelMode = mode;
  }

  getRatingArray(rating: number): number[] {
    return Array(Math.round(rating)); // Generates an array to show stars for rating
  }
}
