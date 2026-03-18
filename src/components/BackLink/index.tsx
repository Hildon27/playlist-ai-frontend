import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BackLinkProps = {
  to?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export function BackLink({ to = '/', onClick, className = 'back-link', children = '← Voltar' }: BackLinkProps) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
