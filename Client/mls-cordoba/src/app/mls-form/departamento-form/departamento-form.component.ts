import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  debounceTime,
  filter,
  map,
  Observable,
  pipe,
  startWith,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { MlsServiceService } from '../mls-service.service';
import { numerosBanios } from '../models/numerosBanios';
import { numerosBanioSocial } from '../models/numerosBanioSocial';
import { numerosPiso } from '../models/numerosPiso';
import { SelecItem } from '../models/selectItem';
import { tiposDesarrollo } from '../models/tiposDesarrollo';
import { tiposDisposiciones } from '../models/tiposDisposiciones';
import { tiposDormitorios } from '../models/tiposDormitorios';
import { tiposExtras } from '../models/tiposExtras';
import { tiposSuperficiesDescubiertas } from '../models/tiposSuperficies';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { tiposCochera } from '../models/tiposCochera';
import { tiposCategoria } from '../models/tiposCategoria';
import { tiposAntiguedad } from '../models/tiposAntiguedad';
import { tiposEstadosConservacion } from '../models/tiposEstadosConservacion';
import { estadosOcupacion } from '../models/estadosOcupacion';
import { tiposVendedor } from '../models/tiposVendedor';
import { tiposFormalizacionVenta } from '../models/tiposFormalizacionVenta';
import { tiposDestinoUso } from '../models/tiposDestinoUso';
import { formasPago } from '../models/formasPago';
import { tiposVenta } from '../models/tiposVenta';
import { tiposCaptacion } from '../models/tiposCaptacion';

@Component({
  selector: 'app-departamento-form',
  templateUrl: './departamento-form.component.html',
  styleUrls: ['./departamento-form.component.scss'],
})
export class DepartamentoFormComponent implements OnInit, OnDestroy {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public tiposDesarrollo = tiposDesarrollo;
  public tiposSuperficies = tiposSuperficiesDescubiertas;
  public numerosPisos = numerosPiso;
  public disposiciones = tiposDisposiciones;
  public dormitorios = tiposDormitorios;
  public banios = numerosBanios;
  public baniosSociales = numerosBanioSocial;
  public todosLosExtras = tiposExtras;
  public tiposCochera = tiposCochera;
  public categorias = tiposCategoria;
  public antiguedades = tiposAntiguedad;
  public estadosConservacion = tiposEstadosConservacion;
  public estadosOcupacion = estadosOcupacion;
  public tiposVendedor = tiposVendedor;
  public tiposFormalizacionVenta = tiposFormalizacionVenta;
  public destinosUso = tiposDestinoUso;
  public allFormasPago = formasPago;
  public tiposVenta = tiposVenta;
  public tiposCaptacion = tiposCaptacion;

  public barrios: SelecItem[] = [];
  public extras: SelecItem[] = [];
  public formasPago: SelecItem[] = [];
  public departamentoForm!: FormGroup;
  public startDate = new Date();

  public destroy$ = new Subject<boolean>();

  public filteredBarrios$!: Observable<SelecItem[]>;
  public filteredTipoDesarrollo$!: Observable<SelecItem[]>;
  public filteredTipoSuperficie$!: Observable<SelecItem[]>;
  public filteredNumerosPiso$!: Observable<SelecItem[]>;
  public filteredDisposiciones$!: Observable<SelecItem[]>;
  public filteredDormitorios$!: Observable<SelecItem[]>;
  public filteredBanios$!: Observable<SelecItem[]>;
  public filteredBaniosSociales$!: Observable<SelecItem[]>;
  public filteredCocheras$!: Observable<SelecItem[]>;
  public filteredExtras$!: Observable<SelecItem[]>;
  public filteredFormasPago$!: Observable<SelecItem[]>;

  @ViewChild('extraInput') extraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formaPagoInput') formaPagoInput!: ElementRef<HTMLInputElement>;

  get deptoFormContrls() {
    return this.departamentoForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private service: MlsServiceService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.service
      .getBarrios()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => (this.barrios = items));

    this.departamentoForm = this.formBuilder.group({
      barrio: ['', [Validators.required]],
      calle: [],
      altura: [],
      tipoDesarrollo: [],
      supCubierta: [],
      tipoSuperficie: [],
      supDescubierta: [],
      numPiso: [],
      disposicion: [],
      dormitorios: [],
      banios: [],
      banioSocial: [],
      cochera: [],
      extras: [],
      categoria: [],
      antiguedad: [],
      antiguedadAnios: [],
      estadoConservacion: [],
      estadoOcupacion: [],
      tipoVendedor: [],
      formalizacionVenta: [],
      destinoUso: [],
      formasPago: [],
      fechaIngreso: [],
      precioInicialMoneda: [],
      ultimoPrecioMoneda: [],
      montoPrecioHistorico: [],
      montoUltimoPrecio: [],
      fechaVenta: [],
      precioVentaMoneda: [],
      montoPrecioVenta: [],
      tipoCaptacion: [],
      tipoVenta: [],
    });

    this.filteredBarrios$ = this.departamentoForm.controls[
      'barrio'
    ].valueChanges.pipe(
      debounceTime(500),
      filter((value) => typeof value !== 'object'),
      map((searchValue) => {
        return this.barrios.filter((x) =>
          x.value.toLowerCase().includes(searchValue.toLowerCase())
        );
      })
    );
    this.filteredTipoDesarrollo$ = this.creacionPipes(
      'tipoDesarrollo',
      this.tiposDesarrollo
    );
    this.filteredTipoSuperficie$ = this.creacionPipes(
      'tipoSuperficie',
      this.tiposSuperficies
    );
    this.filteredNumerosPiso$ = this.creacionPipes(
      'numPiso',
      this.numerosPisos
    );
    this.filteredDisposiciones$ = this.creacionPipes(
      'disposicion',
      this.disposiciones
    );
    this.filteredDormitorios$ = this.creacionPipes(
      'dormitorios',
      this.dormitorios
    );
    this.filteredBanios$ = this.creacionPipes('banios', this.banios);
    this.filteredBaniosSociales$ = this.creacionPipes(
      'banioSocial',
      this.baniosSociales
    );
    this.filteredCocheras$ = this.creacionPipes('cochera', this.tiposCochera);
    this.filteredExtras$ = this.creacionPipes('extras', this.todosLosExtras);
    this.filteredFormasPago$ = this.creacionPipes(
      'formasPago',
      this.allFormasPago
    );
  }

  creacionPipes(control: string, lista: SelecItem[]): Observable<SelecItem[]> {
    return this.departamentoForm.controls[control].valueChanges.pipe(
      startWith(''),
      debounceTime(150),
      map((searchValue) => {
        return lista.filter((x) => x.value.toLowerCase().includes(searchValue));
      })
    );
  }

  displayBarrioFn(barrio: SelecItem): string {
    return barrio && barrio.value ? barrio.value : '';
  }

  removeExtra(extra: SelecItem): void {
    const index = this.extras.indexOf(extra);

    if (index >= 0) {
      this.extras.splice(index, 1);
    }
  }
  selectedExtras(event: MatAutocompleteSelectedEvent): void {
    this.extras.push(event.option.value);
    this.extraInput.nativeElement.value = '';
    this.departamentoForm.controls['extras'].setValue(null);
  }

  removeFormaPago(formaPago: SelecItem): void {
    const index = this.formasPago.indexOf(formaPago);
    if (index >= 0) {
      this.formasPago.splice(index, 1);
    }
  }
  selectedFormaPago(event: MatAutocompleteSelectedEvent): void {
    this.formasPago.push(event.option.value);
    this.formaPagoInput.nativeElement.value = '';
    this.departamentoForm.controls['formasPago'].setValue(null);
  }

  enviarForm(): void {
    let depto = this.departamentoForm.value;
    console.log(
      '🚀 ~ file: departamento-form.component.ts ~ line 226 ~ DepartamentoFormComponent ~ enviarForm ~ depto',
      depto
    );

    // this.service
    //   .saveDepartamento(depto)
    //   .pipe(take(1))
    //   .subscribe((data) => console.log(data));
  }
}
