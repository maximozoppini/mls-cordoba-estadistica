import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartamentoFormComponent } from './departamento-form/departamento-form.component';
import { LoteFormComponent } from './lote-form/lote-form.component';
import { CasaFormComponent } from './casa-form/casa-form.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  DateAdapter,
  MatCommonModule,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MatMomentDateModule,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CurrencyMaskConfig,
  CurrencyMaskModule,
  CURRENCY_MASK_CONFIG,
} from 'ng2-currency-mask';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  decimal: ',',
  precision: 2,
  prefix: '$ ',
  suffix: '',
  thousands: '.',
};

@NgModule({
  declarations: [
    DepartamentoFormComponent,
    LoteFormComponent,
    CasaFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'form',
        children: [
          { path: '', component: DepartamentoFormComponent },
          { path: 'departamento', component: DepartamentoFormComponent },
          { path: 'casa', component: CasaFormComponent },
          { path: 'lote', component: LoteFormComponent },
        ],
      },
    ]),
    ReactiveFormsModule,
    CurrencyMaskModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCommonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatDividerModule,
    BrowserAnimationsModule,
    NgbModule,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } },
    { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig },
  ],
})
export class MlsFormModule {}
