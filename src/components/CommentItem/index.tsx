import { useState } from 'react';
import { formatDateLong } from '../../utils/date';
import type { PlaylistCommentWithUser } from '../../types/comment';

type CommentItemProps = {
  comment: PlaylistCommentWithUser;
  currentUserId: string | undefined;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

export function CommentItem({ comment, currentUserId, onUpdate, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = currentUserId !== undefined && comment.userId === currentUserId;

  async function handleSave() {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpdate(comment.id, trimmed);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setEditContent(comment.content);
    setIsEditing(false);
  }

  async function handleDeleteClick() {
    if (!confirm('Excluir este comentário?')) return;
    try {
      await onDelete(comment.id);
    } catch (e) {
      console.error(e);
    }
  }

  const authorName = `${comment.user.firstName} ${comment.user.lastName}`.trim() || 'Usuário';

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{authorName}</span>
        <span className="comment-date">{formatDateLong(comment.createdAt)}</span>
        {isOwner && !isEditing && (
          <div className="comment-actions">
            <button
              type="button"
              className="comment-action-btn"
              onClick={() => setIsEditing(true)}
              aria-label="Editar"
            >
              Editar
            </button>
            <button
              type="button"
              className="comment-action-btn comment-action-delete"
              onClick={handleDeleteClick}
              aria-label="Excluir"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="comment-edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="comment-edit-input"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="comment-edit-actions">
            <button
              type="button"
              className="comment-edit-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="comment-edit-save"
              onClick={handleSave}
              disabled={isSubmitting || !editContent.trim()}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}
    </div>
  );
}
