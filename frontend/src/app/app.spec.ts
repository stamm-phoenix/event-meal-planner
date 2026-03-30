import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { STORAGE_SERVICE } from './services/storage.service';
import { Project } from './models/project.model';

const mockStorage = {
  getProjects: () => Promise.resolve([] as Project[]),
  saveProjects: () => Promise.resolve(),
  getUserName: () => Promise.resolve(''),
  saveUserName: () => Promise.resolve(),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        MessageService,
        ConfirmationService,
        provideRouter([]),
        { provide: STORAGE_SERVICE, useValue: mockStorage },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
