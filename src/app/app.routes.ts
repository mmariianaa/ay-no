import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'noticias',
    loadComponent: () => import('./noticias/noticias.page').then( m => m.NoticiasPage)
  }
];
// el mendigo httpclient MENDIGO
export const appConfig = {
  providers: [
    provideHttpClient(),
  ]
};