import qz from 'qz-tray';

export interface PrinterInfo {
  name: string;
  driver?: string;
}

export class QZTrayPrinter {
  private static instance: QZTrayPrinter;
  private isConnected = false;

  private constructor() {}

  static getInstance(): QZTrayPrinter {
    if (!QZTrayPrinter.instance) {
      QZTrayPrinter.instance = new QZTrayPrinter();
    }
    return QZTrayPrinter.instance;
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await qz.websocket.connect();
        this.isConnected = true;
        console.log('QZ Tray connected successfully');
      }
    } catch (error) {
      console.error('Failed to connect to QZ Tray:', error);
      throw new Error(
        'QZ Tray connection failed. Please ensure QZ Tray is installed and running.'
      );
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await qz.websocket.disconnect();
        this.isConnected = false;
        console.log('QZ Tray disconnected');
      }
    } catch (error) {
      console.error('Failed to disconnect from QZ Tray:', error);
    }
  }

  async getPrinters(): Promise<PrinterInfo[]> {
    try {
      await this.connect();
      const printers = await qz.printers.find();
      return printers.map((name: string) => ({ name }));
    } catch (error) {
      console.error('Failed to get printers:', error);
      throw error;
    }
  }

  async getDefaultPrinter(): Promise<string | null> {
    try {
      await this.connect();
      const defaultPrinter = await qz.printers.getDefault();
      return defaultPrinter;
    } catch (error) {
      console.error('Failed to get default printer:', error);
      return null;
    }
  }

  async printHTML(
    htmlContent: string,
    printerName?: string,
    options?: {
      copies?: number;
      orientation?: 'portrait' | 'landscape';
      margins?: { top?: number; right?: number; bottom?: number; left?: number };
    }
  ): Promise<void> {
    try {
      await this.connect();

      const printer = printerName || (await this.getDefaultPrinter());
      if (!printer) {
        throw new Error('No printer available');
      }

      const config = qz.configs.create(printer, {
        copies: options?.copies || 1,
        orientation: options?.orientation || 'portrait',
        margins: options?.margins || { top: 0, right: 0, bottom: 0, left: 0 },
      });

      const data = [
        {
          type: 'html',
          format: 'plain',
          data: htmlContent,
        },
      ];

      await qz.print(config, data);
      console.log('Print job sent successfully');
    } catch (error) {
      console.error('Failed to print:', error);
      throw error;
    }
  }

  async printPDF(
    pdfUrl: string,
    printerName?: string,
    options?: {
      copies?: number;
      orientation?: 'portrait' | 'landscape';
    }
  ): Promise<void> {
    try {
      await this.connect();

      const printer = printerName || (await this.getDefaultPrinter());
      if (!printer) {
        throw new Error('No printer available');
      }

      const config = qz.configs.create(printer, {
        copies: options?.copies || 1,
        orientation: options?.orientation || 'portrait',
      });

      const data = [
        {
          type: 'pdf',
          data: pdfUrl,
        },
      ];

      await qz.print(config, data);
      console.log('PDF print job sent successfully');
    } catch (error) {
      console.error('Failed to print PDF:', error);
      throw error;
    }
  }

  isQZTrayConnected(): boolean {
    return this.isConnected;
  }
}

export const qzTrayPrinter = QZTrayPrinter.getInstance();
