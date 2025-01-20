export interface Repository {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface SearchResponse {
  items: Repository[];
  total_count: number;
} 