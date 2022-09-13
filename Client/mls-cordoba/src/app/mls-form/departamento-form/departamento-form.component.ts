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
import { MatChipList } from '@angular/material/chips';
import * as moment from 'moment';

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
  public filteredExtras$!: Observable<SelecItem[]>;
  public filteredFormasPago$!: Observable<SelecItem[]>;

  @ViewChild('extraInput') extraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('formaPagoInput') formaPagoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chipListFormaPago') chipListFormaPago!: MatChipList;

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
      calle: ['', [Validators.required]],
      altura: ['', [Validators.required]],
      tipoDesarrollo: ['', [Validators.required]],
      supCubierta: ['', [Validators.required]],
      tipoSuperficie: ['', [Validators.required]],
      supDescubierta: [{ value: '', disabled: true }],
      numPiso: ['', [Validators.required]],
      disposicion: ['', [Validators.required]],
      dormitorios: ['', [Validators.required]],
      banios: ['', [Validators.required]],
      banioSocial: ['', [Validators.required]],
      cochera: ['', [Validators.required]],
      extras: [''],
      categoria: ['', [Validators.required]],
      antiguedad: ['', [Validators.required]],
      antiguedadAnios: [{ value: '', disabled: true }],
      estadoConservacion: ['', [Validators.required]],
      estadoOcupacion: ['', [Validators.required]],
      tipoVendedor: ['', [Validators.required]],
      formalizacionVenta: ['', [Validators.required]],
      destinoUso: ['', [Validators.required]],
      formasPago: [''],
      formasPagoChipList: ['', [Validators.required]],
      fechaIngreso: [moment(), [Validators.required]],
      precioInicialMoneda: [false],
      ultimoPrecioMoneda: [false],
      montoPrecioHistorico: ['', [Validators.required]],
      montoUltimoPrecio: ['', [Validators.required]],
      fechaVenta: [moment(), [Validators.required]],
      precioVentaMoneda: [false],
      montoPrecioVenta: ['', [Validators.required]],
      tipoCaptacion: ['', [Validators.required]],
      tipoVenta: ['', [Validators.required]],
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
    this.filteredExtras$ = this.creacionPipes('extras', this.todosLosExtras);
    this.filteredFormasPago$ = this.creacionPipes(
      'formasPago',
      this.allFormasPago
    );

    this.departamentoForm.controls['formasPagoChipList'].statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (status) => (this.chipListFormaPago.errorState = status === 'INVALID')
      );

    this.departamentoForm.controls['tipoSuperficie'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection: SelecItem) => {
        if (
          selection === this.tiposSuperficies.find((x) => x.id === 'NO TIENE')
        ) {
          this.departamentoForm.controls['supDescubierta'].setValue('');
          this.departamentoForm.controls['supDescubierta'].disable();
          this.departamentoForm.controls['supDescubierta'].removeValidators(
            Validators.required
          );
        } else {
          this.departamentoForm.controls['supDescubierta'].enable();
          this.departamentoForm.controls['supDescubierta'].addValidators(
            Validators.required
          );
        }
      });

    this.departamentoForm.controls['antiguedad'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection: SelecItem) => {
        if (
          selection !== this.antiguedades.find((x) => x.id === '1 año o más')
        ) {
          this.departamentoForm.controls['antiguedadAnios'].setValue('');
          this.departamentoForm.controls['antiguedadAnios'].disable();
          this.departamentoForm.controls['antiguedadAnios'].removeValidators(
            Validators.required
          );
        } else {
          this.departamentoForm.controls['antiguedadAnios'].enable();
          this.departamentoForm.controls['antiguedadAnios'].addValidators(
            Validators.required
          );
        }
      });
  }

  creacionPipes(control: string, lista: SelecItem[]): Observable<SelecItem[]> {
    return this.departamentoForm.controls[control].valueChanges.pipe(
      startWith(''),
      debounceTime(150),
      map((searchValue: string | null) => {
        return searchValue
          ? lista.filter(
              (x) => x.value.toLowerCase().includes(searchValue) && !x.selected
            )
          : lista.filter((x) => !x.selected);
      })
    );
  }

  displayBarrioFn(barrio: SelecItem): string {
    return barrio && barrio.value ? barrio.value : '';
  }

  removeExtra(extra: SelecItem): void {
    extra.selected = false;
    const index = this.extras.indexOf(extra);
    if (index >= 0) {
      this.extras.splice(index, 1);
    }
    this.departamentoForm.controls['extras'].setValue(null);
  }
  selectedExtras(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.extras.push(event.option.value);
    this.extraInput.nativeElement.value = '';
    this.departamentoForm.controls['extras'].setValue(null);
  }

  removeFormaPago(formaPago: SelecItem): void {
    formaPago.selected = false;
    const index = this.formasPago.indexOf(formaPago);
    if (index >= 0) {
      this.formasPago.splice(index, 1);
    }
    this.departamentoForm.controls['formasPago'].setValue(null);
    this.departamentoForm.controls['formasPagoChipList'].setValue(
      this.formasPago
    );
  }
  selectedFormaPago(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.formasPago.push(event.option.value);
    this.formaPagoInput.nativeElement.value = '';
    this.departamentoForm.controls['formasPagoChipList'].setValue(
      this.formasPago
    );
    this.departamentoForm.controls['formasPago'].setValue(null);
  }

  enviarEnable(): boolean {
    return !this.departamentoForm.valid;
  }

  enviarForm(): void {
    let depto = this.departamentoForm.value;
    depto.fechaIngresoTexto = depto.fechaIngreso.format('YYYY-MM-DD');
    depto.fechaVentaTexto = depto.fechaVenta.format('YYYY-MM-DD');
    depto.extras = this.extras.length > 0 ? this.extras.map((x) => x.id) : [];
    depto.formasPagoChipList = depto.formasPagoChipList.map((x: any) => x.id);
    this.service
      .saveDepartamento(depto)
      .pipe(take(1))
      .subscribe((data) => console.log(data));
  }
}
