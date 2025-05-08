import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { LandingPageComponent } from "./components/landing-page/landing-page.component";
import { FooterComponent} from "./components/footer/footer.component";
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [{path: '', component: LandingPageComponent},
    {path: 'admin', component: AdminComponent}
];
