'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/lib/supabase/types';

interface UserUpdateData {
  name?: string;
  avatar?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export function useUser() {
  const queryClient = useQueryClient();

  // Get user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
  });

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UserUpdateData): Promise<User> => {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });

  // Change password
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeData) => {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to change password');
      }
      return res.json();
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete account');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    profile,
    isLoadingProfile,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    profileError: updateProfileMutation.error,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    passwordError: changePasswordMutation.error,
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
