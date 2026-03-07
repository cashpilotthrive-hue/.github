export default {
  async fetch(request, env, ctx) {
    return new Response('Personal Linux Setup CI - shy-base-82d5 running', {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
