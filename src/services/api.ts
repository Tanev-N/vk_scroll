import axios from 'axios';
import { SearchResponse } from '../types';

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

export const searchRepositories = async (
  query: string,
  page: number,
  sort: string = 'stars',
  order: 'desc' | 'asc' = 'desc'
) => {
  const response = await api.get<SearchResponse>('/search/repositories', {
    params: {
      q: query,
      sort,
      order,
      page,
      per_page: 30,
    },
  });
  return response.data;
}; 