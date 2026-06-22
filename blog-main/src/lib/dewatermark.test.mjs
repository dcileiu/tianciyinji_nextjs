import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDewatermarkRequestBody,
  DEWATERMARK_PLATFORM_ENDPOINT,
  detectDewatermarkPlatform,
} from './dewatermark.ts';

test('detects Kuaishou share URLs and command text', () => {
  assert.equal(detectDewatermarkPlatform('https://v.kuaishou.com/exampleId 复制打开快手'), 'kuaishou');
  assert.equal(detectDewatermarkPlatform('https://www.kuaishou.com/short-video/3xabc'), 'kuaishou');
});

test('routes Kuaishou requests to the Kuaishou backend endpoint', () => {
  assert.equal(DEWATERMARK_PLATFORM_ENDPOINT.kuaishou, '/api/v1/kuaishou/detail');
});

test('builds Kuaishou request body with the shared video preference', () => {
  assert.deepEqual(buildDewatermarkRequestBody('kuaishou', 'https://v.kuaishou.com/exampleId'), {
    url: 'https://v.kuaishou.com/exampleId',
    videoPreference: 'resolution',
  });
});
