import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

module.exports = fp(async function (fastify: FastifyInstance) {
  fastify.register(require("@fastify/cors"));
});
