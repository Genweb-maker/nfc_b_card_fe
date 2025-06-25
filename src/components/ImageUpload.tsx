'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { showToast } from './Toast';
import { apiRequest } from '../lib/api';

interface ImageUploadProps {
    currentImage?: string;
    onImageChange: (imageUrl: string) => void;
    className?: string;
}

const ImageUpload = ({ currentImage, onImageChange, className = "" }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simple client-side image upload to base64 (free alternative to Cloudinary)
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB', 'error');
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;

            // Create an image to resize it
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions (max 400x400)
                const maxSize = 400;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress the image
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                setPreview(compressedDataUrl);
                onImageChange(compressedDataUrl);
                setIsUploading(false);
                showToast('Image uploaded successfully!', 'success');
            };

            img.src = result;
        };

        reader.onerror = () => {
            setIsUploading(false);
            showToast('Failed to read image file', 'error');
        };

        reader.readAsDataURL(file);
    };

    const handleCameraCapture = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        showToast('Image removed', 'info');
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col items-center space-y-4">
                {/* Image Preview */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Remove button */}
                    {preview && (
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            aria-label="Remove image"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Upload Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={handleCameraCapture}
                        disabled={isUploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Camera size={16} />
                                <span>Upload Photo</span>
                            </>
                        )}
                    </button>
                </div>

                {/* File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    capture="environment" // For mobile camera
                />

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center max-w-xs">
                    Upload a profile photo. Max size 5MB. Recommended: Square image, at least 200x200px.
                </p>
            </div>
        </div>
    );
};

export default ImageUpload; 