import { FC, useEffect, useRef, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { List, Card, Spin, Input, Select, Button, Modal, Form, message } from 'antd';
import { repositoriesStore } from '../../stores/RepositoriesStore';
import { searchRepositories } from '../../services/api';
import { Repository } from '../../types';
import styles from './RepositoryList.module.css';
import { GithubOutlined, StarOutlined, ForkOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

const RepositoryList: FC = observer(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('javascript');
  const [sort, setSort] = useState('stars');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRepositories = useCallback(async () => {
    if (repositoriesStore.loading || !repositoriesStore.hasMore) return;

    try {
      setError(null);
      repositoriesStore.setLoading(true);
      const response = await searchRepositories(
        searchQuery,
        repositoriesStore.page,
        sort,
        sortDirection
      );

      if (repositoriesStore.page === 1) {
        repositoriesStore.setRepositories(response.items);
      } else {
        repositoriesStore.addRepositories(response.items);
      }

      repositoriesStore.setHasMore(response.items.length === 30);
      repositoriesStore.incrementPage();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      repositoriesStore.setLoading(false);
    }
  }, [searchQuery, sort, sortDirection]);

  useEffect(() => {
    loadRepositories();
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadRepositories();
    }
  }, [loadRepositories]);

  const handleSearch = useCallback(() => {
    repositoriesStore.resetPagination();
    loadRepositories();
  }, [loadRepositories]);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
    repositoriesStore.resetPagination();
    loadRepositories();
  }, [loadRepositories]);

  const handleSortDirectionChange = useCallback(() => {
    const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newDirection);
    repositoriesStore.resetPagination();
    loadRepositories();
  }, [loadRepositories]);

  const handleEdit = (repo: Repository) => {
    setEditingRepo(repo);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Подтверждение удаления',
      content: 'Вы уверены, что хотите удалить этот репозиторий?',
      okText: 'Да',
      cancelText: 'Нет',
      onOk: () => {
        repositoriesStore.deleteRepository(id);
        message.success('Репозиторий успешно удален');
      }
    });
  };

  const handleSave = (values: Partial<Repository>) => {
    if (editingRepo) {
      repositoriesStore.updateRepository(editingRepo.id, values);
      setEditingRepo(null);
      message.success('Репозиторий успешно обновлен');
    }
  };


  const sortOptions = [
    { value: 'stars', label: 'Stars' },
    { value: 'forks', label: 'Forks' },
    { value: 'updated', label: 'Updated' },
  ];

  return (
    <div 
      ref={containerRef} 
      className={styles.container}
      onScroll={handleScroll}
    >
      <div className={styles.controls}>
        <Input.Search
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />
        <div className={styles.sortControls}>
          <Select
            value={sort}
            onChange={handleSortChange}
            options={sortOptions}
            style={{ width: 120 }}
          />
          <Button
            type={sortDirection === 'desc' ? 'primary' : 'default'}
            icon={sortDirection === 'desc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
            onClick={handleSortDirectionChange}
            title={sortDirection === 'desc' ? 'По убыванию' : 'По возрастанию'}
          >
            {sortDirection === 'desc' ? 'По убыванию' : 'По возрастанию'}
          </Button>
        </div>
      </div>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={repositoriesStore.repositories}
        renderItem={(repo) => (
          <List.Item>
            <Card 
              title={
                <div className={styles.cardHeader}>
                  <img 
                    src={repo.owner.avatar_url} 
                    alt={repo.owner.login}
                    className={styles.avatar}
                  />
                  <span>{repo.name}</span>
                </div>
              }
              extra={
                <div className={styles.cardActions}>
                  <Button 
                    type="link" 
                    icon={<GithubOutlined />}
                    href={repo.html_url}
                    target="_blank"
                  >
                    View on GitHub
                  </Button>
                  <Button type="link" onClick={() => handleEdit(repo)}>Edit</Button>
                  <Button type="link" danger onClick={() => handleDelete(repo.id)}>Delete</Button>
                </div>
              }
              className={styles.card}
            >
              <p className={styles.description}>{repo.description}</p>
              <div className={styles.stats}>
                <span>
                  <StarOutlined /> {repo.stargazers_count}
                </span>
                <span>
                  <ForkOutlined /> {repo.forks_count}
                </span>
                <span>
                  Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </span>
                <span>
                  Owner: {repo.owner.login}
                </span>
              </div>
            </Card>
          </List.Item>
        )}
      />
      
      <Modal
        title="Edit Repository"
        open={!!editingRepo}
        onCancel={() => setEditingRepo(null)}
        footer={null}
      >
        {editingRepo && (
          <Form
            initialValues={editingRepo}
            onFinish={handleSave}
            layout="vertical"
          >
            <Form.Item name="name" label="Name">
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {repositoriesStore.loading && (
        <div className={styles.loader}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
});

export default RepositoryList; 