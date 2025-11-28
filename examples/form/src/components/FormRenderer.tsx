'use client';

import { useState, useRef } from 'react';
import { FormDefinition, FormData } from '../types/form';
import { FormCheckbox } from './FormCheckbox';
import { FormInput } from './FormInput';
import { FormToggle } from './FormToggle';

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

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative bg-white shadow-2xl mx-auto"
        style={{
          width: `${page.width}pt`,
          height: `${page.height}pt`,
        }}
      >
        {/* SVG Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${page.width}pt`,
            height: `${page.height}pt`,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/Muster_16.svg"
            alt="Form Background"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>

        {/* Interactive Fields Layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${page.width}pt`,
            height: `${page.height}pt`,
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          {formDefinition.meta.fields.map((field) => {
            const fieldValue = formData[field.name];

            switch (field.type) {
              case 'CHECK_BOX':
                return (
                  <FormCheckbox
                    key={field.name}
                    name={field.name}
                    checked={Boolean(fieldValue)}
                    rect={field.rect}
                    pageHeight={page.height}
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
                    displayValue={field.displayValue || ''}
                    onChange={handleFieldChange}
                    disabled={field.isReadOnly}
                  />
                );

              case 'LABEL':
              case 'DATE_PICKER':
                // Determine if field should be multiline based on field height
                const fieldHeight = field.rect.y2 - field.rect.y1;
                const isMultiline = fieldHeight > 20; // Fields taller than 20pt are multiline

                // Determine text alignment based on field position
                // Fields on the right side of the form (x > 300) are right-aligned
                const textAlign = field.rect.x1 > 300 ? 'right' : 'left';

                return (
                  <FormInput
                    key={field.name}
                    name={field.name}
                    value={String(fieldValue || '')}
                    rect={field.rect}
                    pageHeight={page.height}
                    onChange={handleFieldChange}
                    disabled={field.isReadOnly}
                    multiline={isMultiline}
                    textAlign={textAlign}
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
