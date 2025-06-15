'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import { getUserProfile, addConnection } from '../lib/api';
import { showToast } from './Toast';
import { 
  Smartphone, 
  QrCode, 
  Camera, 
  Download, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  MapPin,
  Loader2
} from 'lucide-react';

// Set QR Scanner worker path
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js';

// Check if QR scanner has camera support
const hasCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
};

// Geolocation interface
interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
}

// OpenStreetMap reverse geocoding function
const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BusinessCardApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

// Get current location
const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            address,
            accuracy
          });
        } catch (error) {
          // If reverse geocoding fails, still return coordinates
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            accuracy
          });
        }
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export default function SharePage() {
  const [activeTab, setActiveTab] = useState<'nfc' | 'qr'>('nfc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    loadProfile();
    checkNFCSupport();
    checkCameraAvailability();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const checkCameraAvailability = async () => {
    const isAvailable = await hasCamera();
    setCameraAvailable(isAvailable);
  };

  const loadProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success && response.user) {
        setProfile(response.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Please create your profile first', 'warning');
    }
  };

  const checkNFCSupport = () => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  };

  const generateQRCode = async () => {
    if (!profile) {
      showToast('Please create your profile first', 'warning');
      return;
    }

    setIsGeneratingQR(true);
    setIsCapturingLocation(true);
    
    try {
      // Automatically capture location
      const locationData = await getCurrentLocation();
      
      const profileData = {
        type: 'profile',
        data: profile,
        location: locationData,
        timestamp: Date.now()
      };

      const qrData = JSON.stringify(profileData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(qrCodeDataUrl);
      showToast(`QR code generated with location: ${locationData.address}`, 'success');
    } catch (locationError: any) {
      console.warn('Location capture failed, generating QR without location:', locationError);
      
      // Generate QR code without location if location fails
      try {
        const profileData = {
          type: 'profile',
          data: profile,
          location: null,
          timestamp: Date.now()
        };

        const qrData = JSON.stringify(profileData);
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(qrCodeDataUrl);
        showToast('QR code generated (location unavailable)', 'warning');
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
        showToast('Failed to generate QR code', 'error');
      }
    } finally {
      setIsGeneratingQR(false);
      setIsCapturingLocation(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'business-card-qr.png';
    link.href = qrCodeUrl;
    link.click();
  };

  const startNFCShare = async () => {
    if (!nfcSupported) {
      showToast('NFC is not supported on this device', 'error');
      return;
    }

    if (!profile) {
      showToast('Please create your profile first', 'warning');
      return;
    }

    setIsCapturingLocation(true);

    try {
      // Automatically capture location
      const locationData = await getCurrentLocation();
      
      const ndef = new (window as any).NDEFReader();
      
      const profileData = {
        type: 'profile',
        data: profile,
        location: locationData,
        timestamp: Date.now()
      };

      await ndef.write({
        records: [{
          recordType: "text",
          data: JSON.stringify(profileData)
        }]
      });

      setNfcEnabled(true);
      showToast(`NFC sharing enabled with location: ${locationData.address}`, 'success');
    } catch (locationError: any) {
      console.warn('Location capture failed, enabling NFC without location:', locationError);
      
      // Enable NFC without location if location fails
      try {
        const ndef = new (window as any).NDEFReader();
        
        const profileData = {
          type: 'profile',
          data: profile,
          location: null,
          timestamp: Date.now()
        };

        await ndef.write({
          records: [{
            recordType: "text",
            data: JSON.stringify(profileData)
          }]
        });

        setNfcEnabled(true);
        showToast('NFC sharing enabled (location unavailable)', 'warning');
      } catch (nfcError: any) {
        console.error('NFC write failed:', nfcError);
        if (nfcError.name === 'NotAllowedError') {
          showToast('NFC permission denied', 'error');
        } else if (nfcError.name === 'NotSupportedError') {
          showToast('NFC is not supported', 'error');
        } else {
          showToast('Failed to enable NFC sharing', 'error');
        }
      }
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const readNFCTag = async () => {
    if (!nfcSupported) {
      showToast('NFC is not supported on this device', 'error');
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      await ndef.scan();
      showToast('Ready to read NFC tags. Bring an NFC tag close to your device.', 'info');

      ndef.addEventListener('reading', ({ message }: any) => {
        for (const record of message.records) {
          if (record.recordType === 'text') {
            try {
              const textDecoder = new TextDecoder(record.encoding);
              const data = textDecoder.decode(record.data);
              const profileData = JSON.parse(data);
              
              if (profileData.type === 'profile') {
                handleReceivedProfile(profileData.data, 'nfc', profileData.location);
              }
            } catch (error) {
              console.error('Failed to parse NFC data:', error);
            }
          }
        }
      });
    } catch (error: any) {
      console.error('NFC read failed:', error);
      showToast('Failed to read NFC tag', 'error');
    }
  };

  const startQRScanner = async () => {
    console.log('Starting QR scanner...');
    
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported');
        showToast('Camera is not supported on this device', 'error');
        return;
      }

      // Check if running in secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        console.error('Not a secure context - camera access requires HTTPS');
        showToast('Camera access requires HTTPS or localhost', 'error');
        return;
      }

      setShowScanner(true);
      setScanning(true);
      console.log('Scanner modal opened');

      // Wait for the video element to be available
      setTimeout(async () => {
        if (!videoRef.current) {
          console.error('Video element not found');
          showToast('Camera element not ready', 'error');
          setScanning(false);
          setShowScanner(false);
          return;
        }

        console.log('Video element found, initializing QR scanner...');

        try {
          console.log('Initializing QR scanner...');
          const scanner = new QrScanner(
            videoRef.current,
            (result) => {
              console.log('QR code detected:', result.data);
              try {
                const profileData = JSON.parse(result.data);
                if (profileData.type === 'profile') {
                  console.log('Valid profile QR code');
                  handleReceivedProfile(profileData.data, 'qr', profileData.location);
                  stopQRScanner();
                } else {
                  console.log('Invalid QR code format - not a profile');
                  showToast('Not a valid business card QR code', 'warning');
                }
              } catch (error) {
                console.error('Failed to parse QR data:', error);
                showToast('Invalid QR code format', 'error');
              }
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              preferredCamera: 'environment',
              maxScansPerSecond: 5,
            }
          );

          scannerRef.current = scanner;
          console.log('Starting QR scanner...');
          await scanner.start();
          console.log('QR scanner started successfully');
          showToast('QR scanner started. Point camera at QR code.', 'info');
        } catch (cameraError: any) {
          console.error('Camera access failed:', cameraError);
          setScanning(false);
          setShowScanner(false);
          
          if (cameraError.name === 'NotAllowedError') {
            showToast('Camera permission denied. Please allow camera access.', 'error');
          } else if (cameraError.name === 'NotFoundError') {
            showToast('No camera found on this device', 'error');
          } else if (cameraError.name === 'NotReadableError') {
            showToast('Camera is already in use by another application', 'error');
          } else if (cameraError.name === 'NotSupportedError') {
            showToast('Camera not supported on this device', 'error');
          } else {
            showToast(`Camera error: ${cameraError.message || 'Unknown error'}`, 'error');
          }
        }
      }, 100);
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      showToast('Failed to start QR scanner', 'error');
      setScanning(false);
      setShowScanner(false);
    }
  };

  const stopQRScanner = () => {
    try {
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      
      // Stop any video streams
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      setShowScanner(false);
      setScanning(false);
      showToast('QR scanner stopped', 'info');
    } catch (error) {
      console.error('Error stopping QR scanner:', error);
      setShowScanner(false);
      setScanning(false);
    }
  };

  const handleReceivedProfile = async (receivedProfile: any, method: 'nfc' | 'qr', receivedLocation?: LocationData) => {
    try {
      const connectionData = {
        profileData: receivedProfile,
        method: method,
        location: receivedLocation || null,
        timestamp: Date.now()
      };

      const response = await addConnection(connectionData);
      if (response.success) {
        const locationText = receivedLocation ? ` at ${receivedLocation.address}` : '';
        showToast(`Profile received via ${method.toUpperCase()}${locationText}!`, 'success');
      }
    } catch (error) {
      console.error('Failed to save connection:', error);
      showToast('Failed to save received profile', 'error');
    }
  };

  // Function to get the main icon based on state
  const getMainIcon = () => {
    if (activeTab === 'nfc') {
      return <Smartphone className="w-20 h-20 text-white animate-pulse" />;
    } else {
      if (scanning) {
        return <Camera className="w-20 h-20 text-white animate-pulse" />;
      } else if (qrCodeUrl) {
        return null; // Will show actual QR code
      } else {
        return <QrCode className="w-20 h-20 text-white/60" />;
      }
    }
  };

  const handleDropdownSelect = (value: 'nfc' | 'qr') => {
    setActiveTab(value);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #475467 0%,rgb(8, 13, 23) 100%)'
      }}
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Share Profile</h1>
          <p className="text-white/80">Share your business card via NFC or QR code with location</p>
        </div>

        {/* Location Status Indicator */}
        {isCapturingLocation && (
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-2xl p-4 max-w-lg mx-auto mb-6">
            <div className="flex items-center justify-center gap-3 text-blue-300">
              <Loader2 className="w-5 h-5 animate-spin" />
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Capturing location...</span>
            </div>
          </div>
        )}

        {/* Dropdown Navigation */}
        <div className="relative max-w-md mx-auto mb-8">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white/10 backdrop-blur-sm text-white rounded-lg px-4 py-3 flex items-center justify-between hover:bg-white/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              {activeTab === 'nfc' ? <Smartphone className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
              <span className="font-medium">
                {activeTab === 'nfc' ? 'NFC Share' : 'QR Code'}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => handleDropdownSelect('nfc')}
                className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                  activeTab === 'nfc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>NFC Share</span>
              </button>
              <button
                onClick={() => handleDropdownSelect('qr')}
                className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                  activeTab === 'qr' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QR Code</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-lg mx-auto">
          {/* Dynamic Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {activeTab === 'nfc' ? 'NFC Share' : 'QR Code Scanner'}
            </h2>
            <p className="text-white/80">
              {activeTab === 'nfc' 
                ? 'Tap to share with nearby devices' 
                : 'Scan to connect instantly'
              }
            </p>
          </div>

          {/* Main Icon/Display Area */}
          <div className="flex justify-center items-center mb-8 h-64">
            {activeTab === 'nfc' ? (
              <div className="flex justify-center">
                {getMainIcon()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                {scanning ? (
                  <div className="flex justify-center">
                    {getMainIcon()}
                  </div>
                ) : qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="text-center">
                    {getMainIcon()}
                    <p className="text-white/60 mt-4">
                      {isGeneratingQR ? 'Generating with location...' : 'Tap to generate QR code'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-lg mb-6 ${
            activeTab === 'nfc' 
              ? (nfcSupported ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')
              : (cameraAvailable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')
          }`}>
            <div className="text-xl">
              {activeTab === 'nfc' 
                ? (nfcSupported ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)
                : (cameraAvailable ? <Camera className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)
              }
            </div>
            <span className="font-medium">
              {activeTab === 'nfc' 
                ? (nfcSupported 
                    ? (nfcEnabled ? 'NFC sharing active' : 'NFC available') 
                    : 'NFC not supported')
                : (cameraAvailable ? 'Camera available' : 'Camera not available')
              }
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {activeTab === 'nfc' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startNFCShare}
                  className={`py-4 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    nfcEnabled 
                      ? 'text-white' 
                      : 'bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-500'
                  }`}
                  style={nfcEnabled ? {
                    background: 'linear-gradient(135deg, #475467 0%, #101828 100%)'
                  } : {}}
                  disabled={!nfcSupported || !profile || isCapturingLocation}
                >
                  {isCapturingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Start NFC Share
                    </>
                  )}
                </button>
                
                <button
                  onClick={readNFCTag}
                  className="py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!nfcSupported}
                >
                  <Smartphone className="w-5 h-5" />
                  Read NFC Tag
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generateQRCode}
                    className={`py-4 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      qrCodeUrl 
                        ? 'text-white' 
                        : 'bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-500'
                    }`}
                    style={qrCodeUrl ? {
                      background: 'linear-gradient(135deg, #475467 0%, #101828 100%)'
                    } : {}}
                    disabled={!profile || isGeneratingQR || isCapturingLocation}
                  >
                    {isGeneratingQR || isCapturingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isCapturingLocation ? 'Getting Location...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        Generate Code
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={startQRScanner}
                    className={`py-4 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      scanning 
                        ? 'text-white' 
                        : 'bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-500'
                    }`}
                    style={scanning ? {
                      background: 'linear-gradient(135deg, #475467 0%, #101828 100%)'
                    } : {}}
                    disabled={scanning || !cameraAvailable}
                  >
                    <Camera className="w-5 h-5" />
                    {scanning ? 'Scanning...' : 'Scan QR'}
                  </button>
                </div>
                
                {qrCodeUrl && (
                  <button
                    onClick={downloadQRCode}
                    className="w-full py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Scan QR Code
                </h2>
                <button
                  onClick={stopQRScanner}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 object-cover"
                    autoPlay
                    playsInline
                  />
                  <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-gray-600 mb-4">Point your camera at a QR code</p>
                  <button
                    onClick={stopQRScanner}
                    className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <XCircle className="w-5 h-5" />
                    Stop Scanner
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 