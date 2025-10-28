import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleEfileUpload } from "./routes/efile";
import { 
  handleTestConnection, 
  handleFetchAffiliates, 
  handleImportAffiliates 
} from "./routes/wordpress";
import { handleExtensionRequest, handleGetExtensionRequests } from "./routes/extension-request";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // E-Filing API
  app.post("/api/efile/upload", handleEfileUpload);

  // WordPress Integration API
  app.post("/api/wordpress/test-connection", handleTestConnection);
  app.post("/api/wordpress/fetch-affiliates", handleFetchAffiliates);
  app.post("/api/wordpress/import", handleImportAffiliates);

  // IRS Extension Request API
  app.post("/api/extension-request", handleExtensionRequest);
  app.get("/api/extension-requests", handleGetExtensionRequests);

  return app;
}
