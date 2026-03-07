export default {
  async fetch(request, env, ctx) {
    return new Response("Personal Linux Setup - CI Entrypoint", {
      headers: { "content-type": "text/plain" },
    });
  },
};
