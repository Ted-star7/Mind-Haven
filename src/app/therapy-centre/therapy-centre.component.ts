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
  rating: 4.2,
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
  readonly mapboxToken =
    'pk.eyJ1IjoiYmlndGVkIiwiYSI6ImNtNDhnZW52cTBscHQyanNvYnQ2OGF5bmgifQ.F7Ujx1zVTzQWL3AdImiF5A';

  constructor(private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.initializeMap();
    this.fetchHospitals();
  }

  fetchHospitals(): void {
    this.serviceService
      .getTherapistsNearby(this.latitude, this.longitude, this.radius)
      .subscribe(
        (response: any) => {
          if (Array.isArray(response)) {
            this.hospitals = response.map((hospitalData: any) => ({
              ...hospitalData,
              latitude: hospitalData.latitude ?? this.latitude,
              longitude: hospitalData.longitude ?? this.longitude,
              icon: hospitalData.icon || 'assets/signup.jpg', // Fallback icon
            }));
            this.addHospitalMarkers();
          } else {
            console.error('Invalid hospital data format:', response);
            this.hospitals = [];
          }
        },
        (error) => {
          console.error('Error fetching therapists:', error);
          this.hospitals = [];
        }
      );
  }

  initializeMap(): void {
    this.map = new mapboxgl.Map({
      container: 'map', // Ensure your HTML has an element with id="map"
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitude, this.latitude],
      zoom: 12,
      accessToken: this.mapboxToken, // Pass the access token here
    });
  }

  addHospitalMarkers(): void {
    if (!this.map || this.hospitals.length === 0) {
      console.warn('No map or hospitals to display markers for');
      return;
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
          new mapboxgl.Popup().setHTML(`
            <h3>${hospital.name}</h3>
            <p>${hospital.vicinity}</p>
            <p>Rating: ${hospital.rating ?? 'Not available'}</p>
          `)
        )
        .addTo(this.map!);
    });
  }

 getRatingArray(rating: number): number[] {
  const validRating = Math.max(0, Math.min(5, Math.floor(rating || 0))); // Ensure rating is between 0 and 5
  return Array.from({ length: validRating }); // Create an array of 'rating' length
}

}

