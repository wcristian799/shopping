// src/types/react-native-pdf-lib.d.ts
declare module 'react-native-pdf-lib' {
  export interface PDFDocumentOptions {
    width?: number;
    height?: number;
  }

  export interface DrawTextOptions {
    x: number;
    y: number;
    color?: { r: number; g: number; b: number };
    fontSize?: number;
    fontName?: string;
  }

  export interface DrawLineOptions {
    start: { x: number; y: number };
    end: { x: number; y: number };
    color?: { r: number; g: number; b: number };
    thickness?: number;
  }

  export interface DrawRectangleOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    color?: { r: number; g: number; b: number };
  }

  export interface DrawImageOptions {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface PDFPage {
    setMediaBox: (width: number, height: number) => PDFPage;
    drawText: (text: string, options: DrawTextOptions) => PDFPage;
    drawLine: (options: DrawLineOptions) => PDFPage;
    drawRectangle: (options: DrawRectangleOptions) => PDFPage;
    drawImage: (base64Image: string, options: DrawImageOptions) => PDFPage;
  }

  export const PDFDocument: {
    create: (path: string, pages: PDFPage[]) => Promise<string>;
    pages: PDFPage[];
  };

  export const StandardFonts: {
    Helvetica: string;
    HelveticaBold: string;
    HelveticaOblique: string;
    HelveticaBoldOblique: string;
    Courier: string;
    CourierBold: string;
    CourierOblique: string;
    CourierBoldOblique: string;
    TimesRoman: string;
    TimesRomanBold: string;
    TimesRomanItalic: string;
    TimesRomanBoldItalic: string;
    Symbol: string;
    ZapfDingbats: string;
  };
}