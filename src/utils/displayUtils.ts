export const getDisplayName = (user: { nickname?: string } | null): string => {
  return user?.nickname || '달려';
};
