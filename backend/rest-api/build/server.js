"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const account_1 = __importDefault(require("./account"));
const db_connector_1 = __importDefault(require("./db-connector"));
const fastify = (0, fastify_1.default)({
    logger: true
});
fastify.register(account_1.default);
fastify.register(db_connector_1.default);
fastify.listen({ port: 3000 }, function (err) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    // Server is now listening on ${address}
});
