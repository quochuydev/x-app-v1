'use client';

import { FieldRect } from '../types/form';

interface FormLabelProps {
  name: string;
  value: string;
  rect: FieldRect;
  pageHeight: number;
  scale: number;
}

export function FormLabel({ name, value, rect, pageHeight, scale }: FormLabelProps) {
  const width = (rect.x2 - rect.x1) * scale;
  const height = (rect.y2 - rect.y1) * scale;
  const cssTop = (pageHeight - rect.y2) * scale;

  const getFontSize = (name: string) => {
    switch (name) {
      case 'label_medication1':
      case 'label_medication2':
      case 'label_medication3':
        return 28;
      case 'label_doctor_stamp':
        return 16;
      default:
        return 23;
    }
  };

  const getTextAlign = (name: string): 'left' | 'right' | 'center' => {
    switch (name) {
      default:
        return 'left';
    }
  };

  const textAlign = getTextAlign(name);
  const baseFontSize = getFontSize(name);

  const baseStyle = {
    position: 'absolute' as const,
    left: rect.x1 * scale,
    top: cssTop,
    width,
    height,
    border: 'none',
    background: 'transparent',
    fontSize: baseFontSize,
    padding: 0,
    lineHeight: 1,
    fontFamily: 'Courier New',
    overflow: 'hidden',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#000',
    outline: 'none',
    resize: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    appearance: 'none' as const,
    zIndex: 20,
    textAlign: textAlign,
    whiteSpace: 'pre-wrap',
  };

  return (
    <div
      data-testid-name={name}
      data-testid-x1={rect.x1}
      data-testid-y1={rect.y1}
      data-testid-x2={rect.x2}
      data-testid-y2={rect.y2}
      style={baseStyle}
      spellCheck={false}
    >
      {value}
    </div>
  );
}
