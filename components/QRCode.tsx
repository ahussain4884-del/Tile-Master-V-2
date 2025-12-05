
import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ value, size = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
        QRCodeLib.toCanvas(canvasRef.current, value, { width: size, margin: 1 }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [value, size]);

  return <canvas ref={canvasRef} />;
};

export default QRCode;
