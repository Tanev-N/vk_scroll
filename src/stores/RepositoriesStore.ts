import { makeAutoObservable } from 'mobx';
import { Repository } from '../types';

export class RepositoriesStore {
  repositories: Repository[] = [];
  loading = false;
  page = 1;
  hasMore = true;
  deletedIds: Set<number> = new Set();
  
  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setRepositories(repositories: Repository[]) {
    this.repositories = repositories.filter(repo => !this.deletedIds.has(repo.id));
  }

  addRepositories(repositories: Repository[]) {
    const filteredRepos = repositories.filter(repo => !this.deletedIds.has(repo.id));
    this.repositories = [...this.repositories, ...filteredRepos];
  }

  incrementPage() {
    this.page += 1;
  }

  setHasMore(hasMore: boolean) {
    this.hasMore = hasMore;
  }

  updateRepository(id: number, updates: Partial<Repository>) {
    this.repositories = this.repositories.map(repo => 
      repo.id === id ? { ...repo, ...updates } : repo
    );
  }

  deleteRepository(id: number) {
    this.repositories = this.repositories.filter(repo => repo.id !== id);
    this.deletedIds.add(id);
  }
}

export const repositoriesStore = new RepositoriesStore(); 