import "dotenv/config";
import path from "path";
import AutoLoad from "@fastify/autoload";
import { RequestListener, ServerResponse } from "http";
import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "./utils/prisma.ts";

const fastify = require("fastify")({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  serializers: {
    res(reply: FastifyReply) {
      return {
        statusCode: reply.statusCode,
      };
    },
    req(req: FastifyRequest) {
      return {
        method: req.method,
        url: req.url,
        hostname: req.hostname,
        remoteAddress: req.ip,
        remotePort: req.connection.remotePort,
        headers: req.headers,
      };
    },
  },
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins"),
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
});

fastify.addContentTypeParser(
  "*",
  function (req: RequestListener, res: ServerResponse, done: Function) {
    done();
  }
);

fastify
  .listen({
    port: process.env.PORT,
    host: "0.0.0.0",
  })
  .then(async () => {
    prisma
      .$connect()
      .then(() => {
        fastify.log.info("Testing DB Connection. OK");
        prisma.$disconnect();
      })
      .catch(() => fastify.log.error("Can't Connect to DB"));
    fastify.log.info(`Server Listening on Port ${process.env.PORT}`);
  })
  .catch((err: Error) => {
    console.log(err);
    fastify.log.error(err);
  });
