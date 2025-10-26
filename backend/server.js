import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// ==== Config ====
const PORT = process.env.PORT || 8080;
// Allow your Vite dev server (5173) and anything else you need
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(s => s.trim());
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

// ==== Middleware ====
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Basic rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// ==== In-memory user store (demo only) ====
// Structure: { email -> { email, passwordHash, createdAt } }
const users = new Map();

// Helper: issue JWT
function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Auth middleware
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid or expired token" });
  }
}

// ==== Routes ====

// Health
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "canfind-api", ts: Math.floor(Date.now() / 1000) });
});

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, message: "Email and password required" });
    if (users.has(email)) return res.status(409).json({ ok: false, message: "User already exists" });

    // Basic checks
    const validEmail = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    if (!validEmail) return res.status(400).json({ ok: false, message: "Invalid email" });
    if (password.length < 6) return res.status(400).json({ ok: false, message: "Password too short (min 6)" });

    const passwordHash = await bcrypt.hash(password, 10);
    users.set(email, { email, passwordHash, createdAt: new Date().toISOString() });

    const token = issueToken({ sub: email });
    res.status(201).json({ ok: true, user: { email }, token });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Signup failed", error: String(err?.message || err) });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, message: "Email and password required" });

    const record = users.get(email);
    if (!record) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, record.passwordHash);
    if (!match) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const token = issueToken({ sub: email });
    res.json({ ok: true, user: { email }, token });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Login failed", error: String(err?.message || err) });
  }
});

// Current user
app.get("/api/auth/me", requireAuth, (req, res) => {
  const email = req.user?.sub;
  if (!email || !users.has(email)) return res.status(404).json({ ok: false, message: "User not found" });
  res.json({ ok: true, user: { email } });
});

// ==== Start ====
app.listen(PORT, () => {
  console.log(`canfind-api listening on http://localhost:${PORT}`);
});
