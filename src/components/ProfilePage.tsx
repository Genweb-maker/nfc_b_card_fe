'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, createUserProfile } from '../lib/api';
import { showToast } from './Toast';
import { User, Mail, Phone, Building, Globe, Linkedin, FileText, Camera, Download, Share2, Eye } from 'lucide-react';
import { handleError } from '../lib/errorHandler';
import ImageUpload from './ImageUpload';
import BusinessCardActions from './BusinessCardActions';

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
  profilePicture?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    jobTitle: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    website: '',
    linkedIn: '',
    bio: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response?.success && response.user?.profile) {
        setProfile(response.user.profile);
        setHasProfile(true);
      }
    } catch (error) {
      handleError(error, { context: 'loading profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (imageUrl: string) => {
    setProfile(prev => ({
      ...prev,
      profilePicture: imageUrl
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = hasProfile
        ? await updateUserProfile(profile)
        : await createUserProfile(profile);

      if (response?.success) {
        showToast(hasProfile ? 'Profile updated successfully!' : 'Profile created successfully!', 'success');
        setHasProfile(true);
      }
    } catch (error) {
      handleError(error, { context: 'saving profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-6">
        <div className="flex items-center gap-2 text-gray-800">
          <img src="/icons/Logomark.png" alt="NPC Business Card" className="w-6 h-6" />
          <span className="font-semibold text-lg">My Profile</span>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${showPreview
              ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
            }`}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Edit Profile' : 'Preview Card'}
        </button>
      </div>

      <div className="px-4 pb-24">
        {showPreview ? (
          // Enhanced Preview Mode with better desktop design
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Profile Header with Enhanced Gradient */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-6"></div>
                </div>

                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-lg">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-1 drop-shadow-sm">{profile.fullName || 'Your Name'}</h2>
                  <p className="text-blue-100 font-medium">{profile.jobTitle || 'Your Job Title'}</p>
                  <p className="text-blue-100 text-sm mt-1">{profile.companyName || 'Your Company'}</p>
                </div>
              </div>

              {/* Contact Information with better styling */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-gray-800 font-medium">{profile.email || 'your.email@example.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-gray-800 font-medium">{profile.phoneNumber || '+1 (555) 123-4567'}</p>
                    </div>
                  </div>

                  {(profile.website || showPreview) && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Website</p>
                        <p className="text-gray-800 font-medium">{profile.website || 'www.yourwebsite.com'}</p>
                      </div>
                    </div>
                  )}

                  {(profile.linkedIn || showPreview) && (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">LinkedIn</p>
                        <p className="text-gray-800 font-medium">{profile.linkedIn || 'linkedin.com/in/yourprofile'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* About Me Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    About Me
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.bio || 'Add your professional bio here. Describe your experience, skills, and what makes you unique in your field. This is a great place to showcase your expertise and personality.'}
                    </p>
                  </div>
                </div>

                {/* Business Card Actions with enhanced styling */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-indigo-600" />
                    </div>
                    Business Card Actions
                  </h3>
                  <BusinessCardActions profile={profile} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Profile Picture */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Picture
              </h3>
              <ImageUpload
                currentImage={profile.profilePicture}
                onImageChange={handleImageChange}
                className="mx-auto"
              />
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Professional Information</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="jobTitle"
                  value={profile.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Job Title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyName}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Online Presence */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Online Presence</h3>
              <div className="space-y-3">
                <input
                  type="url"
                  name="website"
                  value={profile.website}
                  onChange={handleInputChange}
                  placeholder="Website"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  name="linkedIn"
                  value={profile.linkedIn}
                  onChange={handleInputChange}
                  placeholder="LinkedIn Profile"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">About You</h3>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell people about yourself, your expertise, and what you do..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !profile.fullName || !profile.email}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                hasProfile ? 'Update Profile' : 'Create Profile'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 