import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { searchRepositories } from '../../services/api';
import RepositoryList from './RepositoryList';
import { repositoriesStore } from '../../stores/RepositoriesStore';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Мокаем API
jest.mock('../../services/api');
const mockedSearchRepositories = searchRepositories as jest.MockedFunction<typeof searchRepositories>;

const mockRepo = {
  id: 1,
  name: 'test-repo',
  description: 'Test description',
  stargazers_count: 100,
  forks_count: 50,
  updated_at: '2024-01-01',
  html_url: 'https://github.com/test/repo',
  owner: {
    login: 'test',
    avatar_url: 'https://test.com/avatar.png'
  }
};

describe('RepositoryList', () => {
  beforeEach(() => {
    // Очищаем моки и состояние перед каждым тестом
    jest.clearAllMocks();
    repositoriesStore.setRepositories([]);
  });

  it('загружает и отображает репозитории', async () => {
    mockedSearchRepositories.mockResolvedValueOnce({
      items: [mockRepo],
      total_count: 1
    });

    render(<RepositoryList />);

    // Проверяем загрузку
    expect(screen.getByText(/loading/i)).toBeTruthy();

    // Ждем появления данных
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeTruthy();
    });
  });

  it('позволяет искать репозитории', async () => {
    mockedSearchRepositories.mockResolvedValueOnce({
      items: [mockRepo],
      total_count: 1
    });

    render(<RepositoryList />);

    const searchInput = screen.getByPlaceholderText(/search repositories/i);
    fireEvent.change(searchInput, { target: { value: 'react' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(mockedSearchRepositories).toHaveBeenCalledWith(
      'react',
      expect.any(Number),
      expect.any(String),
      expect.any(String)
    );
  });

  it('позволяет редактировать репозиторий', async () => {
    repositoriesStore.setRepositories([mockRepo]);
    
    render(<RepositoryList />);

    // Открываем модальное окно редактирования
    fireEvent.click(screen.getByText('Edit'));

    // Изменяем название
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'updated-name' } });

    // Сохраняем изменения
    fireEvent.click(screen.getByText('Save'));

    // Проверяем, что изменения применились
    expect(screen.getByText('updated-name')).toBeTruthy();
  });

  it('позволяет удалять репозиторий', () => {
    repositoriesStore.setRepositories([mockRepo]);
    
    render(<RepositoryList />);

    // Удаляем репозиторий
    fireEvent.click(screen.getByText('Delete'));

    // Проверяем, что репозиторий удален
    expect(screen.queryByText('test-repo')).toBeNull();
  });
}); 