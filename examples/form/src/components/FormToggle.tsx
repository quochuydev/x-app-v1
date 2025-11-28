'use client';

import { FieldRect } from '../types/form';

interface FormToggleProps {
  name: string;
  checked: boolean;
  rect: FieldRect;
  pageHeight: number;
  displayValue: string;
  onChange: (name: string, checked: boolean) => void;
  disabled?: boolean;
}

export function FormToggle({
  name,
  checked,
  rect,
  pageHeight,
  displayValue,
  onChange,
  disabled,
}: FormToggleProps) {
  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;
  // Convert PDF coordinates (bottom-left origin) to CSS coordinates (top-left origin)
  const cssTop = pageHeight - rect.y2;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${rect.x1}pt`,
        top: `${cssTop}pt`,
        width: `${width}pt`,
        height: `${height}pt`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        border: '1.5pt solid #dc2626',
        background: 'transparent',
        pointerEvents: disabled ? 'none' : 'auto',
        zIndex: 20,
        userSelect: 'none',
      }}
      onClick={() => !disabled && onChange(name, !checked)}
    >
      {checked && (
        <span
          style={{
            fontSize: '11pt',
            fontWeight: 'bold',
            color: '#000',
          }}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}
