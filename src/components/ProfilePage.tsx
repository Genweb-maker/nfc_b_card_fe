'use client';

import { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, createUserProfile } from '../lib/api';
import { showToast } from './Toast';
import { handleError, showSuccess, handleNetworkError } from '../lib/errorHandler';

interface ProfileData {
  createdAt: string;
  email: string;
  firebaseUid?: string;
  profile: Profile;
}

interface Profile {
  bio: string;
  companyName: string;
  email: string;
  fullName: string;
  jobTitle: string;
  linkedIn: string;
  phoneNumber: string;
  website: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    createdAt: '',
    email: '',
    firebaseUid: '',
    profile: {
      bio: '',
      companyName: '',
      email: 'robert@gmail.com',
      fullName: 'Robert Downey',
      jobTitle: 'Project Manager',
      linkedIn: '',
      phoneNumber: '+91 1234567890',
      website: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success && response.user) {
        setProfile(response.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Using default data if no profile exists
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const response = await updateUserProfile(profile);
      if (response.success) {
        showSuccess('Profile updated successfully!');
        setEditing(false);
      } else {
        const createResponse = await createUserProfile(profile);
        if (createResponse.success) {
          showSuccess('Profile created successfully!');
          setEditing(false);
        }
      }
    } catch (error: any) {
      handleNetworkError(error, 'save profile');
    }
  };

  const downloadBusinessCard = async () => {
    try {
      // Create a canvas to draw the business card
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size (business card dimensions: 3.5" x 2" at 300 DPI)
      canvas.width = 1050; // 3.5 * 300
      canvas.height = 600;  // 2 * 300

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Profile circle (top-left)
      const centerX = 100;
      const centerY = 100;
      const radius = 40;
      
      // Create gradient for profile circle
      const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(1, '#2563eb');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Add person icon (simplified)
      ctx.fillStyle = '#ffffff';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('👤', centerX, centerY + 10);

      // Name
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(profile?.profile?.fullName || 'Robert Downey', 200, 80);

      // Job Title
      ctx.fillStyle = '#475569';
      ctx.font = '24px Arial';
      ctx.fillText(profile?.profile?.jobTitle || 'Project Manager', 200, 110);

      // Company Name
      ctx.fillStyle = '#64748b';
      ctx.font = '18px Arial';
      ctx.fillText(profile?.profile?.companyName || 'Company Name', 200, 135);

      // Contact details
      let yPos = 200;
      const lineHeight = 35;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#475569';

      // Email
      ctx.fillText('📧 ' + (profile?.profile?.email || 'robert@gmail.com'), 60, yPos);
      yPos += lineHeight;

      // Phone
      ctx.fillText('📞 ' + (profile?.profile?.phoneNumber || '+91 1234567890'), 60, yPos);
      yPos += lineHeight;

      // Website
      if (profile?.profile?.website) {
        ctx.fillText('🌐 ' + profile.profile.website, 60, yPos);
        yPos += lineHeight;
      }

      // LinkedIn
      if (profile?.profile?.linkedIn) {
        ctx.fillText('💼 LinkedIn Profile', 60, yPos);
        yPos += lineHeight;
      }

      // Bio (if available and space permits)
      if (profile?.profile?.bio && yPos < 500) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#64748b';
        const bioText = profile.profile.bio.substring(0, 100) + (profile.profile.bio.length > 100 ? '...' : '');
        const words = bioText.split(' ');
        let line = '';
        let bioY = yPos + 20;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > 900 && i > 0) {
            ctx.fillText(line, 60, bioY);
            line = words[i] + ' ';
            bioY += 20;
            if (bioY > 550) break; // Don't exceed card bounds
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 60, bioY);
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${profile?.profile?.fullName?.replace(/\s+/g, '_') || 'Business_Card'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showSuccess('Business card downloaded successfully!');
        }
      }, 'image/png');

    } catch (error) {
      handleError(error, { context: 'download business card' });
    }
  };

  const ProfileIcon = () => (
    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
      <svg
        className="w-12 h-12 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  const SmallProfileIcon = ({ size = "w-16 h-16" }) => (
    <div className={`${size} bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md`}>
      <svg
        className="w-8 h-8 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 sm:py-8 px-2 sm:px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors order-1">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 text-center flex-1 order-2 sm:order-none">
            My Business Card
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 order-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="sm:inline">Preview</span>
            </button>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {editing ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="sm:inline">Save</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="sm:inline">Edit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Business Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 sm:p-6 md:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <ProfileIcon />
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="fullName"
                      value={profile?.profile?.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      name="jobTitle"
                      value={profile?.profile?.jobTitle || ''}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      name="companyName"
                      value={profile?.profile?.companyName || ''}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                      placeholder="Company Name"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 break-words">
                      {profile?.profile?.fullName || 'Robert Downey'}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-1 break-words">
                      {profile?.profile?.jobTitle || 'Project Manager'}
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400 break-words">
                      {profile?.profile?.companyName || 'Company Name'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>

                {/* Email */}
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                  </div>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile?.profile?.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium break-all text-sm sm:text-base">{profile?.profile?.email || 'robert@gmail.com'}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                  </div>
                  {editing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile?.profile?.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium break-all text-sm sm:text-base">{profile?.profile?.phoneNumber || '+91 1234567890'}</p>
                  )}
                </div>

                {/* Website */}
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-slate-600">Website</label>
                  </div>
                  {editing ? (
                    <input
                      type="url"
                      name="website"
                      value={profile?.profile?.website || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium break-all text-sm sm:text-base">{profile?.profile?.website || 'Add website'}</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="p-3 sm:p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-slate-600">LinkedIn</label>
                  </div>
                  {editing ? (
                    <input
                      type="url"
                      name="linkedIn"
                      value={profile?.profile?.linkedIn || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : (
                    <p className="text-slate-800 font-medium break-all text-sm sm:text-base">{profile?.profile?.linkedIn || 'Add LinkedIn profile'}</p>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  About Me
                </h3>

                <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border">
                  {editing ? (
                    <textarea
                      name="bio"
                      value={profile?.profile?.bio || ''}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 sm:px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
                      placeholder="Tell us about yourself, your experience, and what you do..."
                    />
                  ) : (
                    <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                      {profile?.profile?.bio || 'Add your professional bio here. Describe your experience, skills, and what makes you unique in your field.'}
                    </p>
                  )}
                </div>

                </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1">
                Professional Business Card
              </div>
              <div className="flex items-center gap-4 order-1 sm:order-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-auto mx-2 sm:mx-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Business Card Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actual Business Card */}
            <div className="p-4 sm:p-8 flex justify-center">
              <div ref={cardRef} className="w-full max-w-[420px] h-auto min-h-[240px] sm:h-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Card Content */}
                <div className="h-full p-4 sm:p-6 flex flex-col">
                  {/* Header with Profile Pic and Basic Info */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <SmallProfileIcon size="w-12 h-12 sm:w-16 sm:h-16" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-slate-800 leading-tight break-words">
                        {profile?.profile?.fullName || 'Robert Downey'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium break-words">
                        {profile?.profile?.jobTitle || 'Project Manager'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 break-words">
                        {profile?.profile?.companyName || 'Company Name'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Details - Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600 mb-3">
                    {/* Email */}
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span className="truncate">{profile?.profile?.email || 'robert@gmail.com'}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="truncate">{profile?.profile?.phoneNumber || '+91 1234567890'}</span>
                    </div>

                    {/* Website */}
                    {profile?.profile?.website && (
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-3 h-3 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="truncate">{profile.profile.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}

                    {/* LinkedIn */}
                    {profile?.profile?.linkedIn && (
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-3 h-3 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="truncate">LinkedIn</span>
                      </div>
                    )}
                  </div>

                  {/* Bio/Description */}
                  {profile?.profile?.bio && (
                    <div className="mt-2 pt-3 border-t border-slate-200 flex-1">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {profile.profile.bio.length > 100 
                          ? profile.profile.bio.substring(0, 100) + '...' 
                          : profile.profile.bio
                        }
                      </p>
                    </div>
                  )}

                  {/* Decorative Elements */}
                  <div className="flex justify-between items-end mt-auto pt-2">
                    <div className="text-xs text-slate-400">
                      {new Date().getFullYear()}
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full opacity-30"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-50"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full opacity-70"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-slate-200 bg-slate-50 gap-4 sm:gap-0">
              <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                This is how your business card will appear when printed or shared
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={downloadBusinessCard}
                  className="flex-1 sm:flex-none px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 