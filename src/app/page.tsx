'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Button } from '@nextui-org/button';

// Define el tipo para una predicción
type Prediction = {
  bbox: [number, number, number, number];
  class: string;
  score: number;
};

const Home = () => {
  const [image, setImage] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<Prediction[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  // Cargar modelo en el cliente
  useEffect(() => {
    const loadModel = async () => {
      if (typeof window !== 'undefined') {
        const model = await cocoSsd.load();
        modelRef.current = model;
      }
    };
    loadModel();
  }, []);

  const detectObjectsInVideo = async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detect = async () => {
      if (!modelRef.current) return;

      const predictions = await modelRef.current.detect(video);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        context.beginPath();
        context.rect(...prediction.bbox);
        context.lineWidth = 2;
        context.strokeStyle = 'red';
        context.fillStyle = 'red';
        context.stroke();
        context.fillText(
          `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
          prediction.bbox[0],
          prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
        );
      });

      requestAnimationFrame(detect);
    };

    detect();
  };

  const startVideo = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
      setIsVideoPlaying(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const detectObjectsInImage = async () => {
    if (!modelRef.current || !image) return;

    const img = new Image();
    img.src = image;

    img.onload = async () => {
      const predictions = await modelRef.current!.detect(img);
      setDetectedObjects(predictions as Prediction[]);
    };
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Fragment>
      <img src='/canva.png' alt='Canva' className='image-canva' />
      <div className='main-div'>
        <h1 className='text-real-time'>Real-time detection or detection by importing image</h1>
        <div className='w-full h-full flex justify-between items-end'>
          <div className='flex flex-col justify-center items-center w-96'>
            <video className='video' ref={videoRef} />
            <canvas className='video' ref={canvasRef} />
            <div className='w-full flex justify-between gap-10'>
              <Button
                color='primary'
                radius='none'
                size='lg'
                variant='ghost'
                onPress={startVideo}
                isDisabled={isVideoPlaying}
              >
                Start Video
              </Button>
              <Button
                color='primary'
                radius='none'
                size='lg'
                variant='ghost'
                onPress={detectObjectsInVideo}
                isDisabled={!isVideoPlaying}
              >
                Start Detection
              </Button>
            </div>
          </div>
          <div className='flex justify-center items-center'>
            <div className='flex flex-col items-center'>
              <Button
                color='primary'
                radius='none'
                size='lg'
                variant='ghost'
                onPress={triggerFileInput}
                className='button-select-image'
              >
                Select Image
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileUpload}
                className='hidden'
              />
              {image && (
                <div className='flex flex-col items-center gap-10'>
                  <img src={image} alt='Uploaded' width='200px' height='200px' className='rounded-3xl' />
                  <Button onPress={detectObjectsInImage} className='button-detect-image'>
                    Detect Object
                  </Button>
                  <div className='div-object-detection-image'>
                    {detectedObjects.map((obj, index) => (
                      <p key={index}>
                        {obj.class} ({Math.round(obj.score * 100)}%)
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
