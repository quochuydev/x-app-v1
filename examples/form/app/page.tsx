'use client';

import { useEffect, useState } from 'react';
import { FormRenderer } from '../src/components/FormRenderer';
import { FormDefinition, FormData } from '../src/types/form';
import { qzTrayPrinter } from '../src/utils/qzTrayPrint';

export default function Home() {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadPrinters();
  }, []);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [defResponse, dataResponse] = await Promise.all([
        fetch('/Muster_16.json'),
        fetch('/example-data.json'),
      ]);

      if (!defResponse.ok || !dataResponse.ok) {
        throw new Error('Failed to load form data');
      }

      const definition = await defResponse.json();
      const data = await dataResponse.json();

      setFormDefinition(definition);
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form data');
      console.error('Error loading form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrinters = async () => {
    try {
      await qzTrayPrinter.connect();
      const printerList = await qzTrayPrinter.getPrinters();
      const printerNames = printerList.map((p) => p.name);
      setPrinters(printerNames);

      const defaultPrinter = await qzTrayPrinter.getDefaultPrinter();
      if (defaultPrinter) {
        setSelectedPrinter(defaultPrinter);
      }
    } catch (err) {
      console.error('Failed to load printers:', err);
      // Don't set error state, printing will still work with browser print
    }
  };

  const handlePrint = async () => {
    if (!formDefinition) return;

    setIsPrinting(true);
    try {
      if (qzTrayPrinter.isQZTrayConnected() && selectedPrinter) {
        // Print via QZ Tray
        await qzTrayPrinter.printPDF('/Muster_16.pdf', selectedPrinter, {
          copies: 1,
          orientation: 'landscape',
        });
        alert('Print job sent successfully via QZ Tray!');
      } else {
        // Fallback to browser print
        window.print();
      }
    } catch (err) {
      console.error('Print failed:', err);
      alert(`Print failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Form</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!formDefinition || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">No form data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Printer Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Muster 16 - Prescription Form</h1>
              <p className="text-sm text-gray-500 mt-1">
                Patient: {formData.label_patient_fullname || 'N/A'} | DOB:{' '}
                {formData.label_date_of_birth || 'N/A'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {printers.length > 0 && (
                <select
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Printer</option>
                  {printers.map((printer) => (
                    <option key={printer} value={printer}>
                      {printer}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isPrinting ? 'Printing...' : 'Print Form'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Renderer */}
        <FormRenderer
          formDefinition={formDefinition}
          initialData={formData}
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
}
