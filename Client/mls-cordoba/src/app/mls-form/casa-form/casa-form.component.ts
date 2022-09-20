import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipList } from '@angular/material/chips';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  debounceTime,
  filter,
  map,
  Observable,
  startWith,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { MlsServiceService } from '../mls-service.service';
import { estadosOcupacion } from '../models/estadosOcupacion';
import { formasPago } from '../models/formasPago';
import { numerosBanios } from '../models/numerosBanios';
import { numerosBanioSocial } from '../models/numerosBanioSocial';
import { SelecItem } from '../models/selectItem';
import { tiposAntiguedad } from '../models/tiposAntiguedad';
import { tiposCantidadCochera } from '../models/tiposCantidadCochera';
import { tiposCaptacion } from '../models/tiposCaptacion';
import { tiposCategoria } from '../models/tiposCategoria';
import { tiposCochera } from '../models/tiposCochera';
import { tiposCocheraCasa } from '../models/tiposCocheraCasa';
import { tiposDestinoUso } from '../models/tiposDestinoUso';
import { tiposDormitorios } from '../models/tiposDormitorios';
import { tiposDormitoriosCasa } from '../models/tiposDormitoriosCasa';
import { tiposEstadosConservacion } from '../models/tiposEstadosConservacion';
import { tiposExtras } from '../models/tiposExtras';
import { tiposFormalizacionVenta } from '../models/tiposFormalizacionVenta';
import { tiposFormasLote } from '../models/tiposFormaLote';
import { tiposLote } from '../models/tiposLote';
import { tipoOrientacionLote } from '../models/tiposOrientacionLote';
import { tiposPropiedad } from '../models/tiposPropiedad';
import { tiposUbicacionBarrio } from '../models/tiposUbicacionBarrio';
import { tiposVendedor } from '../models/tiposVendedor';
import { tiposVenta } from '../models/tiposVenta';

@Component({
  selector: 'app-casa-form',
  templateUrl: './casa-form.component.html',
  styleUrls: ['./casa-form.component.scss'],
})
export class CasaFormComponent implements OnInit, OnDestroy {
  separatorKeysCodes: number[] = [ENTER, COMMA];

  public dormitorios = tiposDormitoriosCasa;
  public banios = numerosBanios;
  public baniosSociales = numerosBanioSocial;
  public todosLosExtras = cloneDeep(tiposExtras);
  public tiposCochera = tiposCocheraCasa;
  public tiposCantidadCochera = tiposCantidadCochera;

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
  public tiposUbicacionBarrio = tiposUbicacionBarrio;
  public tiposPropiedad = tiposPropiedad;
  public tiposFormaLote = tiposFormasLote;
  public tiposLote = tiposLote;
  public tiposOrientacionLote = tipoOrientacionLote;

  public barrios: SelecItem[] = [];
  public extras: SelecItem[] = [];
  public formasPago: SelecItem[] = [];
  public casaForm!: FormGroup;
  public startDate = new Date();
  public maxDate = moment();

  public destroy$ = new Subject<boolean>();
  public loading$ = new BehaviorSubject<boolean>(false);

  public filteredBarrios$!: Observable<SelecItem[]>;
  public filteredExtras$!: Observable<SelecItem[]>;

  @ViewChild('extraInput') extraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chipList') chipList!: MatChipList;
  @ViewChild('chipListExtras') chipListExtras!: MatChipList;
  @ViewChild('form') form!: NgForm;

  get casaFormContrls() {
    return this.casaForm.controls;
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
    this.loading$.next(true);

    this.service
      .getBarrios()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.loading$.next(false);
        this.barrios = items;
      });

    this.casaForm = this.formBuilder.group({
      barrio: ['', [Validators.required]],
      calle: ['', [Validators.required]],
      altura: ['', [Validators.required]],
      esHousing: [false],
      nomHousing: [{ value: '', disabled: true }],
      tipoUbicacion: ['', [Validators.required]],
      tipoPropiedad: ['', [Validators.required]],
      tipoFormaLote: ['', [Validators.required]],
      tipoLote: ['', [Validators.required]],
      supTerreno: ['', [Validators.required]],
      metrosFrente: [{ value: '', disabled: true }],
      metrosFondo: [{ value: '', disabled: true }],
      tipoOrientacion: ['', [Validators.required]],
      metrosCubiertos: ['', [Validators.required]],
      metrosDescubiertos: ['', [Validators.required]],

      dormitorios: ['', [Validators.required]],
      banios: ['', [Validators.required]],
      banioSocial: ['', [Validators.required]],
      tipoCochera: ['', [Validators.required]],
      cantCochera: [{ value: '', disabled: true }],

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

    this.filteredBarrios$ = this.casaForm.controls['barrio'].valueChanges.pipe(
      debounceTime(500),
      filter((value) => typeof value !== 'object'),
      map((searchValue) => {
        return this.barrios.filter((x) =>
          x.value.toLowerCase().includes(searchValue.toLowerCase())
        );
      })
    );
    this.filteredExtras$ = this.creacionPipes('extras', this.todosLosExtras);

    this.casaForm.controls['extrasChipList'].statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (status) => (this.chipListExtras.errorState = status === 'INVALID')
      );

    this.casaForm.controls['esHousing'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.casaForm.controls['nomHousing'].enable();
          this.casaForm.controls['nomHousing'].addValidators(
            Validators.required
          );
        } else {
          this.casaForm.controls['nomHousing'].setValue('');
          this.casaForm.controls['nomHousing'].disable();
          this.casaForm.controls['nomHousing'].removeValidators(
            Validators.required
          );
        }
      });

    this.casaForm.controls['tipoFormaLote'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection) => {
        const regular = this.tiposFormaLote.find((x) => x.id === 'Regular');
        const esquina = this.tiposFormaLote.find((x) => x.id === 'Esquina');

        if (selection === regular || selection === esquina) {
          this.casaForm.controls['metrosFrente'].enable();
          this.casaForm.controls['metrosFondo'].enable();
          this.casaForm.controls['metrosFondo'].addValidators(
            Validators.required
          );
          this.casaForm.controls['metrosFrente'].addValidators(
            Validators.required
          );
        } else {
          this.casaForm.controls['metrosFrente'].setValue('');
          this.casaForm.controls['metrosFrente'].disable();
          this.casaForm.controls['metrosFrente'].removeValidators(
            Validators.required
          );
          this.casaForm.controls['metrosFondo'].setValue('');
          this.casaForm.controls['metrosFondo'].disable();
          this.casaForm.controls['metrosFondo'].removeValidators(
            Validators.required
          );
        }
      });

    this.casaForm.controls['metrosFrente'].valueChanges
      .pipe(
        combineLatestWith(this.casaForm.controls['metrosFondo'].valueChanges),
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(([metrosFrente, metrosFondo]) => {
        let sup = this.casaForm.get('supTerreno')?.value;
        if (sup) {
          if (metrosFrente * metrosFondo > sup * 1.1) {
            this.casaForm.controls['metrosFrente'].setErrors({
              tamanioIncorrecto: true,
            });
            this.casaForm.controls['metrosFondo'].setErrors({
              tamanioIncorrecto: true,
            });
          }
        }
      });

    this.casaForm.controls['tipoCochera'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection) => {
        const noTiene = this.tiposCochera.find((x) => x.id === 'No posee');

        if (selection !== noTiene) {
          this.casaForm.controls['cantCochera'].enable();
          this.casaForm.controls['cantCochera'].addValidators(
            Validators.required
          );
        } else {
          this.casaForm.controls['cantCochera'].setValue('');
          this.casaForm.controls['cantCochera'].disable();
          this.casaForm.controls['cantCochera'].removeValidators(
            Validators.required
          );
        }
      });

    this.casaForm.controls['antiguedad'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection: SelecItem) => {
        if (
          selection !== this.antiguedades.find((x) => x.id === '1 año o más')
        ) {
          this.casaForm.controls['antiguedadAnios'].setValue('');
          this.casaForm.controls['antiguedadAnios'].disable();
          this.casaForm.controls['antiguedadAnios'].removeValidators(
            Validators.required
          );
        } else {
          this.casaForm.controls['antiguedadAnios'].enable();
          this.casaForm.controls['antiguedadAnios'].addValidators(
            Validators.required
          );
        }
      });
  }

  creacionPipes(control: string, lista: SelecItem[]): Observable<SelecItem[]> {
    return this.casaForm.controls[control].valueChanges.pipe(
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
    item.selected = $event.selected;
  }

  removeExtra(extra: SelecItem): void {
    extra.selected = false;
    const index = this.extras.indexOf(extra);
    if (index >= 0) {
      this.extras.splice(index, 1);
    }
    this.casaForm.controls['extras'].setValue(null);
    this.casaForm.controls['extrasChipList'].setValue(this.extras);
  }
  selectedExtras(event: MatAutocompleteSelectedEvent): void {
    event.option.value.selected = true;
    this.extras.push(event.option.value);
    this.extraInput.nativeElement.value = '';
    this.casaForm.controls['extras'].setValue(null);
    this.casaForm.controls['extrasChipList'].setValue(this.extras);
  }

  enviarEnable(): boolean {
    return !this.casaForm.valid;
  }

  enviarForm(): void {
    let casa = this.casaForm.value;
    casa.fechaIngresoTexto = casa.fechaIngreso.format('YYYY-MM-DD');
    casa.fechaVentaTexto = casa.fechaVenta.format('YYYY-MM-DD');
    casa.extras = casa.extrasChipList.map((x: any) => x.id);
    casa.formasPagoChipList = this.formasPago.map((x: any) => x.id);

    this.loading$.next(true);
    this.service
      .saveCasa(casa)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          console.log(data);
          this.casaForm.reset();
          this.form.resetForm();
          this.loading$.next(false);
          this.snackBar.open('Se pudo registrar exitosamente la casa');
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          this.loading$.next(false);
          this.snackBar.open('NO SE pudo registrar la casa');
          console.log(err);
        },
      });
  }
}
