'use client';

import { useState, useRef } from 'react';
import { FormDefinition, FormData } from '../types/form';
import { FormCheckbox } from './FormCheckbox';
import { FormInput } from './FormInput';
import { FormToggle } from './FormToggle';
import { FormLabel } from './FormLabel';

interface FormRendererProps {
  formDefinition: FormDefinition;
  initialData: FormData;
  onPrint?: () => void;
}

export function FormRenderer({ formDefinition, initialData, onPrint }: FormRendererProps) {
  const [formData, setFormData] = useState<FormData>(initialData);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFieldChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const page = formDefinition.formPages[0];

  // Calculate scale factor to convert form coordinates to display pixels
  // The form definition uses PDF points, we need to scale to a reasonable display size
  const formWidth = page.width; // Original form width in PDF points (419.528)
  const formHeight = page.height; // Original form height in PDF points (297.638)

  // Target display width - use a percentage-based approach for responsiveness
  // You can adjust maxWidth as needed (e.g., 800, 1000, 1200)
  const maxDisplayWidth = 1200;
  const scale = maxDisplayWidth / formWidth;

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="bg-white">
        <div
          style={{
            position: 'relative',
            pointerEvents: 'auto',
            zIndex: 10,
            maxWidth: maxDisplayWidth,
            width: '100%',
            height: formHeight * scale,
          }}
        >
          <img
            src="/Muster_16.svg"
            alt="Form Background"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />

          {formDefinition.meta.fields.map((field) => {
            const fieldValue = formData[field.name];
            const fieldHeight = field.rect.y2 - field.rect.y1;
            const isMultiline = fieldHeight > 20;

            switch (field.type) {
              case 'CHECK_BOX':
                return (
                  <FormCheckbox
                    key={field.name}
                    name={field.name}
                    checked={Boolean(fieldValue)}
                    rect={field.rect}
                    pageHeight={page.height}
                    scale={scale}
                    onChange={handleFieldChange}
                    disabled={field.isReadOnly}
                  />
                );

              case 'TOGGLE_NUMBER':
                return (
                  <FormToggle
                    key={field.name}
                    name={field.name}
                    checked={Boolean(fieldValue)}
                    rect={field.rect}
                    pageHeight={page.height}
                    scale={scale}
                    displayValue={field.displayValue || ''}
                    onChange={handleFieldChange}
                    disabled={field.isReadOnly}
                  />
                );

              case 'DATE_PICKER':
                return (
                  <FormInput
                    key={field.name}
                    name={field.name}
                    value={String(fieldValue || '')}
                    rect={field.rect}
                    pageHeight={page.height}
                    scale={scale}
                    onChange={handleFieldChange}
                    disabled={field.isReadOnly}
                    multiline={isMultiline}
                  />
                );

              case 'LABEL':
                return (
                  <FormLabel
                    key={field.name}
                    name={field.name}
                    value={String(fieldValue || '')}
                    rect={field.rect}
                    pageHeight={page.height}
                    scale={scale}
                  />
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Form Data Debug Panel (removable in production) */}
      <details className="bg-gray-50 p-4 rounded-lg">
        <summary className="cursor-pointer font-semibold">Debug: Form Data</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-96">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
