import React, { useRef, useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { CameraAlt, Replay, VideocamOff } from '@mui/icons-material';

const WebcamCapture = ({ onCapture, initialImage = null }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [imgSrc, setImgSrc] = useState(initialImage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Start Webcam
    const startCamera = async () => {
        setLoading(true);
        setError(null);
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: false
            });
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(err => console.error("Video play error: ", err));
            }
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            setError("Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.");
        } finally {
            setLoading(false);
        }
    };

    // Stop Webcam
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (!imgSrc) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [imgSrc]);

    // Capture Photo
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            // Set canvas dimensions to match video stream
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            
            // Draw current video frame onto canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get base64 data URL
            const base64Image = canvas.toDataURL('image/jpeg', 0.85);
            setImgSrc(base64Image);
            stopCamera();
            if (onCapture) {
                onCapture(base64Image);
            }
        }
    };

    // Retake Photo
    const handleRetake = () => {
        setImgSrc(null);
        if (onCapture) {
            onCapture(null);
        }
    };

    return (
        <Box className="flex flex-col items-center justify-center w-full">
            {/* Canvas hidden from view */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <Box className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-gray-950 flex items-center justify-center shadow-sm">
                {loading && (
                    <Box className="flex flex-col items-center gap-2 text-white">
                        <CircularProgress color="inherit" size={40} />
                        <Typography variant="body2">Đang khởi động camera...</Typography>
                    </Box>
                )}

                {error && (
                    <Box className="p-4 text-center text-red-400 flex flex-col items-center gap-2">
                        <VideocamOff sx={{ fontSize: 48 }} />
                        <Typography variant="body2" className="font-semibold">{error}</Typography>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            size="small" 
                            onClick={startCamera} 
                            className="mt-2 text-white border-white hover:bg-white/10"
                        >
                            Thử lại
                        </Button>
                    </Box>
                )}

                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover scale-x-[-1] ${(loading || error || imgSrc) ? 'hidden' : ''}`} // mirror effect
                />

                {imgSrc && (
                    <img 
                        src={imgSrc} 
                        alt="Check-in Snapshot" 
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Overlaid capturing controls */}
                {!loading && !error && (
                    <Box className="absolute bottom-4 left-0 right-0 flex justify-center">
                        {!imgSrc ? (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<CameraAlt />}
                                onClick={handleCapture}
                                className="bg-primary hover:bg-primary/95 text-white font-semibold rounded-full px-6 py-2 shadow-lg transition duration-200"
                            >
                                Chụp ảnh
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<Replay />}
                                onClick={handleRetake}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full px-6 py-2 shadow-lg transition duration-200"
                            >
                                Chụp lại
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default WebcamCapture;
