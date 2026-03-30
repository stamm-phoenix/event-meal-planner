import { InjectionToken } from '@angular/core';
import { Project } from '../models/project.model';

export interface StorageService {
  getProjects(): Promise<Project[]>;
  saveProjects(projects: Project[]): Promise<void>;
  getUserName(): Promise<string>;
  saveUserName(name: string): Promise<void>;
}

export const STORAGE_SERVICE = new InjectionToken<StorageService>('StorageService');
