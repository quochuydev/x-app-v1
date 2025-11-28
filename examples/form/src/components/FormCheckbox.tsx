'use client';

import { FieldRect } from '../types/form';

interface FormCheckboxProps {
  name: string;
  checked: boolean;
  rect: FieldRect;
  pageHeight: number;
  scale: number;
  onChange: (name: string, checked: boolean) => void;
  disabled?: boolean;
}

export function FormCheckbox({
  name,
  checked,
  rect,
  pageHeight,
  scale,
  onChange,
  disabled,
}: FormCheckboxProps) {
  const width = (rect.x2 - rect.x1) * scale;
  const height = (rect.y2 - rect.y1) * scale;
  const cssTop = (pageHeight - rect.y2) * scale;

  return (
    <div
      onClick={() => !disabled && onChange(name, !checked)}
      style={{
        position: 'absolute',
        left: `${rect.x1 * scale}px`,
        top: `${cssTop}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: disabled ? 'default' : 'pointer',
        pointerEvents: disabled ? 'none' : 'auto',
        zIndex: 20,
      }}
    >
      {checked && (
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>
          <line
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            stroke="#000"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="90"
            y1="10"
            x2="10"
            y2="90"
            stroke="#000"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
