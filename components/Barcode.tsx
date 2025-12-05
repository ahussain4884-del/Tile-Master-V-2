
import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

const Barcode: React.FC<BarcodeProps> = ({ value, format = 'CODE128', width = 2, height = 100, displayValue = true, fontSize = 20, margin = 10 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: format as any,
          width,
          height,
          displayValue,
          fontSize,
          margin
        });
      } catch (e) {
        console.error("Barcode rendering error", e);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, margin]);

  return <canvas ref={canvasRef} />;
};

export default Barcode;
