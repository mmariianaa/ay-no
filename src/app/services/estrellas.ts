import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Star {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  mass?: number;
  radius?: number;

}

@Injectable({
  providedIn: 'root'
})
export class EstrellasService {
  // mi api pipipip
  private apiUrl = 'https://api.api-ninjas.com/v1/stars';
  private apiKey = 'DAPJNHkLoG1PWf2GrXkUaBXsm1A8aHVa9Odba65J';
//imagenes por sino funcona la api 
  private defaultStarImages = [
    // Sirius 
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop',
  
  // Betelgeuse
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  
  // Vega
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80',
  
  // Polaris
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80'
  ];
// que las ensene por si la api no jala
  private defaultStars: Star[] = [
    { id: 1, name: 'Sirius', type: 'Binary Star', imageUrl: this.defaultStarImages[0] },
    { id: 2, name: 'Betelgeuse', type: 'Red Supergiant', imageUrl: this.defaultStarImages[1] },
    { id: 3, name: 'Vega', type: 'White Star', imageUrl: this.defaultStarImages[2] },
    { id: 4, name: 'Polaris', type: 'Cepheid Variable', imageUrl: this.defaultStarImages[3] }
  ];

  constructor(private http: HttpClient) {}

  // Obtener estrellas por defecto, muestra las que ya tiene
  getDefaultStars(): Star[] {
    return [...this.defaultStars];
  }

  // Buscar estrellas por nombre en la apis
  searchStarsByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?name=${name}`, {
      headers: { 'X-Api-Key': this.apiKey }
    });
  }

  // cambia los datos de la api a los que tiene la app para entender mejorsh
  convertApiStarsToStars(apiStars: any[], startId: number = 1): Star[] {
    return apiStars.map((apiStar, index) => ({
      id: startId + index,
      name: apiStar.name || 'Desconocido',
      type: this.getStarType(apiStar),
      imageUrl: this.defaultStarImages[index % this.defaultStarImages.length],
      mass: apiStar.mass,
      radius: apiStar.radius
    }));
  }

  // Dependiendo de las caracteristicas de la estrella le asigna un tipo y ya sabemos de cual se trata 
  private getStarType(apiStar: any): string {
    if (apiStar.mass > 8) return 'Supergigante';
    if (apiStar.mass > 2) return 'Gigante';
    if (apiStar.temperature > 10000) return 'Azul';
    if (apiStar.temperature > 6000) return 'Blanca';
    if (apiStar.temperature > 4000) return 'Amarilla';
    if (apiStar.temperature > 2000) return 'Roja';
    return 'Enana';
  }

  // gener a un id para cada una de las estrellas 
  generateUniqueId(existingStars: Star[]): number {
    if (existingStars.length === 0) return 1;
    const maxId = Math.max(...existingStars.map(star => star.id));
    return maxId + 1;
  }
}