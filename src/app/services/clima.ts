import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface Weather {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private weatherApiKey = '';
  private weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) {}

  // Obtener ubicación actual
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error)
        );
      } else {
        reject(new Error('Geolocation no soportado'));
      }
    });
  }

  // Obtener nombre de la ubicación
  getLocationName(lat: number, lon: number): Promise<string> {
    return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then(response => response.json())
      .then(data => {
        if (data.address) {
          if (data.address.city) return data.address.city;
          if (data.address.town) return data.address.town;
          if (data.address.village) return data.address.village;
          if (data.address.state) return data.address.state;
        }
        return 'Ubicación actual';
      })
      .catch(() => 'Ubicación actual');
  }

  // Obtener clima por coordenadas
  getWeatherByCoordinates(lat: number, lon: number): Observable<Weather> {
    return from(this.getLocationName(lat, lon)).pipe(
      //se usa para busquedas en tiempo real 
      switchMap(locationName => {
        return this.http.get<any>(
          `${this.weatherApiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.weatherApiKey}`
        ).pipe(
          map(weatherData => ({
            temperature: Math.round(weatherData.main.temp),
            condition: weatherData.weather[0].description,
            location: locationName,
            icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed
          })),
          catchError(error => {
            console.error('Error obteniendo clima:', error);
            // Retornar datos de ejemplo si falla
            return of({
              temperature: 22,
              condition: 'Parcialmente nublado',
              location: locationName,
              icon: 'https://openweathermap.org/img/wn/02d@2x.png',
              humidity: 65,
              windSpeed: 3.1
            });
          })
        );
      })
    );
  }

  // Obtener clima actual
  getCurrentWeather(): Observable<Weather> {
    return from(this.getCurrentLocation()).pipe(
      switchMap(position => {
        return this.getWeatherByCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
      }),
      catchError(error => {
        console.error('Error obteniendo ubicación:', error);
        // Si falla utilizar esta por defecto para que no se quede vacio 
        return this.getWeatherByCoordinates(40.4168, -3.7038);
      })
    );
  }
}