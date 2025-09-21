/**
 * Format date to relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return targetDate.toLocaleDateString();
};

/**
 * Format date to ISO string
 */
export const formatISO = (date: Date): string => {
  return date.toISOString();
};

/**
 * Format date to readable format
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString();
};

/**
 * Get date range for last N days
 */
export const getDateRange = (days: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    from: formatISO(from),
    to: formatISO(to),
  };
};
