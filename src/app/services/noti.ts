// src/app/services/noticias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Noti {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = 'https://newsapi.org/v2/everything';
  private apiKey = 'f6678c50d61940d8b2f38f8d16f92028';

  constructor(private http: HttpClient) { }

  getNoticiasDesapariciones(): Observable<Noti[]> {
    const params = new HttpParams()
      .set('q', 'desaparición OR desaparecidos OR desapareció OR desaparecida OR desaparecido OR "personas desaparecidas"')
      .set('language', 'es')
      .set('sortBy', 'publishedAt')
      .set('pageSize', '30') // Traer más noticias para mostrar
      .set('apiKey', this.apiKey);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.articles && Array.isArray(response.articles)) {
          // Filtrar y ordenar noticias
          return response.articles
            .filter((article: any) => 
              article.title && 
              article.title !== '[Removed]' &&
              article.description &&
              article.urlToImage
            )
            .sort((a: any, b: any) => {
              return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            })
            .slice(0, 30); 
        }
        return [];
      })
    );
  }

  // Alternativa con términos específicos para México
  getNoticiasMexico(): Observable<Noti[]> {
    const params = new HttpParams()
      .set('q', '(desaparición OR desaparecidos) AND México')
      .set('language', 'es')
      .set('sortBy', 'publishedAt')
      .set('pageSize', '30')
      .set('apiKey', this.apiKey);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.articles && Array.isArray(response.articles)) {
          return response.articles
            .filter((article: any) => 
              article.title && 
              article.title !== '[Removed]' &&
              article.description
            )
            .sort((a: any, b: any) => {
              return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });
        }
        return [];
      })
    );
  }
}