'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, createUserProfile } from '../lib/api';
import { showToast } from './Toast';

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
        showToast('Profile updated successfully!', 'success');
        setEditing(false);
      } else {
        const createResponse = await createUserProfile(profile);
        if (createResponse.success) {
          showToast('Profile created successfully!', 'success');
          setEditing(false);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save profile', 'error');
    }
  };

  const ProfileIcon = () => (
    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
      <svg
        className="w-10 h-10 text-gray-600"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div
        className="text-white px-4 py-6 rounded-b-3xl"
        style={{
          background: 'linear-gradient(to right, #475467, #101828)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="p-2"
          >
            {editing ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            )}
          </button>
        </div>

        {/* Profile Section */}
        <div className="text-center">
          <ProfileIcon />
          <h2 className="text-2xl font-semibold mt-4 mb-1">
            {profile?.profile?.fullName || 'Robert Downey'}
          </h2>
          <p className="text-gray-300 text-base">
            {profile?.profile?.jobTitle || 'Project Manager'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Personal Details */}
        <div className="bg-white ">
          <div className="px-4 py-3 bg-gray-100 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Personal Details</h3>
          </div>
          <div className="p-4 space-y-4 bg-gray-100">
            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Full name
                </label>
              </div>
              {editing ? (
                <input
                  type="text"
                  name="fullName"
                  value={profile?.profile?.fullName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-white">
                  <p className="text-gray-800">{profile?.profile?.fullName || 'Robert Downey'}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Email ID
                </label>
              </div>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={profile?.profile?.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.email || 'robert@gmail.com'}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Phone Number
                </label>
              </div>
              {editing ? (
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile?.profile?.phoneNumber?.replace('+91 ', '') || ''}
                    onChange={(e) => handleInputChange({
                      ...e,
                      target: {
                        ...e.target,
                        value: '+91 ' + e.target.value
                      }
                    } as React.ChangeEvent<HTMLInputElement>)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                  />
                </div>
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none flex items-center">
                  <span className="text-gray-500 mr-2">+91</span>
                  <span className="text-gray-800">
                    {profile?.profile?.phoneNumber?.replace('+91 ', '') || '1234567890'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white ">
          <div className="px-4 py-3 bg-gray-100 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">Professional Details</h3>
          </div>
          <div className="p-4 space-y-4 bg-gray-100">
            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Job Title
                </label>
              </div>
              {editing ? (
                <input
                  type="text"
                  name="jobTitle"
                  value={profile?.profile?.jobTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.jobTitle || 'Project Manager'}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Company Name
                </label>
              </div>
              {editing ? (
                <input
                  type="text"
                  name="companyName"
                  value={profile?.profile?.companyName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.companyName || 'Add company name'}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  LinkedIn Profile
                </label>
              </div>
              {editing ? (
                <input
                  type="url"
                  name="linkedIn"
                  value={profile?.profile?.linkedIn || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.linkedIn || 'Add LinkedIn profile'}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Website
                </label>
              </div>
              {editing ? (
                <input
                  type="url"
                  name="website"
                  value={profile?.profile?.website || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.website || 'Add website'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white ">
          <div className="px-4 py-3 bg-gray-100 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-800">About</h3>
          </div>
          <div className="p-4 bg-gray-100">
            <div>
              <div className="bg-gray-100 py-2 rounded-md mb-2">
                <label className="block text-base font-medium text-gray-700">
                  Bio
                </label>
              </div>
              {editing ? (
                <textarea
                  name="bio"
                  value={profile?.profile?.bio || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description about yourself..."
                />
              ) : (
                <div className="bg-white px-3 py-2 rounded-md border border-none">
                  <p className="text-gray-800">{profile?.profile?.bio || 'Add your bio'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 