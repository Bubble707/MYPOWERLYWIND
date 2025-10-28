import { RequestHandler } from "express";
import { ExtensionRequest, ExtensionRequestResponse } from "@shared/api";

// In-memory storage for demo purposes
// In production, this would be stored in a database
const extensionRequests: (ExtensionRequest & { id: string; confirmationNumber: string })[] = [];

export const handleExtensionRequest: RequestHandler = async (req, res) => {
  try {
    const requestData: ExtensionRequest = req.body;

    // Validate required fields
    if (!requestData.taxYear || !requestData.formType || !requestData.payer) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: taxYear, formType, or payer information"
      } as ExtensionRequestResponse);
    }

    // Validate EIN format
    const einRegex = /^\d{2}-?\d{7}$/;
    if (!einRegex.test(requestData.payer.ein)) {
      return res.status(400).json({
        success: false,
        message: "Invalid EIN format. Must be XX-XXXXXXX"
      } as ExtensionRequestResponse);
    }

    // Generate unique confirmation number
    const confirmationNumber = `EXT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create request ID
    const requestId = `REQ-${Date.now()}`;

    // Store the request (in production, save to database)
    const storedRequest = {
      ...requestData,
      id: requestId,
      confirmationNumber,
    };
    extensionRequests.push(storedRequest);

    console.log('Extension request received:', {
      id: requestId,
      confirmationNumber,
      taxYear: requestData.taxYear,
      formType: requestData.formType,
      payerName: requestData.payer.name,
      requestDate: requestData.requestDate,
    });

    // In production, this would:
    // 1. Validate the payer information against IRS records
    // 2. Generate the appropriate IRS form (e.g., Form 8809)
    // 3. Submit to IRS e-file system
    // 4. Send email confirmation to the payer
    // 5. Store in database with status tracking

    // Return success response
    const response: ExtensionRequestResponse = {
      success: true,
      message: "Your extension request has been successfully submitted to the IRS.",
      confirmationNumber,
      requestId,
    };

    res.json(response);

  } catch (error) {
    console.error('Extension request error:', error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your extension request. Please try again."
    } as ExtensionRequestResponse);
  }
};

export const handleGetExtensionRequests: RequestHandler = async (req, res) => {
  try {
    const { taxYear, ein } = req.query;

    let filtered = extensionRequests;

    if (taxYear) {
      filtered = filtered.filter(req => req.taxYear === taxYear);
    }

    if (ein) {
      filtered = filtered.filter(req => req.payer.ein === ein);
    }

    res.json({
      success: true,
      requests: filtered.map(req => ({
        id: req.id,
        confirmationNumber: req.confirmationNumber,
        taxYear: req.taxYear,
        formType: req.formType,
        payerName: req.payer.name,
        requestDate: req.requestDate,
      })),
    });

  } catch (error) {
    console.error('Error fetching extension requests:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching extension requests"
    });
  }
};
