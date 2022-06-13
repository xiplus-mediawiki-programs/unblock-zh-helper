import { vi } from 'vitest';

Object.defineProperty(mw, 'ForeignApi', {
  value: vi.fn().mockImplementation(() => {}),
});
