import "dotenv/config";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie, { type FastifyCookieOptions } from "@fastify/cookie";
import fastifyCompress from "@fastify/compress";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import fastifyMultipart from "@fastify/multipart";
import type { FastifyMultipartBaseOptions } from "@fastify/multipart";

import type { MultipartFile } from "fastify-multipart";

// use for jwt secret token
const jwtSecretToken = process.env.JWT_SECRET_KEY;

// use for cookie secret token
const cookieSecretToken = process.env.COOKIE_SECRET_KEY;

// check if there is a secret token for jwt

if (!jwtSecretToken) {
  console.error("JWT_SECRET is not defined");
  process.exit(1);
}

// check if there is a secret token for cookie
if (!cookieSecretToken) {
  console.error("COOKIE_SECRET is not defined");
  process.exit(1);
}

// Initialize Fastify server with logging enabledn
const server = Fastify({ logger: true });

// Register file upload handling with fastifyMultipart

// fastifyCompress only Compress if the payload is above a certain size
server.register(fastifyCompress, {
  global: false,
  encodings: ["gzip"],
  threshold: 128,
  customTypes: /^application\/json$|^test\//,
});

// fastifyStatic for files like PDFs and images from the 'files' directory
server.register(fastifyStatic, {
  root: path.join(process.cwd(), "files"),
  prefix: "/uploads/",
  cacheControl: true,
  maxAge: "1h",
  immutable: true,
});

// Register CORS plugin to allow cross-origin requests
server.register(fastifyCors, { origin: true, credentials: true });

// fastifyCookie register
server.register(fastifyCookie, {
  secret: cookieSecretToken,
  hook: "onRequest",
  parseOptions: {},
} as FastifyCookieOptions);

// jwt register
server.register(fastifyJwt, {
  secret: jwtSecretToken,
  cookie: {
    cookieName: "authToken", // name of the cookie to store the token
    signed: true, // Indicate that the cookie should be signed
  },
});

// Decorator for authenticating users with a valid JWT
server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ message: "Authentication required" });
    }
  }
);

// all routes

// server welcome page
server.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
  reply.send({ message: "creation de wany server" });
});

// Start the server and initialize the database connection
const start = async () => {
  try {
    await server.listen({ port: 3185, host: "0.0.0.0" });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};
start();
