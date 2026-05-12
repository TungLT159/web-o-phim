const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const OPHIM_BASE_URL = "https://ophim1.com";
const BUILD_DIR = path.join(__dirname, "build");
const streamTokens = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function createStreamProxyUrl(url) {
  const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  streamTokens.set(token, {
    url,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });
  return `/api/stream?t=${encodeURIComponent(token)}`;
}

function resolveStreamToken(token) {
  const entry = streamTokens.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    streamTokens.delete(token);
    return null;
  }
  return entry.url;
}

function getAbsoluteUrl(value, baseUrl) {
  return new URL(value, baseUrl).toString();
}

function sanitizeMovieItem(item) {
  return {
    ...item,
    episodes: (item.episodes || []).map((server) => ({
      ...server,
      server_data: (server.server_data || []).map((episode) => {
        const { link_m3u8, link_embed, ...safeEpisode } = episode;
        return safeEpisode;
      }),
    })),
  };
}

async function fetchMovie(id) {
  const response = await fetch(`${OPHIM_BASE_URL}/v1/api/phim/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Upstream movie request failed: ${response.status}`);
  }
  return response.json();
}

async function getEpisode(id, episodeName) {
  const data = await fetchMovie(id);
  const episodes = data?.data?.item?.episodes?.flatMap((server) => server.server_data || []) || [];
  return episodes.find((episode) => episode.name === episodeName || episode.slug === episodeName);
}

function rewritePlaylist(body, playlistUrl) {
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      return createStreamProxyUrl(getAbsoluteUrl(trimmed, playlistUrl));
    })
    .join("\n");
}

async function handleMovieDetail(req, res, id) {
  let data;
  try {
    data = await fetchMovie(id);
  } catch (error) {
    sendJson(res, 404, { message: "Movie not found" });
    return;
  }
  if (data?.data?.item) {
    data.data.item = sanitizeMovieItem(data.data.item);
  }
  sendJson(res, 200, data);
}

async function handleEpisode(req, res, id, requestUrl) {
  const episodeName = requestUrl.searchParams.get("name");
  if (!episodeName) {
    sendJson(res, 400, { message: "Missing episode name" });
    return;
  }

  const episode = await getEpisode(id, episodeName);
  if (!episode?.link_m3u8) {
    sendJson(res, 404, { message: "Episode stream not found" });
    return;
  }

  sendJson(res, 200, {
    name: episode.name,
    slug: episode.slug,
    playlistUrl: createStreamProxyUrl(episode.link_m3u8),
  });
}

async function handleStream(req, res, requestUrl) {
  const token = requestUrl.searchParams.get("t");
  if (!token) {
    sendJson(res, 400, { message: "Missing stream token" });
    return;
  }

  const targetUrl = resolveStreamToken(token);
  if (!targetUrl) {
    sendJson(res, 403, { message: "Invalid or expired stream token" });
    return;
  }
  const upstream = await fetch(targetUrl, {
    headers: { "User-Agent": req.headers["user-agent"] || "Mozilla/5.0" },
  });

  if (!upstream.ok) {
    res.writeHead(upstream.status);
    res.end();
    return;
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const isPlaylist = contentType.includes("mpegurl") || targetUrl.includes(".m3u8");

  if (isPlaylist) {
    const body = await upstream.text();
    res.writeHead(200, {
      "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(rewritePlaylist(body, targetUrl));
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=86400",
  });
  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.end(buffer);
}

function serveStatic(req, res) {
  const requestedPath = req.url.split("?")[0];
  const safePath = path.normalize(requestedPath).replace(/^([/\\])+/, "");
  let filePath = path.join(BUILD_DIR, safePath);

  if (!filePath.startsWith(BUILD_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(BUILD_DIR, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Build folder not found. Run npm run build first.");
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieDetailMatch = requestUrl.pathname.match(/^\/api\/phim\/([^/]+)$/);
    const episodeMatch = requestUrl.pathname.match(/^\/api\/phim\/([^/]+)\/episode$/);

    if (movieDetailMatch) {
      await handleMovieDetail(req, res, movieDetailMatch[1]);
      return;
    }

    if (episodeMatch) {
      await handleEpisode(req, res, episodeMatch[1], requestUrl);
      return;
    }

    if (requestUrl.pathname === "/api/stream") {
      await handleStream(req, res, requestUrl);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
