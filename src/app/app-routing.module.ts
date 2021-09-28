import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'entries',
    loadChildren: () => import('./pages/entries/entries.module').then(mod => mod.EntriesModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./pages/categories/categories.module').then(mod => mod.CategoriesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
