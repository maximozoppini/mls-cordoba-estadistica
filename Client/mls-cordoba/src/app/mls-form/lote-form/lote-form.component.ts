import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatChipList } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  map,
  Observable,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { MlsServiceService } from '../mls-service.service';
import { formasPago } from '../models/formasPago';
import { SelecItem } from '../models/selectItem';
import { tiposCaptacion } from '../models/tiposCaptacion';
import { tiposDestinoUso } from '../models/tiposDestinoUso';
import { tiposFormalizacionVenta } from '../models/tiposFormalizacionVenta';
import { tiposFormasLote } from '../models/tiposFormaLote';
import { tiposLote } from '../models/tiposLote';
import { tipoOrientacionLote } from '../models/tiposOrientacionLote';
import { tiposUbicacionBarrio } from '../models/tiposUbicacionBarrio';
import { tiposUsoSuelo } from '../models/tiposUsoDeSuelo';
import { tiposVendedor } from '../models/tiposVendedor';
import { tiposVenta } from '../models/tiposVenta';

@Component({
  selector: 'app-lote-form',
  templateUrl: './lote-form.component.html',
  styleUrls: ['./lote-form.component.scss'],
})
export class LoteFormComponent implements OnInit, OnDestroy {
  separatorKeysCodes: number[] = [ENTER, COMMA];

  public tiposVendedor = [
    ...tiposVendedor.filter((x) => x.id !== 'Constructor'),
  ];
  public tiposFormalizacionVenta = tiposFormalizacionVenta;
  public destinosUso = tiposDestinoUso;
  public allFormasPago = cloneDeep(formasPago);
  public tiposVenta = tiposVenta;
  public tiposCaptacion = tiposCaptacion;
  public tiposUbicacionBarrio = tiposUbicacionBarrio;
  public tiposFormaLote = tiposFormasLote;
  public tiposLote = tiposLote;
  public tiposOrientacionLote = tipoOrientacionLote;
  public tiposUsoSuelo = tiposUsoSuelo;

  public barrios: SelecItem[] = [];
  public formasPago: SelecItem[] = [];
  public loteForm!: FormGroup;
  public startDate = new Date();
  public maxDate = moment();

  public destroy$ = new Subject<boolean>();
  public loading$ = new BehaviorSubject<boolean>(false);

  public filteredBarrios$!: Observable<SelecItem[]>;

  @ViewChild('chipList') chipList!: MatChipList;
  @ViewChild('form') form!: NgForm;

  get loteFormContrls() {
    return this.loteForm.controls;
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

    this.loteForm = this.formBuilder.group({
      barrio: ['', [Validators.required]],
      calle: ['', [Validators.required]],
      altura: ['', [Validators.required]],
      esHousing: [false],
      nomHousing: [{ value: '', disabled: true }],
      tipoUbicacion: ['', [Validators.required]],
      tipoFormaLote: ['', [Validators.required]],
      tipoLote: ['', [Validators.required]],
      supTerreno: ['', [Validators.required]],
      metrosFrente: [{ value: 0, disabled: true }],
      metrosFondo: [{ value: 0, disabled: true }],
      tipoOrientacion: ['', [Validators.required]],
      usoSuelo: ['', [Validators.required]],

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

    this.filteredBarrios$ = this.loteForm.controls['barrio'].valueChanges.pipe(
      debounceTime(500),
      filter((value) => typeof value !== 'object'),
      map((searchValue) => {
        return this.barrios.filter((x) =>
          x.value.toLowerCase().includes(searchValue.toLowerCase())
        );
      })
    );

    this.loteForm.controls['esHousing'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.loteForm.controls['nomHousing'].enable();
          this.loteForm.controls['nomHousing'].addValidators(
            Validators.required
          );
        } else {
          this.loteForm.controls['nomHousing'].setValue('');
          this.loteForm.controls['nomHousing'].disable();
          this.loteForm.controls['nomHousing'].removeValidators(
            Validators.required
          );
        }
      });

    this.loteForm.controls['tipoFormaLote'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selection) => {
        const regular = this.tiposFormaLote.find((x) => x.id === 'Regular');
        const esquina = this.tiposFormaLote.find((x) => x.id === 'Esquina');

        if (selection === regular || selection === esquina) {
          this.loteForm.controls['metrosFrente'].enable();
          this.loteForm.controls['metrosFondo'].enable();
          this.loteForm.controls['metrosFondo'].addValidators(
            Validators.required
          );
          this.loteForm.controls['metrosFrente'].addValidators(
            Validators.required
          );
        } else {
          this.loteForm.controls['metrosFrente'].setValue('');
          this.loteForm.controls['metrosFrente'].disable();
          this.loteForm.controls['metrosFrente'].removeValidators(
            Validators.required
          );
          this.loteForm.controls['metrosFondo'].setValue('');
          this.loteForm.controls['metrosFondo'].disable();
          this.loteForm.controls['metrosFondo'].removeValidators(
            Validators.required
          );
        }
      });
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

  enviarEnable(): boolean {
    return !this.loteForm.valid;
  }

  enviarForm(): void {
    let lote = this.loteForm.value;
    lote.fechaIngresoTexto = lote.fechaIngreso.format('YYYY-MM-DD');
    lote.fechaVentaTexto = lote.fechaVenta.format('YYYY-MM-DD');
    lote.formasPagoChipList = this.formasPago.map((x: any) => x.id);

    this.loading$.next(true);
    this.service
      .saveLote(lote)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          console.log(data);
          this.loteForm.reset();
          this.form.resetForm();
          this.loading$.next(false);
          this.snackBar.open('Se pudo registrar exitosamente el lote');
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          this.loading$.next(false);
          this.snackBar.open('NO SE pudo registrar el lote');
          console.log(err);
        },
      });
  }
}
