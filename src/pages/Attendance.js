// src/pages/Attendance.js
import { useState } from 'react';
import Camera from '../components/Camera';
import axios from 'axios';

export default function Attendance() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (imageData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/recognize', {
        image: imageData,
      });
      setResult(response.data.recognized_faces);
    } catch (error) {
      console.error("Recognition error:", error);
      setResult(["Error recognizing faces"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <h1>Face Recognition Attendance</h1>
      <Camera onCapture={handleCapture} />
      
      {loading && <p>Processing...</p>}
      
      {result && (
        <div className="results">
          <h3>Recognized Students:</h3>
          <ul>
            {result.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}