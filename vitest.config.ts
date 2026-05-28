import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['node_modules/**', 'dist/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/services/challenge.service.ts',
        'src/services/vehicle.service.ts',
        'src/utils/challengeStateMachine.ts',
        'src/utils/rank.ts',
        'src/utils/vehicleState.ts',
      ],
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
      },
    },
  },
});
