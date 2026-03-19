import { useState, useEffect, useCallback } from "react";
import { commentService } from "../../services/api";
import type { PlaylistCommentWithUser } from "../../types/comment";
import { CommentItem } from "../CommentItem";

type CommentsSectionProps = {
  playlistId: string;
  currentUserId: string | undefined;
};

export function CommentsSection({
  playlistId,
  currentUserId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<PlaylistCommentWithUser[]>([]);
  const [meta, setMeta] = useState<{ total: number; totalPages: number }>({
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commentService.getByPlaylistId(playlistId, {
        page: 1,
        size: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setComments(result.data);
      setMeta(result.meta);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar os comentários.");
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newContent.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await commentService.create(playlistId, { content: trimmed });
      setNewContent("");
      await loadComments();
    } catch (e) {
      console.error(e);
      setError("Não foi possível publicar o comentário.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(commentId: string, content: string) {
    await commentService.update(commentId, { content });
    await loadComments();
  }

  async function handleDelete(commentId: string) {
    await commentService.delete(commentId);
    await loadComments();
  }

  return (
    <section className="comments-section">
      <h2 className="comments-section-title">
        Comentários {meta.total > 0 && `(${meta.total})`}
      </h2>

      {currentUserId && (
        <form onSubmit={handleCreate} className="comment-form">
          {error && <div className="comment-form-error">{error}</div>}
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Escreva um comentário..."
            className="comment-form-input"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="comment-form-submit"
            disabled={isSubmitting || !newContent.trim()}
          >
            {isSubmitting ? "Publicando..." : "Comentar"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="comments-loading">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="comments-empty">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
