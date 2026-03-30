import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Dexie, { type Table } from 'dexie';
import { Project } from '../models/project.model';
import { StorageService } from './storage.service';

interface KeyValue {
  key: string;
  value: string;
}

class CookPlannerDB extends Dexie {
  projects!: Table<Project, string>;
  settings!: Table<KeyValue, string>;

  constructor() {
    super('cookplanner');
    this.version(1).stores({
      projects: 'id',
      settings: 'key',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class IndexedDbStorageService implements StorageService {
  private platformId = inject(PLATFORM_ID);
  private db: CookPlannerDB | null = null;

  private getDb(): CookPlannerDB | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.db) {
      this.db = new CookPlannerDB();
    }
    return this.db;
  }

  async getProjects(): Promise<Project[]> {
    const db = this.getDb();
    if (!db) return [];
    return db.projects.toArray();
  }

  async saveProjects(projects: Project[]): Promise<void> {
    const db = this.getDb();
    if (!db) return;
    await db.transaction('rw', db.projects, async () => {
      const existingIds = await db.projects.toCollection().primaryKeys();
      const newIds = new Set(projects.map(p => p.id));
      const toDelete = existingIds.filter(id => !newIds.has(id as string));
      if (toDelete.length > 0) {
        await db.projects.bulkDelete(toDelete);
      }
      await db.projects.bulkPut(projects);
    });
  }

  async getUserName(): Promise<string> {
    const db = this.getDb();
    if (!db) return '';
    const entry = await db.settings.get('userName');
    return entry?.value ?? '';
  }

  async saveUserName(name: string): Promise<void> {
    const db = this.getDb();
    if (!db) return;
    await db.settings.put({ key: 'userName', value: name });
  }
}
