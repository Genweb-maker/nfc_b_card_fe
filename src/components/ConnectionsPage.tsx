'use client';

import { useState, useEffect } from 'react';
import { getReceivedConnections, getSentConnections, deleteConnection } from '../lib/api';
import { showToast } from './Toast';
import { Bell, MapPin, Calendar, Eye, ExternalLink, Users, Mail, Phone, Globe, Briefcase, FileText, User, Building, Share2 } from 'lucide-react';

interface Connection {
  _id: string;
  senderUid: string;
  receiverUid: string;
  sharedBy: {
    _id: string;
    profile: {
      fullName: string;
      email: string;
      phoneNumber?: string;
      jobTitle?: string;
      companyName?: string;
      linkedIn?: string;
      website?: string;
      bio?: string;
      profilePicture?: string;
    };
  };
  shareMethod: 'NFC' | 'QR';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timestamp: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConnectionResponse {
  success: boolean;
  connections: Connection[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  };
}

export default function ConnectionsPage() {
  const [receivedConnections, setReceivedConnections] = useState<Connection[]>([]);
  const [sentConnections, setSentConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'company'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-dropdown')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);

      if (activeTab === 'received') {
        const response: ConnectionResponse = await getReceivedConnections();
        if (response.success) {
          setReceivedConnections(response.connections || []);
        }
      } else {
        const response: ConnectionResponse = await getSentConnections();
        if (response.success) {
          setSentConnections(response.connections || []);
        }
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      showToast('Failed to load connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      const response = await deleteConnection(connectionId);
      if (response.success) {
        showToast('Connection deleted successfully', 'success');

        // Remove from local state
        if (activeTab === 'received') {
          setReceivedConnections(prev => prev.filter(c => c._id !== connectionId));
        } else {
          setSentConnections(prev => prev.filter(c => c._id !== connectionId));
        }

        // Close modal
        setSelectedConnection(null);
      }
    } catch (error) {
      console.error('Failed to delete connection:', error);
      showToast('Failed to delete connection', 'error');
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewProfile = (connection: Connection, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedConnection(connection);
  };

  const handleViewLocation = (connection: Connection, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // For now, show in modal - could be enhanced to show map
    showToast(`Location: ${connection.location?.address || 'Not provided'}`, 'info');
  };

  const sortConnections = (connections: Connection[]): Connection[] => {
    return [...connections].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.sharedBy.profile.fullName.localeCompare(b.sharedBy.profile.fullName);
        case 'company':
          const aCompany = a.sharedBy.profile.companyName || '';
          const bCompany = b.sharedBy.profile.companyName || '';
          return aCompany.localeCompare(bCompany);
        default:
          return 0;
      }
    });
  };

  const currentConnections = sortConnections(
    activeTab === 'received' ? receivedConnections : sentConnections
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/Logomark.png" alt="NPC Logo" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-gray-900">NPC Business Card</h1>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Connections</h2>
          <div className="relative sort-dropdown">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span className="text-sm mr-1">
                Sort by {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'name' ? 'Name' : 'Company'}
              </span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {[
                    { key: 'newest', label: 'Newest First' },
                    { key: 'oldest', label: 'Oldest First' },
                    { key: 'name', label: 'Name (A-Z)' },
                    { key: 'company', label: 'Company (A-Z)' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortBy(option.key as typeof sortBy);
                        setShowSortMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === option.key ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                    >
                      {option.label}
                      {sortBy === option.key && (
                        <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex border-b border-gray-200 gap-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'received'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Received
            {activeTab === 'received' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full -mb-px"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'sent'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Shared
            {activeTab === 'sent' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full -mb-px"></div>
            )}
          </button>
        </div>
      </div>

      {/* Connections List */}
      <div className="px-6">
        {currentConnections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} connections yet
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'received'
                ? 'Start sharing your profile to receive connections!'
                : 'Share your profile via NFC or QR code to build connections!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentConnections.map((connection) => (
              <div
                key={connection._id}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg overflow-hidden">
                    {connection.sharedBy.profile.profilePicture ? (
                      <img
                        src={connection.sharedBy.profile.profilePicture}
                        alt={connection.sharedBy.profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getUserInitials(connection.sharedBy.profile.fullName)
                    )}
                    <div className="absolute inset-0 bg-black/10 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-base">
                      {connection.sharedBy.profile.fullName}
                    </h3>
                    <p className="text-gray-600 text-sm truncate mt-1">
                      <span className="text-gray-900 font-medium">
                        {connection.sharedBy.profile.jobTitle || 'Professional'}
                      </span>
                      {connection.sharedBy.profile.companyName && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{connection.sharedBy.profile.companyName}</span>
                        </>
                      )}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="mr-3">{connection.location?.address || 'Location not provided'}</span>
                      <span className="mx-1">•</span>
                      <span className="ml-1">{formatDate(connection.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={(e) => handleViewProfile(connection, e)}
                    className="flex-1 bg-gray-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={(e) => handleViewLocation(connection, e)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <MapPin className="w-4 h-4" />
                    View Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Detail Modal */}
      {selectedConnection && (
        <div className="modal active">
          <div className="modal-content">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
              <button
                onClick={() => setSelectedConnection(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="profile-preview">
              {/* Enhanced Profile Header */}
              <div className="text-center mb-8">
                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg overflow-hidden">
                  {selectedConnection.sharedBy.profile.profilePicture ? (
                    <img
                      src={selectedConnection.sharedBy.profile.profilePicture}
                      alt={selectedConnection.sharedBy.profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getUserInitials(selectedConnection.sharedBy.profile.fullName)
                  )}
                  <div className="absolute inset-0 bg-black/10 rounded-full"></div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedConnection.sharedBy.profile.fullName}
                </h3>

                {selectedConnection.sharedBy.profile.jobTitle && (
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">{selectedConnection.sharedBy.profile.jobTitle}</span>
                  </div>
                )}

                {selectedConnection.sharedBy.profile.companyName && (
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{selectedConnection.sharedBy.profile.companyName}</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-600" />
                  Contact Information
                </h4>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedConnection.sharedBy.profile.email}</p>
                    </div>
                  </div>

                  {selectedConnection.sharedBy.profile.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{selectedConnection.sharedBy.profile.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedConnection.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{selectedConnection.location.address}</p>
                      </div>
                    </div>
                  )}

                  {selectedConnection.sharedBy.profile.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a
                          href={selectedConnection.sharedBy.profile.website}
                          className="font-medium text-indigo-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedConnection.sharedBy.profile.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedConnection.sharedBy.profile.linkedIn && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <a
                          href={selectedConnection.sharedBy.profile.linkedIn}
                          className="font-medium text-indigo-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedConnection.sharedBy.profile.bio && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    About
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedConnection.sharedBy.profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Connection Details */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-gray-600" />
                  Connection Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedConnection.shareMethod === 'NFC'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {selectedConnection.shareMethod.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {activeTab === 'received' ? 'Received from' : 'Sent to'} this contact
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Connected on {formatDate(selectedConnection.createdAt)}</span>
                  </div>

                  {selectedConnection.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Location: {selectedConnection.location.address}</span>
                    </div>
                  )}

                  {selectedConnection.deviceInfo && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span>Platform: {selectedConnection.deviceInfo.platform}</span>
                      </div>
                      {selectedConnection.deviceInfo.screenResolution && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>Screen: {selectedConnection.deviceInfo.screenResolution}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {activeTab === 'received' && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleDeleteConnection(selectedConnection._id)}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Connection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 