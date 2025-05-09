import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { FooterComponent} from "./components/footer/footer.component";
import { AdminComponent } from './components/admin/admin.component';
import { ProductsComponent } from './components/products/products.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent},
    {path: 'admin', component: AdminComponent},
    {path: 'products', component: ProductsComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent}
];
