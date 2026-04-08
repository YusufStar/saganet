export const adminKeys = {
  all: ['admin'] as const,
  gatewayHealth: () => [...adminKeys.all, 'gateway-health'] as const,
};
