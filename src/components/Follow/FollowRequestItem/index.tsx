import type { FollowRequestDto } from "../../../types/follow";
import "./style.css";

interface Props {
  request: FollowRequestDto;
  type: 'received' | 'sent';
  onAccept?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

export function FollowRequestItem({ request, type, onAccept, onReject, onCancel }: Props) {
  const person = type === 'received' ? request.follower : request.followed;
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();

  return (
    <div className="follow-request-item">
      <div className="avatar">{initials}</div>
      <div className="info">
        <div className="name">{person.firstName} {person.lastName}</div>
        <div className="email">{person.email}</div>
      </div>
      <div className="actions">
        {type === 'received' ? (
          <>
            <button className="btn-accept" onClick={() => onAccept?.(request.id)}>
              Aceitar
            </button>
            <button className="btn-reject" onClick={() => onReject?.(request.id)}>
              Recusar
            </button>
          </>
        ) : (
          <button className="btn-pending" onClick={() => onCancel?.(request.id)}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}