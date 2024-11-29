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
  rating?: number;
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

  constructor(private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.fetchHospitals();
    this.initializeMap();
  }

  fetchHospitals(): void {
    this.serviceService
      .getTherapistsNearby(this.latitude, this.longitude, this.radius)
      .subscribe(
        (response: any) => {
          // Check if the response is an array and has valid data
          if (Array.isArray(response)) {
            this.hospitals = response.map((hospitalData: any) => ({
              ...hospitalData,
              latitude: hospitalData.latitude ?? this.latitude,
              longitude: hospitalData.longitude ?? this.longitude,
              icon: hospitalData.icon || 'assets/signup.jpg', // Provide a fallback icon
            }));
            this.addHospitalMarkers();
          } else {
            console.error('Received invalid data for hospitals:', response);
            this.hospitals = []; // Empty array in case of invalid response
          }
        },
        (error) => {
          console.error('Error fetching therapists:', error);
          this.hospitals = []; // Fallback to empty array in case of error
        }
      );
  }

  initializeMap(): void {
    // if (!mapboxgl.accessToken)
       {
      console.error('Mapbox access token is missing');
      return;
    }
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitude, this.latitude],
      zoom: 12,
    });
  }

  addHospitalMarkers(): void {
    if (!this.map || this.hospitals.length === 0) return;

    this.hospitals.forEach((hospital) => {
      // Create a custom marker element
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.style.backgroundImage = `url(${hospital.icon})`; // Use the icon from the backend
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = 'contain';

      // Add the marker to the map
      new mapboxgl.Marker(el)
        .setLngLat([hospital.longitude, hospital.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <h3>${hospital.name}</h3>
            <p>${hospital.vicinity}</p>
            <p>Rating: ${hospital.rating ?? 'Not available'}</p>
          `)
        )
        // .addTo(this.map);
    });
  }
}
