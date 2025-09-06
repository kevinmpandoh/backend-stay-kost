import "dotenv/config";
import "./jobs/subscription.job";
import { connectDB } from "./config/db";
import logger from "./config/logger";

import { env } from "./config/env";
import { server } from "./socket";
import { startJobs } from "./jobs";

const port = env.PORT || 8000;

async function start() {
  await connectDB(env.MONGO_URI);
  server.listen(port, () => logger.info(`Server running on port ${port}`));
  (async () => {
    await startJobs();
  })();
}

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
