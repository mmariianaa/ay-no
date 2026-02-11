import { Component, OnInit } from '@angular/core';
import { NoticiasService, Noti} from '../services/noti';
import { AlertController, LoadingController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonIcon } from "@ionic/angular/standalone";
import { SlicePipe, DatePipe } from '@angular/common'; 
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  imports: [IonicModule, SlicePipe, DatePipe, RouterModule],
})
export class NoticiasPage implements OnInit {
  noticias: Noti[] = [];
  cargando: boolean = true;
  cargandoMas: boolean = false;
  error: string = '';
  paginaActual: number = 1;

  constructor(
    private noticiasService: NoticiasService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarNoticias();
  }

  async cargarNoticias() {
    this.cargando = true;
    this.error = '';
    this.paginaActual = 1;
    
    this.noticiasService.getNoticiasDesapariciones().subscribe({
      next: (data) => {
        this.noticias = data;
        this.cargando = false;
        console.log('Noticias cargadas:', this.noticias.length);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar noticias. Verifica tu conexión a internet.';
        this.cargando = false;
        this.noticias = [];
      }
    });
  }

  async cargarMasNoticias() {
    this.cargandoMas = true;

    setTimeout(() => {
      this.cargandoMas = false;
      this.mostrarToast('No hay más noticias disponibles');
    }, 1000);
  }

  async verDetalle(noticia: Noti) {
    const alert = await this.alertController.create({
      header: noticia.title,
      subHeader: noticia.source?.name || 'Fuente desconocida',
      message: `
        <div class="detalle-noticia">
          <p><strong>Publicado:</strong> ${new Date(noticia.publishedAt).toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          
          <p><strong>Descripción:</strong><br>${noticia.description}</p>
          
          ${noticia.content ? `<p><strong>Contenido:</strong><br>${noticia.content.split('[')[0]}</p>` : ''}
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Abrir en navegador',
          handler: () => {
            if (noticia.url) {
              window.open(noticia.url, '_blank');
            }
          }
        }
      ],
      cssClass: 'detalle-alert'
    });

    await alert.present();
  }

  async mostrarToast(mensaje: string) {
    const loading = await this.loadingController.create({
      message: mensaje,
      duration: 2000,
      spinner: null
    });
    await loading.present();
  }

  regresarHome() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
