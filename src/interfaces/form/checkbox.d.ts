import { Size } from '../ui/general';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  message?: string;
  isInvalid?: boolean;
  checkboxPosition?: 'left' | 'right';
  size?: Size;
}