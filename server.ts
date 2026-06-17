import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs/promises";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { createClient } from "redis";

dotenv.config();

const app = express();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
let isRedisConnected = false;
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("ready", () => { isRedisConnected = true; });

// In-memory fallback if Redis is not available
const memoryOtpStore = new Map<string, { otp: string; expiresAt: number }>();


const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many OTP requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const geminiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: "Too many AI requests from this IP, please try again later." },
});

const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { error: "Too many API requests, please try again later." },
});

let transporter: nodemailer.Transporter | null = null;
async function getTransporter() {
  if (!transporter) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn("Using ethereal test account for email. Configure SMTP variables for production.");
      const account = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
    }
  }
  return transporter;
}

let bootError: any = null;

// Middleware to report boot-time crashes directly in API responses
app.use((req, res, next) => {
  if (bootError) {
    return res.status(500).json({
      error: "Server boot error",
      message: bootError.message,
      stack: bootError.stack,
    });
  }
  next();
});

try {
  // Connect to Redis for OTP storage
  redisClient.connect().catch(console.error);

  app.use(express.json({ limit: "25mb" }));

  let aiClient: GoogleGenAI | null = null;
  function getAIClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure your key in settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Razorpay client
  let razorClient: Razorpay | null = null;
  function getRazorClient() {
    if (!razorClient) {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not defined in environment.");
      }
      razorClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    return razorClient;
  }

  // API endpoints
  app.get("/api/health", generalApiRateLimiter, (req, res) => {
    res.json({ status: "ok", message: "BlueBottleCap backend active" });
  });

  app.post("/api/gemini/generate-roadmap", geminiRateLimiter, async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Valid prompt is required" });
      }

      const ai = getAIClient();
      const systemPrompt = `You are an expert academic counselor and course architect. Create a realistic, 5-to-8 step chronological learning roadmap for the following topic/goal: "${prompt}". 
      Return the result STRICTLY as a JSON object containing two keys: "nodes" and "coincidingGroups".
      "nodes" must be an array of objects where each object has:
      - "id": a unique string like "n-1"
      - "title": a short, punchy title for the step
      - "description": a 1-sentence description of what to study
      - "status": string "completed" for the first node, "current" for the second node, and "locked" for the rest
      - "duration": a string like "Week 1", "Week 2-3", or "Month 1"
      "coincidingGroups" must be an array of 2 to 4 objects representing mock peer study groups related to the topic, where each object has:
      - "id": a unique string like "g-1"
      - "name": a fun, creative name for the study group (e.g. "React Masters", "Chemistry Connoisseurs")
      - "avatar": a single relevant emoji
      - "members": a random integer between 3 and 40
      - "currentNodeId": the id of one of the nodes (e.g., "n-2")

      Do NOT wrap the response in markdown blocks like \`\`\`json. Return pure JSON only.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      });

      let responseText = response.text || "{}";
      
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini roadmap generation error:", err);
      return res.status(500).json({ error: "Failed to generate roadmap" });
    }
  });

  app.post("/api/gemini/summarize", geminiRateLimiter, async (req, res) => {
    try {
      const { text, focus } = req.body;
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "Text is required for summarization." });
      }

      const client = getAIClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Please summarize the following text. Key focus area: ${focus || "general study summary"}.
Format the summary in clean, readable markdown with this structure:
- **Core Summary Header** (Bold title summarizing the theme)
- **Executive Summary** (1-2 clear sentences explaining the core argument)
- **Key Takeaways & Core Concepts** (Detailed bullet points with bold sub-terms)
- **Logical Map / Argument Hierarchy** (Structured indented breakdown of arguments)
- **Critical Spark Questions** (2-3 thought-provoking study questions for discussion)

Text to summarize:
${text}`,
      });

      res.json({ summary: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during summarization." });
    }
  });

  app.post("/api/gemini/chat", geminiRateLimiter, async (req, res) => {
    try {
      const { messages, paperContext, highlightedText } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      const client = getAIClient();

      let systemInstruction = "You are BlueBottleCap Co-Pilot, an advanced academic AI assistant. You help students understand research papers, complex mathematics, visual homework equations, and coding problems. Provide direct, informative, encouraging, and detailed study assistance. Format all math notation with clear standard text or Markdown LaTeX formats.";
      if (paperContext) {
        systemInstruction += `\n\nActive Scientific Paper Content:\n${paperContext}`;
      }
      if (highlightedText) {
        systemInstruction += `\n\nHighlighted text selection by user:\n"${highlightedText}"`;
      }

      const contents = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during chat conversation." });
    }
  });

  app.post("/api/gemini/analyze-image", geminiRateLimiter, async (req, res) => {
    try {
      const { imageBase64, prompt, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data (base64) is required." });
      }

      const client = getAIClient();

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/png",
          data: imageBase64,
        },
      };

      const textPart = {
        text: prompt || "Analyze this science diagram, homework page, handwritten formula, or visual concept. Walk through the explanation step-by-step and provide a structured, mathematically rigorous answer in beautiful Markdown.",
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] },
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during image visual analysis." });
    }
  });

  app.post("/api/jee/analyze-solution", geminiRateLimiter, async (req, res) => {
    try {
      const {
        questionId,
        questionText,
        correctAnswer,
        detailedSolution,
        studentTypedSteps,
        studentImage,
      } = req.body;

      const client = getAIClient();

      const parts: any[] = [];

      // System Prompt
      const systemInstruction = `You are a world-class IIT-JEE Socratic Teacher/Mentor. 
Your goal is to audit a student's handwritten rough-work photo or typed steps to help them solve a past year JEE exam question.
CRITICAL RULES:
1. Act Socratically: DO NOT output the final answer or option letter (e.g., A, B, C, D) under any circumstances.
2. Identify the Mistake: Analyze the student's steps and locate exactly where they went wrong (e.g., sign error, wrong formula, calculation mistake, incorrect boundary conditions, physics assumption flaw).
3. Guide the Student: Point out the incorrect step gently, explain WHY it is wrong conceptually, and provide a small clue or hint to guide them toward the correct derivation path.
4. Be brief, encouraging, and clear. Use bold text for core concept names.`;

      let prompt = `Here is the JEE Question the student is trying to solve:
"${questionText}"

Correct Answer (for your reference only - do not reveal): Option ${correctAnswer}
Detailed Correct Solution (for your reference only - do not reveal):
${detailedSolution}

Student's Attempted Steps:
${studentTypedSteps || "[Student did not type any text steps]"}
`;

      if (studentImage && studentImage.startsWith("data:")) {
        // Extract base64 and mime type
        const commaIdx = studentImage.indexOf(",");
        if (commaIdx !== -1) {
          const mimePart = studentImage.substring(0, commaIdx);
          const base64Data = studentImage.substring(commaIdx + 1);
          const mimeMatch = mimePart.match(/data:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }

      parts.push({ text: prompt });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          systemInstruction,
        },
      });

      res.json({ feedback: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "An error occurred during solution analysis." });
    }
  });

  app.post("/api/auth/send-otp", otpRateLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (isRedisConnected) {
        // Store in Redis with an expiry of 10 minutes (600 seconds)
        await redisClient.setEx(`otp:${email.toLowerCase()}`, 600, otp);
      } else {
        // Fallback to memory
        memoryOtpStore.set(`otp:${email.toLowerCase()}`, {
          otp,
          expiresAt: Date.now() + 600 * 1000,
        });
      }

      const mailer = await getTransporter();
      const info = await mailer.sendMail({
        from: '"BlueBottleCap Team" <no-reply@bluebottlecap.com>',
        to: email,
        subject: "Your Sign-Up Verification Code",
        text: `Your OTP is: ${otp}`,
        html: `<b>Your OTP is: ${otp}</b><br/>It expires in 10 minutes.`,
      });

      console.log("OTP sent to:", email);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

      res.json({ success: true, message: "OTP sent" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", otpRateLimiter, async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP are required." });
      }

      let record: string | null = null;
      const key = `otp:${email.toLowerCase()}`;

      if (isRedisConnected) {
        record = await redisClient.get(key);
      } else {
        const memEntry = memoryOtpStore.get(key);
        if (memEntry && memEntry.expiresAt > Date.now()) {
          record = memEntry.otp;
        } else if (memEntry) {
          memoryOtpStore.delete(key);
        }
      }

      if (!record) {
        return res.status(400).json({ error: "No OTP found for this email or it has expired. Please request a new one." });
      }

      if (record === otp) {
        if (isRedisConnected) {
          await redisClient.del(key);
        } else {
          memoryOtpStore.delete(key);
        }
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: "Invalid OTP." });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to verify OTP" });
    }
  });

  // Razorpay create order endpoint
  app.post("/api/razorpay/create-order", generalApiRateLimiter, async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      if (!amount || typeof amount !== "number") {
        return res.status(400).json({ error: "Amount (number, in paise) is required." });
      }
      const razor = getRazorClient();
      const order = await razor.orders.create({
        amount,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
      } as any);
      res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Failed to create Razorpay order." });
    }
  });

  // Razorpay payment verification (client posts payment details after success)
  app.post("/api/razorpay/verify", generalApiRateLimiter, (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing payment verification fields." });
      }
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
      const generated_signature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      const isValid = generated_signature === razorpay_signature;
      if (isValid) {
        // persist payment record and optionally fetch payment details
        (async () => {
          try {
            const paymentsFile = path.join(process.cwd(), "data", "payments.json");
            let payments: any[] = [];
            try {
              const raw = await fs.readFile(paymentsFile, "utf8");
              payments = JSON.parse(raw || "[]");
            } catch (e) {
              payments = [];
            }

            // attempt to fetch payment details from Razorpay for more info
            let paymentDetails: any = { id: razorpay_payment_id, order_id: razorpay_order_id };
            try {
              const razor = getRazorClient();
              // @ts-ignore
              paymentDetails = await razor.payments.fetch(razorpay_payment_id);
            } catch (e) {
              // ignore fetch errors
            }

            payments.push({
              id: razorpay_payment_id,
              order_id: razorpay_order_id,
              signature: razorpay_signature,
              verifiedAt: new Date().toISOString(),
              details: paymentDetails,
            });

            await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
            await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2), "utf8");
          } catch (e) {
            console.error("Failed to persist payment:", e);
          }
        })();

        return res.json({ ok: true });
      }
      return res.status(400).json({ error: "Invalid signature" });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Verification failed" });
    }
  });

  // Analytics endpoint to track UI events
app.post("/api/track", generalApiRateLimiter, async (req, res) => {
  try {
    const { event, metadata } = req.body;
    if (!event) {
      return res.status(400).json({ error: "Event name required" });
    }
    const eventsFile = path.join(process.cwd(), "data", "events.json");
    let events = [];
    try {
      const raw = await fs.readFile(eventsFile, "utf8");
      events = JSON.parse(raw || "[]");
    } catch (e) {
      events = [];
    }
    events.push({ event, metadata: metadata || {}, timestamp: new Date().toISOString() });
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
    await fs.writeFile(eventsFile, JSON.stringify(events, null, 2), "utf8");
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log event" });
  }
});

// Razorpay webhook endpoint (expects raw body for signature verification)
  app.post(
    "/api/razorpay/webhook",
    generalApiRateLimiter,
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"] as string | undefined;
        const body = (req.body as Buffer).toString("utf8");
        if (!webhookSecret || !signature) {
          return res.status(400).json({ error: "Webhook secret or signature missing" });
        }

        const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
        if (expected !== signature) {
          console.warn("Invalid webhook signature");
          return res.status(400).json({ error: "Invalid signature" });
        }

        const event = JSON.parse(body);

        // persist webhook event
        try {
          const paymentsFile = path.join(process.cwd(), "data", "payments.json");
          let payments: any[] = [];
          try {
            const raw = await fs.readFile(paymentsFile, "utf8");
            payments = JSON.parse(raw || "[]");
          } catch (e) {
            payments = [];
          }
          payments.push({ webhookReceivedAt: new Date().toISOString(), event });
          await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
          await fs.writeFile(paymentsFile, JSON.stringify(payments, null, 2), "utf8");
        } catch (e) {
          console.error("Failed to persist webhook event:", e);
        }

        // respond quickly
        res.json({ ok: true });
      } catch (e: any) {
        console.error("Webhook handler error:", e);
        res.status(500).json({ error: e.message || "Webhook processing failed" });
      }
    }
  );

} catch (err: any) {
  bootError = err;
  console.error("Boot error:", err);
}

// Global error handler for uncaught runtime exceptions
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error handler caught:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: err.stack,
  });
});

// For local development running outside of Vercel
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express API backend listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
