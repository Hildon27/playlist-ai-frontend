export interface PlaylistCommentUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface PlaylistCommentWithUser {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  playlistId: string;
  userId: string;
  user: PlaylistCommentUser;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsPaginatedResponse {
  data: PlaylistCommentWithUser[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
