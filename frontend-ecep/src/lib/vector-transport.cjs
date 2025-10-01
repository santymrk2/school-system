'use strict';

const { Writable } = require('node:stream');

const defaultHeaders = {
  'content-type': 'application/json',
};

function toPayload(chunk) {
  if (typeof chunk === 'string') {
    return chunk;
  }

  if (Buffer.isBuffer(chunk)) {
    return chunk.toString('utf8');
  }

  return JSON.stringify(chunk);
}

async function send(endpoint, headers, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: payload,
  });

  if (!response.ok) {
    await response.arrayBuffer().catch(() => undefined);
    throw new Error(`Vector responded with status ${response.status}`);
  }
}

module.exports = function vectorTransport(opts = {}) {
  const endpoint = opts.endpoint ?? 'http://localhost:9000/logs';
  const headers = { ...defaultHeaders, ...(opts.headers ?? {}) };

  return new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      const payload = toPayload(chunk);

      Promise.resolve()
        .then(() => send(endpoint, headers, payload))
        .then(() => callback(), (error) => {
          // eslint-disable-next-line no-console
          console.error('Vector transport failed', error);
          callback();
        });
    },
  });
};
