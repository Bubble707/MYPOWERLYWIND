import { RequestHandler } from "express";
import {
  EfileUploadRequest,
  EfileUploadResponse,
  generateAscii,
} from "../../shared/api";

// In-memory capture (non-persistent) to simulate a DB write during this session
const memoryStore: { transmissions: EfileUploadRequest[] } = { transmissions: [] };

export const handleEfileUpload: RequestHandler = (req, res) => {
  try {
    const payload = req.body as EfileUploadRequest;

    // Basic validation
    if (!payload?.issuerData || !payload?.payeeData || !payload?.formType) {
      return res.status(400).json({ success: false, trackingId: "", message: "Invalid payload" } as EfileUploadResponse);
    }

    // Simulate save (replace with real DB using Supabase/Neon MCP for production)
    memoryStore.transmissions.push(payload);

    // Generate ASCII (server-side copy)
    const ascii = generateAscii(payload.transmitterData, payload.issuerData, payload.payeeData, payload.formType);

    // Simulate e-filing submission by creating a tracking id
    const trackingId = `TRK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // For observability (no secrets logged)
    // console.log({ trackingId, asciiPreview: ascii.slice(0, 200) });

    const response: EfileUploadResponse = {
      success: true,
      trackingId,
      message: "E-Filing submitted successfully",
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ success: false, trackingId: "", message: "Server error" } as EfileUploadResponse);
  }
};
