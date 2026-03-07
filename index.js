export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(await env.ASSETS.fetch(request), {
        headers: { "content-type": "text/html" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
