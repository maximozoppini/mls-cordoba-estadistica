import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';

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
  public todosLosExtras = cloneDeep(tiposExtras);
  public tiposCochera = tiposCochera;
  public categorias = tiposCategoria;
  public antiguedades = tiposAntiguedad;
  public estadosConservacion = tiposEstadosConservacion;
  public estadosOcupacion = estadosOcupacion;
  public tiposVendedor = tiposVendedor;
  public tiposFormalizacionVenta = tiposFormalizacionVenta;
  public destinosUso = tiposDestinoUso;
  public allFormasPago = cloneDeep(formasPago);
  public tiposVenta = tiposVenta;
  public tiposCaptacion = tiposCaptacion;

  public barrios: SelecItem[] = [];
  public extras: SelecItem[] = [];
  public formasPago: SelecItem[] = [];
  public departamentoForm!: FormGroup;
  public startDate = new Date();
  public defaultValue: any;
  public maxDate = moment();

  public destroy$ = new Subject<boolean>();
  public loading$ = new BehaviorSubject<boolean>(false);

  public filteredBarrios$!: Observable<SelecItem[]>;
  public filteredExtras$!: Observable<SelecItem[]>;

  @ViewChild('extraInput') extraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chipList') chipList!: MatChipList;
  @ViewChild('chipListExtras') chipListExtras!: MatChipList;
  @ViewChild('form') form!: NgForm;

  get deptoFormContrls() {
    return this.departamentoForm.controls;
  }

  constructor(
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private service: MlsServiceService,
    private router: Router
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
      extrasChipList: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      antiguedad: ['', [Validators.required]],
      antiguedadAnios: [{ value: '', disabled: true }],
      estadoConservacion: ['', [Validators.required]],
      estadoOcupacion: ['', [Validators.required]],
      tipoVendedor: ['', [Validators.required]],
      formalizacionVenta: ['', [Validators.required]],
      destinoUso: ['', [Validators.required]],
      formaPagoChipList: ['', [Validators.required]],
      fechaIngreso: ['', [Validators.required]],
      amenities: [false],
      ascensor: [false],
      precioInicialPeso: [false],
      ultimoPrecioPeso: [false],
      montoPrecioHistorico: [''],
      montoUltimoPrecio: [''],
      fechaVenta: ['', [Validators.required]],
      precioVentaPeso: [false],
      montoPrecioVenta: ['', [Validators.required]],
      tipoCaptacion: ['', [Validators.required]],
      tipoVenta: ['', [Validators.required]],
    });

    this.defaultValue = this.departamentoForm.value;

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

    this.departamentoForm.controls['extrasChipList'].statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (status) => (this.chipListExtras.errorState = status === 'INVALID')
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

  changeSelected($event: any, item: SelecItem): void {
    if ($event.selected) {
      this.formasPago.push(item);
    } else {
      this.formasPago = this.formasPago.filter((x) => x.id !== item.id);
    }
    console.log(this.formasPago);
    item.selected = $event.selected;
  }

  removeExtra(extra: SelecItem): void {
    extra.selected = false;
    const index = this.extras.indexOf(extra);
    if (index >= 0) {
      this.extras.splice(index, 1);
    }
    this.departamentoForm.controls['extras'].setValue(null);
    this.departamentoForm.controls['extrasChipList'].setValue(this.extras);
  }
  selectedExtras(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.extras.push(event.option.value);
    this.extraInput.nativeElement.value = '';
    this.departamentoForm.controls['extras'].setValue(null);
    this.departamentoForm.controls['extrasChipList'].setValue(this.extras);
  }

  enviarEnable(): boolean {
    return !this.departamentoForm.valid;
  }

  enviarForm(): void {
    let depto = this.departamentoForm.value;
    depto.fechaIngresoTexto = depto.fechaIngreso.format('YYYY-MM-DD');
    depto.fechaVentaTexto = depto.fechaVenta.format('YYYY-MM-DD');
    depto.extras = depto.extrasChipList.map((x: any) => x.id);
    depto.formasPagoChipList = this.formasPago.map((x: any) => x.id);

    this.loading$.next(true);
    this.service
      .saveDepartamento(depto)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          console.log(data);
          this.departamentoForm.reset();
          this.form.resetForm();
          this.loading$.next(false);
          this.snackBar.open(
            'Se pudo registrar exitosamente el departamento',
            'salir'
          );
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          this.loading$.next(false);
          this.snackBar.open('NO SE pudo registrar  el departamento', 'salir');
          console.log(err);
        },
      });
  }
}
