import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MlsFormModule } from './mls-form/mls-form.module';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
  //initial route
  { path: 'home', component: HomeComponent },
  //no rounte
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  //no page found
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), MlsFormModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
