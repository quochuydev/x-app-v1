import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Post, ApiResponse } from '@/types';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.get<ApiResponse<Post[]>>('/posts'),
  });
}
