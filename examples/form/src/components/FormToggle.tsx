'use client';

import { FieldRect } from '../types/form';

interface FormToggleProps {
  name: string;
  checked: boolean;
  rect: FieldRect;
  pageHeight: number;
  scale: number;
  displayValue: string;
  onChange: (name: string, checked: boolean) => void;
  disabled?: boolean;
}

export function FormToggle({
  name,
  checked,
  rect,
  pageHeight,
  scale,
  displayValue,
  onChange,
  disabled,
}: FormToggleProps) {
  const width = (rect.x2 - rect.x1) * scale;
  const height = (rect.y2 - rect.y1) * scale;
  // Convert PDF coordinates (bottom-left origin) to CSS coordinates (top-left origin)
  const cssTop = (pageHeight - rect.y2) * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${rect.x1 * scale}px`,
        top: `${cssTop}px`,
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
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
            fontSize: `${11 * scale}px`,
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
