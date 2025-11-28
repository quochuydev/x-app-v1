'use client';

import { FieldRect } from '../types/form';

interface FormInputProps {
  name: string;
  value: string;
  rect: FieldRect;
  pageHeight: number;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  textAlign?: 'left' | 'right' | 'center';
}

export function FormInput({
  name,
  value,
  rect,
  pageHeight,
  onChange,
  disabled,
  multiline = false,
  textAlign = 'left',
}: FormInputProps) {
  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;
  // Convert PDF coordinates (bottom-left origin) to CSS coordinates (top-left origin)
  const cssTop = pageHeight - rect.y2;

  const baseStyle = {
    position: 'absolute' as const,
    left: `${rect.x1}pt`,
    top: `${cssTop}pt`,
    width: `${width}pt`,
    height: `${height}pt`,
    border: 'none',
    background: 'transparent',
    padding: '1pt 2pt',
    fontSize: '9pt',
    fontFamily: 'Courier, monospace',
    lineHeight: '1.2',
    overflow: 'hidden',
    color: '#000',
    outline: 'none',
    resize: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    appearance: 'none' as const,
    pointerEvents: (disabled ? 'none' : 'auto') as const,
    zIndex: 20,
    textAlign: textAlign,
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        style={baseStyle}
        spellCheck={false}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      disabled={disabled}
      style={baseStyle}
      spellCheck={false}
      autoComplete="off"
    />
  );
}
