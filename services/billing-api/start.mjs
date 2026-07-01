#!/usr/bin/env node
import { server } from "./server.mjs";

const HOST = process.env.BILLING_API_HOST || "127.0.0.1";
const PORT = Number(process.env.BILLING_API_PORT || 4101);

server.listen(PORT, HOST, () => {
  console.log(`efficientlabs-billing-api listening on http://${HOST}:${PORT}`);
});
