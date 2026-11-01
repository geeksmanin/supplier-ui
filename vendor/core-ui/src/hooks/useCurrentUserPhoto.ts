import { useState, useMemo, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import { resolveMediaUrl } from '../utils/media';

export interface UserPhotoCandidate {
  id?: string;
  ID?: string;
  userId?: string;
  email?: string;
  photo_url?: string;
  avatarUrl?: string;
  photo?: string;
  [key: string]: any;
}

export interface UseCurrentUserPhotoResult {
  currentUserPhoto: string;
  photoError: boolean;
  setPhotoError: (val: boolean) => void;
}

/**
 * Encapsulates single source of truth for resolving the logged-in user's profile photo
 * across desktop header, mobile settings, and local offline cache in Geeksman ERP.
 */
export function useCurrentUserPhoto(
  candidates?: UserPhotoCandidate[],
  userEmail?: string
): UseCurrentUserPhotoResult {
  const [photoError, setPhotoError] = useState(false);

  const currentUser = getCurrentUser();
  const emailToMatch = (userEmail || currentUser?.userEmail || '').toLowerCase();

  const matchedUser = useMemo(() => {
    if (!candidates || candidates.length === 0) return undefined;
    return candidates.find((c) => {
      const candidateId = c.id || c.ID || c.userId;
      if (currentUser?.userId && candidateId === currentUser.userId) {
        return true;
      }
      if (c.email && emailToMatch && c.email.toLowerCase() === emailToMatch) {
        return true;
      }
      return false;
    });
  }, [candidates, currentUser?.userId, emailToMatch]);

  const userPhotoKey = currentUser?.userId
    ? `user_photo_${currentUser.userId}`
    : emailToMatch
    ? `user_photo_${emailToMatch}`
    : '';

  const cachedUserPhoto =
    userPhotoKey && typeof window !== 'undefined'
      ? localStorage.getItem(userPhotoKey) || ''
      : '';

  const rawPhoto =
    matchedUser?.photo_url ||
    matchedUser?.avatarUrl ||
    matchedUser?.photo ||
    cachedUserPhoto;

  const resolvedPhoto = useMemo(() => (rawPhoto ? resolveMediaUrl(rawPhoto) : ''), [rawPhoto]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Clean up legacy unscoped user_photo key to prevent cross-account avatar leaks
    try {
      localStorage.removeItem('user_photo');
      if (userPhotoKey && matchedUser) {
        const photoToCache = matchedUser.photo_url || matchedUser.avatarUrl || matchedUser.photo;
        if (photoToCache) {
          localStorage.setItem(userPhotoKey, photoToCache);
        }
      }
    } catch {
      // Ignore storage restrictions
    }
  }, [userPhotoKey, matchedUser]);

  return {
    currentUserPhoto: photoError ? '' : resolvedPhoto,
    photoError,
    setPhotoError,
  };
}
