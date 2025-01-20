import { makeAutoObservable } from 'mobx';
import { Repository } from '../types';

export class RepositoriesStore {
  repositories: Repository[] = [];
  loading = false;
  page = 1;
  hasMore = true;
  deletedIds: Set<number> = new Set();
  editedRepos: Map<number, Partial<Repository>> = new Map();
  
  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setRepositories(repositories: Repository[]) {
    this.repositories = repositories
      .filter(repo => !this.deletedIds.has(repo.id))
      .map(repo => {
        const edits = this.editedRepos.get(repo.id);
        return edits ? { ...repo, ...edits } : repo;
      });
  }

  addRepositories(repositories: Repository[]) {
    const filteredRepos = repositories
      .filter(repo => !this.deletedIds.has(repo.id))
      .map(repo => {
        const edits = this.editedRepos.get(repo.id);
        return edits ? { ...repo, ...edits } : repo;
      });
    this.repositories = [...this.repositories, ...filteredRepos];
  }

  incrementPage() {
    this.page += 1;
  }

  setHasMore(hasMore: boolean) {
    this.hasMore = hasMore;
  }

  updateRepository(id: number, updates: Partial<Repository>) {
    this.editedRepos.set(id, { ...this.editedRepos.get(id), ...updates });
    this.repositories = this.repositories.map(repo => 
      repo.id === id ? { ...repo, ...updates } : repo
    );
  }

  deleteRepository(id: number) {
    this.repositories = this.repositories.filter(repo => repo.id !== id);
    this.deletedIds.add(id);
  }

  resetPagination() {
    this.page = 1;
    this.hasMore = true;
    this.repositories = [];
  }
}

export const repositoriesStore = new RepositoriesStore(); 