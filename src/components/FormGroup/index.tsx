import type { ReactNode } from 'react';

type FormGroupProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function FormGroup({ label, htmlFor, children }: FormGroupProps) {
  return (
    <div className="form-group">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
