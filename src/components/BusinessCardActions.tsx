'use client';

import React, { useState } from 'react';
import { Download, Share2, Copy, MessageCircle, Mail, Smartphone } from 'lucide-react';
import { showToast } from './Toast';
import html2canvas from 'html2canvas';

interface BusinessCardActionsProps {
    profile: any;
    className?: string;
}

const BusinessCardActions = ({ profile, className = "" }: BusinessCardActionsProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const generateCardContent = () => {
        return `
            <div style="
                width: 350px; 
                height: 200px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 20px;
                color: white;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                position: relative;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; height: 100%;">
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: white;">
                            ${profile?.fullName || 'Your Name'}
                        </h2>
                        <p style="margin: 0 0 6px 0; font-size: 14px; opacity: 0.9; color: rgba(255,255,255,0.9);">
                            ${profile?.jobTitle || 'Your Job Title'}
                        </p>
                        <p style="margin: 0 0 12px 0; font-size: 12px; opacity: 0.8; color: rgba(255,255,255,0.8);">
                            ${profile?.companyName || 'Your Company'}
                        </p>
                        <div style="font-size: 11px; line-height: 1.4; opacity: 0.9;">
                            <div style="margin-bottom: 3px; color: rgba(255,255,255,0.9);">📧 ${profile?.email || 'email@example.com'}</div>
                            ${profile?.phoneNumber ? `<div style="margin-bottom: 3px; color: rgba(255,255,255,0.9);">📱 ${profile.phoneNumber}</div>` : ''}
                            ${profile?.website ? `<div style="color: rgba(255,255,255,0.9);">🌐 ${profile.website}</div>` : ''}
                        </div>
                    </div>
                    ${profile?.profilePicture ? `
                        <div style="
                            width: 60px; 
                            height: 60px; 
                            border-radius: 50%; 
                            overflow: hidden; 
                            border: 3px solid rgba(255,255,255,0.3);
                            background-color: rgba(255,255,255,0.1);
                        ">
                            <img src="${profile.profilePicture}" style="
                                width: 100%; 
                                height: 100%; 
                                object-fit: cover;
                            " />
                        </div>
                    ` : `
                        <div style="
                            width: 60px; 
                            height: 60px; 
                            border-radius: 50%; 
                            background: rgba(255,255,255,0.2);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: bold;
                            color: white;
                        ">
                            ${(profile?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                    `}
                </div>
                <div style="
                    position: absolute;
                    bottom: 15px;
                    right: 20px;
                    font-size: 10px;
                    opacity: 0.7;
                    color: rgba(255,255,255,0.7);
                ">
                    NFC Business Card
                </div>
            </div>
        `;
    };

    const downloadCard = async () => {
        setIsGenerating(true);
        try {
            // Create a temporary div to hold the card
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = generateCardContent();
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);

            // Wait a bit for the content to render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generate canvas from the temporary div
            const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
                backgroundColor: null,
                scale: 2, // Higher quality
                width: 350,
                height: 200,
                useCORS: true,
                logging: false,
                allowTaint: true
            });

            // Clean up
            document.body.removeChild(tempDiv);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${profile?.fullName || 'business-card'}_card.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Business card downloaded successfully!', 'success');
                }
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('Download failed:', error);
            showToast('Failed to download business card', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateImageBlob = async (): Promise<Blob | null> => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = generateCardContent();
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);

            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
                backgroundColor: null,
                scale: 2,
                width: 350,
                height: 200,
                useCORS: true,
                logging: false,
                allowTaint: true
            });

            document.body.removeChild(tempDiv);

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('Failed to generate image:', error);
            return null;
        }
    };

    const shareCard = async () => {
        setIsGenerating(true);
        try {
            const text = `${profile?.fullName || 'Business Card'}\n${profile?.jobTitle || ''}\n${profile?.email || ''}\n${profile?.phoneNumber ? `📱 ${profile.phoneNumber}` : ''}`;

            // Try Web Share API first (works on mobile and some desktop browsers)
            if (navigator.share) {
                const blob = await generateImageBlob();
                if (blob) {
                    const file = new File([blob], `${profile?.fullName || 'business-card'}.png`, { type: 'image/png' });

                    // Check if we can share files
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `${profile?.fullName || 'Business Card'}`,
                            text: text,
                            files: [file]
                        });
                        showToast('Business card shared successfully!', 'success');
                        return;
                    }
                }

                // Fallback to sharing text only
                await navigator.share({
                    title: `${profile?.fullName || 'Business Card'}`,
                    text: text,
                    url: window.location.origin
                });
                showToast('Contact details shared!', 'success');
            } else {
                // Fallback: show share options
                setShowShareMenu(true);
            }
        } catch (error) {
            console.error('Share failed:', error);
            if (error.name !== 'AbortError') { // User cancelled
                setShowShareMenu(true); // Show manual share options
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            const text = `${profile?.fullName || 'Business Card'}
${profile?.jobTitle || ''}
${profile?.companyName || ''}
📧 ${profile?.email || ''}
${profile?.phoneNumber ? `📱 ${profile.phoneNumber}` : ''}
${profile?.website ? `🌐 ${profile.website}` : ''}
${profile?.bio ? `\n${profile.bio}` : ''}`;

            await navigator.clipboard.writeText(text);
            showToast('Contact details copied to clipboard!', 'success');
            setShowShareMenu(false);
        } catch (error) {
            showToast('Failed to copy to clipboard', 'error');
        }
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(`${profile?.fullName || 'Business Card'}\n${profile?.jobTitle || ''}\n📧 ${profile?.email || ''}\n${profile?.phoneNumber ? `📱 ${profile.phoneNumber}` : ''}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShowShareMenu(false);
    };

    const shareEmail = () => {
        const subject = encodeURIComponent(`Contact details from ${profile?.fullName || 'Business Card'}`);
        const body = encodeURIComponent(`${profile?.fullName || 'Business Card'}\n${profile?.jobTitle || ''}\n${profile?.companyName || ''}\n\n📧 ${profile?.email || ''}\n${profile?.phoneNumber ? `📱 ${profile.phoneNumber}` : ''}\n${profile?.website ? `🌐 ${profile.website}` : ''}\n${profile?.bio ? `\n${profile.bio}` : ''}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setShowShareMenu(false);
    };

    const shareSMS = () => {
        const text = encodeURIComponent(`${profile?.fullName || 'Business Card'}\n📧 ${profile?.email || ''}\n${profile?.phoneNumber ? `📱 ${profile.phoneNumber}` : ''}`);
        window.open(`sms:?body=${text}`, '_blank');
        setShowShareMenu(false);
    };

    return (
        <div className={`flex flex-col space-y-3 ${className}`}>
            {/* Main Action Buttons */}
            <div className="flex space-x-3">
                <button
                    onClick={downloadCard}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {isGenerating ? 'Generating...' : 'Download Card'}
                    </span>
                </button>

                <button
                    onClick={shareCard}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {isGenerating ? 'Generating...' : 'Share Card'}
                    </span>
                </button>
            </div>

            {/* Share Menu Overlay */}
            {showShareMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={() => setShowShareMenu(false)}>
                    <div className="bg-white rounded-t-xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Share Business Card</h3>
                            <button
                                onClick={() => setShowShareMenu(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={copyToClipboard}
                                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Copy className="w-6 h-6 text-gray-600 mb-2" />
                                <span className="text-sm text-gray-700">Copy Text</span>
                            </button>

                            <button
                                onClick={shareWhatsApp}
                                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MessageCircle className="w-6 h-6 text-green-600 mb-2" />
                                <span className="text-sm text-gray-700">WhatsApp</span>
                            </button>

                            <button
                                onClick={shareEmail}
                                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Mail className="w-6 h-6 text-blue-600 mb-2" />
                                <span className="text-sm text-gray-700">Email</span>
                            </button>

                            <button
                                onClick={shareSMS}
                                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Smartphone className="w-6 h-6 text-purple-600 mb-2" />
                                <span className="text-sm text-gray-700">SMS</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessCardActions; 