import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EstrellasService, Star } from '../services/estrellas';
import { ClimaService, Weather } from '../services/clima';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
  // decoradores
  @ViewChild('starsTable') starsTable!: ElementRef;
  @ViewChild('weatherCard') weatherCard!: ElementRef;
  
  stars: Star[] = [];
  filteredStars: Star[] = [];
  searchTerm: string = '';
  isLoadingStars = false;
  isLoadingWeather = false;
  weather: Weather | null = null;

  constructor(
    private estrellasService: EstrellasService,
    private climaService: ClimaService
  ) {}

  ngOnInit() {
    // Cargar estrellas por defecto
    this.loadDefaultStars();
    
    // Cargar clima
    this.loadWeather();
  }

  // Cargar estrellas por defecto
  loadDefaultStars() {
    this.stars = this.estrellasService.getDefaultStars();
    this.filteredStars = [...this.stars];
    this.renderTable();
  }

  // Cargar clima
  loadWeather() {
    this.isLoadingWeather = true;
    this.renderWeather();
    
    this.climaService.getCurrentWeather().subscribe({
      next: (weatherData) => {
        this.weather = weatherData;
        this.isLoadingWeather = false;
        this.renderWeather();
      },
      error: (error) => {
        console.error('Error cargando clima:', error);
        this.isLoadingWeather = false;
        this.renderWeather();
      }
    });
  }

  // Buscar estrellas
  searchStars() {
    if (!this.searchTerm.trim()) {
      alert('Por favor ingresa un nombre de estrella');
      return;
    }

    this.isLoadingStars = true;
    
    // Limpiar resultados anteriores
    this.filteredStars = [];
    this.renderTable();
    
    this.estrellasService.searchStarsByName(this.searchTerm).subscribe({
      next: (apiStars) => {
        if (apiStars.length === 0) {
          alert('No se encontraron estrellas con ese nombre. Mostrando estrellas por defecto.');
          this.loadDefaultStars();
        } else {
          this.filteredStars = this.estrellasService.convertApiStarsToStars(apiStars);
          this.renderTable();
        }
        this.isLoadingStars = false;
      },
      error: (error) => {
        console.error('Error buscando estrellas:', error);
        alert('Error al buscar estrella. Mostrando estrellas por defecto.');
        this.loadDefaultStars();
        this.isLoadingStars = false;
      }
    });
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.filteredStars = [...this.stars];
    this.renderTable();
  }

  // Renderizar tabla
  renderTable() {
    const tableBody = this.starsTable?.nativeElement?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (this.filteredStars.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'No se encontraron estrellas. Intenta con otro nombre.';
      cell.style.textAlign = 'center';
      cell.style.padding = '20px';
      cell.style.color = '#666';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }
    
    this.filteredStars.forEach(star => {
      const row = document.createElement('tr');
      
      // Celda de imagen
      const imgCell = document.createElement('td');
      const img = document.createElement('img');
      img.src = star.imageUrl;
      img.alt = star.name;
      img.style.width = '60px';
      img.style.height = '60px';
      img.style.borderRadius = '8px';
      img.style.objectFit = 'cover';
      imgCell.appendChild(img);
      
      // Celda de nombre
      const nameCell = document.createElement('td');
      nameCell.textContent = star.name;
      nameCell.className = 'star-name';
      
      // Celda de tipo
      const typeCell = document.createElement('td');
      typeCell.textContent = star.type;
      typeCell.className = 'star-type';
      
      // Celda de acciones
      const actionCell = document.createElement('td');
      const deleteBtn = document.createElement('ion-button');
      deleteBtn.color = 'danger';
      deleteBtn.size = 'small';
      deleteBtn.innerHTML = '<ion-icon name="trash-outline"></ion-icon> Eliminar';
      deleteBtn.onclick = () => this.deleteStar(star.id);
      actionCell.appendChild(deleteBtn);
      
      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(typeCell);
      row.appendChild(actionCell);
      
      tableBody.appendChild(row);
    });
  }

  // Renderizar clima
  renderWeather() {
    const weatherContainer = this.weatherCard?.nativeElement;
    if (!weatherContainer) return;

    weatherContainer.innerHTML = '';

    if (this.isLoadingWeather) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'loading-weather';
      loadingDiv.innerHTML = `
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información del clima...</p>
      `;
      weatherContainer.appendChild(loadingDiv);
      return;
    }

    if (!this.weather) return;

    const weatherContent = document.createElement('div');
    weatherContent.className = 'weather-content';
    weatherContent.innerHTML = `
      <div class="weather-main">
        <img src="${this.weather.icon}" alt="${this.weather.condition}" class="weather-icon">
        <div class="weather-info">
          <h2>${this.weather.temperature}°C</h2>
          <p class="weather-condition">${this.weather.condition}</p>
        </div>
      </div>
      
      <div class="weather-details">
        <div class="weather-detail">
          <ion-icon name="water-outline"></ion-icon>
          <span>${this.weather.humidity}% Humedad</span>
        </div>
        <div class="weather-detail">
          <ion-icon name="speedometer-outline"></ion-icon>
          <span>${this.weather.windSpeed} m/s Viento</span>
        </div>
      </div>
      
      <div class="location-info">
        <ion-icon name="location-outline"></ion-icon>
        <span>${this.weather.location}</span>
      </div>
    `;

    weatherContainer.appendChild(weatherContent);
  }

  // Actualizar clima
  refreshWeather() {
    this.loadWeather();
  }

  // Eliminar estrella
  deleteStar(starId: number) {
    if (confirm('¿Estás seguro de eliminar esta estrella de la lista?')) {
      this.stars = this.stars.filter(star => star.id !== starId);
      this.filteredStars = this.filteredStars.filter(star => star.id !== starId);
      this.renderTable();
    }
  }
}