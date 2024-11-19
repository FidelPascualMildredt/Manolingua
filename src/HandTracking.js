import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as cam from '@mediapipe/camera_utils';
import * as hands from '@mediapipe/hands';
import * as draw from '@mediapipe/drawing_utils';
import axios from 'axios';

const HandTracking = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sign, setSign] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false); // Estado para controlar si la cámara está activa
  let camera;
  let handModel;

  useEffect(() => {
    handModel = new hands.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handModel.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    handModel.onResults(onResults);

    if (videoRef.current) {
      camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          if (isCameraActive) {
            try {
              await handModel.send({ image: videoRef.current });
            } catch (error) {
              console.error('Error while sending hand model image:', error);
            }
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setIsCameraActive(true); // Se marca la cámara como activa
    }

    return () => stopCamera();
  }, [isCameraActive]); // Dependencia en isCameraActive para re-evaluar al cambiar

  // Función para detener la cámara y liberar recursos
  const stopCamera = () => {
    if (camera) {
      camera.stop();
      console.log('Cámara detenida');
    }
    if (handModel) {
      handModel.close();
      console.log('Modelo de manos detenido');
    }
    setIsCameraActive(false); // Cambiar el estado para indicar que la cámara está inactiva
  };

  // Exponer la función stopCamera a través de ref
  useImperativeHandle(ref, () => ({
    stopCamera,
  }));

  async function onResults(results) {
    if (!canvasRef.current || !isCameraActive) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Solo dibujar y enviar al backend si se detectan manos
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        draw.drawConnectors(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        draw.drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
      }
      const imageSrc = canvasRef.current.toDataURL('image/jpeg');
      await sendImageToBackend(imageSrc);
    } else {
      console.log('No se detectaron manos.');
    }
  }

  // Función para enviar la imagen al backend
  async function sendImageToBackend(imageSrc) {
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', {
        image: imageSrc,
      });
      if (response.data && response.data.sign) {
        setSign(response.data.sign);
        console.log('Predicción recibida:', response.data.sign);
      } else {
        console.error('No se recibió predicción del backend');
      }
    } catch (error) {
      console.error('Error al enviar la imagen:', error);
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>
        <video ref={videoRef} style={{ display: 'none' }} />
        {isCameraActive ? (
          <canvas ref={canvasRef} width={640} height={480} />
        ) : (
          <p>Cargando cámara...</p>
        )}
      </div>
      <div style={{ marginLeft: '20px', fontSize: '24px', color: 'red' }}>
        {sign ? `Letra: ${sign}` : 'Esperando predicción...'}
      </div>
    </div>
  );
});

export default HandTracking;
