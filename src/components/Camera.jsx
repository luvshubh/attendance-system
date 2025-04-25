// src/components/Camera.js
import { useRef, useState } from 'react';

export default function Camera({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, // Front camera
        audio: false,
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    onCapture(imageData); // Send to parent component
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div className="camera-container">
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={stopCamera} disabled={!stream}>Stop Camera</button>
      <button onClick={capturePhoto} disabled={!stream}>Capture Photo</button>
      
      <div className="camera-view">
        <video ref={videoRef} autoPlay playsInline muted className="video-preview" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}