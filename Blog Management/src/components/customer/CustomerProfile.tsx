import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, ProfileData, PasswordData } from '../../services/profileService';
import Button from '../Button';
import toast from 'react-hot-toast';

function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subscriptionPlan: user?.subscriptionPlan || 'Basic'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        subscriptionPlan: user.subscriptionPlan || 'Basic'
      });
      setCurrentUser(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData: ProfileData = {
        name: formData.name,
        email: formData.email,
        subscriptionPlan: formData.subscriptionPlan
      };

      const updatedUser = await profileService.updateProfile(profileData);
      
      // Update the user in the auth context
      updateUser(updatedUser);
      setCurrentUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subscriptionPlan: user?.subscriptionPlan || 'Basic'
    });
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const passwordChangeData: PasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      await profileService.changePassword(passwordChangeData);
      
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account information and subscription.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              {!isEditing && (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input mt-1 disabled:bg-gray-50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input mt-1 disabled:bg-gray-50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subscription" className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription Plan
                  </div>
                </label>
                <select
                  id="subscription"
                  className="input mt-1 disabled:bg-gray-50"
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as any })}
                  disabled={!isEditing}
                >
                  <option value="Basic">Basic - $9/month</option>
                  <option value="Premium">Premium - $19/month</option>
                  <option value="Enterprise">Enterprise - $39/month</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'Unknown'}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Subscription Details */}
        <div className="mt-6 card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Plan</label>
                <p className="mt-1 text-sm text-gray-900">{currentUser?.subscriptionPlan || 'Basic'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Billing Cycle</label>
                <p className="mt-1 text-sm text-gray-900">Monthly</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {currentUser?.updatedAt ? formatDate(currentUser.updatedAt) : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="secondary" size="sm">
                Manage Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="mt-6 card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              {!isChangingPassword && (
                <Button
                  variant="secondary"
                  onClick={() => setIsChangingPassword(true)}
                  icon={Lock}
                >
                  Change Password
                </Button>
              )}
            </div>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="px-6 py-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Current Password
                    </div>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      className="input pr-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      className="input pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      className="input pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePasswordCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isPasswordLoading}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;