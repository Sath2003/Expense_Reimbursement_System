'use client';

import { useState, useRef, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0);

    // Convert canvas to blob and create file
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File(
          [blob],
          `expense_photo_${Date.now()}.png`,
          { type: 'image/png' }
        );
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, 'image/png');
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
          <h2 className="text-xl font-bold">Capture Expense Receipt</h2>
          <p className="text-slate-700 text-sm">Take a photo of your receipt</p>
        </div>

        {/* Camera View */}
        <div className="relative bg-black p-4">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {cameraActive && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
          )}

          {!cameraActive && !error && (
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Starting camera...</p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={capturePhoto}
              disabled={!cameraActive}
              className={`py-3 rounded-lg font-semibold transition ${
                cameraActive
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              📸 Capture
            </button>

            <button
              onClick={toggleCamera}
              disabled={!cameraActive}
              className={`py-3 rounded-lg font-semibold transition ${
                cameraActive
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              🔄 Flip Camera
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          {/* Camera Tips */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Tip:</span> Make sure the receipt is well-lit and clearly visible for better accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
