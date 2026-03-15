interface PersonInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  person: PersonInfo;
  type: 'follower' | 'following';
  onUnfollow?: (userId: string) => Promise<void>;
  onRemove?: (userId: string) => Promise<void>;
}

export function FollowItem({ person, type, onUnfollow, onRemove }: Props) {
  const initials = `${person.firstName[0]}${person.lastName[0]}`.toUpperCase();

  return (
    <div className="follow-request-item">
      <div className="avatar">{initials}</div>
      <div className="info">
        <div className="name">{person.firstName} {person.lastName}</div>
        <div className="email">{person.email}</div>
      </div>
      <div className="actions">
        {type === 'following' ? (
          <button className="btn-reject" onClick={() => onUnfollow?.(person.id)}>
            Deixar de seguir
          </button>
        ) : (
          <button className="btn-reject" onClick={() => onRemove?.(person.id)}>
            Remover
          </button>
        )}
      </div>
    </div>
  );
}