'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [hasShownPrompt, setHasShownPrompt] = useState(false);
    const [showManualInstructions, setShowManualInstructions] = useState(false);

    useEffect(() => {
        // Check if app is already installed (standalone mode)
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone ||
                document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();

        // Check if we've already shown the prompt before
        const hasShown = localStorage.getItem('pwa-install-prompt-shown') === 'true';
        setHasShownPrompt(hasShown);

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            setIsInstallable(true);

            // Show prompt automatically only if not shown before and not in standalone mode
            if (!hasShown && !isStandalone) {
                setTimeout(() => {
                    setShowPrompt(true);
                }, 2000); // Show after 2 seconds
            }
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
            setShowPrompt(false);
            setIsStandalone(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Fallback: show prompt after 3 seconds even if beforeinstallprompt doesn't fire
        // This is useful for testing and browsers that don't support the event
        if (!hasShown && !isStandalone) {
            const fallbackTimer = setTimeout(() => {
                if (!isInstallable) {
                    setIsInstallable(true);
                    setShowPrompt(true);
                    console.log('PWA prompt shown (fallback)');
                }
            }, 3000);

            return () => {
                clearTimeout(fallbackTimer);
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                window.removeEventListener('appinstalled', handleAppInstalled);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [isStandalone, hasShownPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If no deferred prompt, show manual instructions
            setShowManualInstructions(true);
            return;
        }

        try {
            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }

            // Clear the deferredPrompt for next time
            setDeferredPrompt(null);
            setShowPrompt(false);

            // Mark that we've shown the prompt
            localStorage.setItem('pwa-install-prompt-shown', 'true');
            setHasShownPrompt(true);

        } catch (error) {
            console.error('Error showing install prompt:', error);
            // Fallback to manual instructions
            setShowManualInstructions(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowManualInstructions(false);
        // Mark that we've shown the prompt so it doesn't appear again automatically
        localStorage.setItem('pwa-install-prompt-shown', 'true');
        setHasShownPrompt(true);
    };

    const handleManualInstall = () => {
        setShowPrompt(true);
    };

    // Don't show anything if app is already installed
    if (isStandalone) {
        return null;
    }

    // Install button that's always available (if installable)
    const InstallButton = () => {
        if (!isInstallable) return null;

        return (
            <button
                onClick={handleManualInstall}
                className="fixed bottom-20 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 md:bottom-4"
                title="Install App"
                aria-label="Install App"
            >
                <Download size={20} />
            </button>
        );
    };

    // Manual installation instructions modal
    if (showManualInstructions) {
        return (
            <>
                <InstallButton />
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-scale-in">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Info className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Install NFC Business Card
                            </h3>
                            <p className="text-gray-600 mb-6">
                                To install this app on your device, follow these steps:
                            </p>

                            <div className="text-left mb-6 space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">On Android (Chrome):</h4>
                                    <ol className="text-sm text-gray-600 space-y-1">
                                        <li>1. Tap the menu (⋮) in the top right</li>
                                        <li>2. Select "Add to Home screen"</li>
                                        <li>3. Tap "Add" to confirm</li>
                                    </ol>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">On iPhone (Safari):</h4>
                                    <ol className="text-sm text-gray-600 space-y-1">
                                        <li>1. Tap the share button (□↑)</li>
                                        <li>2. Scroll down and tap "Add to Home Screen"</li>
                                        <li>3. Tap "Add" to confirm</li>
                                    </ol>
                                </div>
                            </div>

                            <button
                                onClick={handleDismiss}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Main install prompt modal
    if (!showPrompt) {
        return <InstallButton />;
    }

    return (
        <>
            <InstallButton />

            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                {/* Modal */}
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-scale-in">
                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Smartphone className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Install NFC Business Card
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Get quick access to your digital business cards. Install our app for the best experience with offline support and faster loading.
                        </p>

                        {/* Features */}
                        <div className="text-left mb-6 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                Works offline
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                Faster loading
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                App-like experience
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                Home screen access
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Maybe Later
                            </button>
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            >
                                <Download size={16} className="mr-2" />
                                Install
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default PWAInstallPrompt; 