export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  addresses: () => [...authKeys.all, 'addresses'] as const,
  address: (id: string) => [...authKeys.addresses(), id] as const,
};
