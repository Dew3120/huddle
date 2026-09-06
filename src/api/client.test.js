import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiError, isNetworkError } from './client.js';

test('treats gateway failures as network errors for offline queueing', () => {
  assert.equal(isNetworkError(new ApiError({ status: 502 })), true);
  assert.equal(isNetworkError(new ApiError({ status: 503 })), true);
  assert.equal(isNetworkError(new ApiError({ status: 504 })), true);
  assert.equal(isNetworkError(new ApiError({ status: 500 })), false);
});
