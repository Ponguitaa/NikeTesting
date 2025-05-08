import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

// Mock components to avoid loading the actual components
@Component({
  selector: 'app-header',
  standalone: true,
  template: '<h1>NikePage</h1>'
})
class MockHeaderComponent {}

@Component({
  selector: 'app-footer',
  standalone: true,
  template: ''
})
class MockFooterComponent {}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  template: ''
})
class MockLandingPageComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations()
      ],
      imports: [
        RouterTestingModule,
        AppComponent
      ]
    })
    .overrideComponent(AppComponent, {
      remove: { imports: [HeaderComponent, FooterComponent, LandingPageComponent] },
      add: { imports: [MockHeaderComponent, MockFooterComponent, MockLandingPageComponent] }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'NikePage' title property`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('NikePage');
  });

  it('should render title within header component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('NikePage');
  });

  it('should render header, router-outlet, and footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});
