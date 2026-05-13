import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BlogPost, ContactMessage, Download, Resource, User, ethiopianUniversities, resourceCategories } from "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`)
});
const upload = multer({ storage });

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Missing token" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token user" });
    req.user = user;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: "7d"
  });

const getFileUrl = (req, field) => (req.files?.[field]?.[0] ? `${req.protocol}://${req.get("host")}/uploads/${req.files[field][0].filename}` : null);

app.get("/api/meta", (_req, res) => res.json({ categories: resourceCategories, universities: ethiopianUniversities }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, fullName, universityName, studentId, password, yearSemester } = req.body;
    if (!email || !fullName || !universityName || !studentId || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
    if (existing) return res.status(409).json({ message: "Email or Student ID already exists" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, fullName, universityName, studentId, passwordHash, yearSemester });
    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, fullName, email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        universityName: user.universityName,
        yearSemester: user.yearSemester
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get("/api/profile", auth, async (req, res) => {
  const downloads = await Download.find({ user: req.user._id }).populate("resource").sort({ updatedAt: -1 });
  const user = await User.findById(req.user._id).populate("bookmarks");
  res.json({ user, downloadHistory: downloads });
});

app.post("/api/profile/bookmarks/:resourceId", auth, async (req, res) => {
  const { resourceId } = req.params;
  const exists = req.user.bookmarks.some((id) => id.toString() === resourceId);
  const updated = exists
    ? await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: resourceId } }, { new: true })
    : await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: resourceId } }, { new: true });
  res.json({ bookmarks: updated.bookmarks, bookmarked: !exists });
});

app.post(
  "/api/resources",
  auth,
  adminOnly,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const fileUrl = getFileUrl(req, "file");
      const thumbnailUrl = getFileUrl(req, "thumbnail");
      const created = await Resource.create({ ...req.body, fileUrl, thumbnailUrl, uploadedBy: req.user._id });
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.put("/api/resources/:id", auth, adminOnly, async (req, res) => {
  const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Resource not found" });
  res.json(updated);
});

app.delete("/api/resources/:id", auth, adminOnly, async (req, res) => {
  const removed = await Resource.findByIdAndDelete(req.params.id);
  if (!removed) return res.status(404).json({ message: "Resource not found" });
  res.json({ message: "Resource deleted" });
});

app.get("/api/resources", auth, async (req, res) => {
  const { page = 1, limit = 10, search = "", category, yearSemester, university, subject } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (yearSemester) query.yearSemester = yearSemester;
  if (university) query.university = university;
  if (subject) query.subject = { $regex: subject, $options: "i" };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Resource.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Resource.countDocuments(query)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

app.get("/api/resources/:id", auth, async (req, res) => {
  const item = await Resource.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Resource not found" });
  const related = await Resource.find({
    _id: { $ne: item._id },
    $or: [{ subject: item.subject }, { category: item.category }]
  })
    .sort({ createdAt: -1 })
    .limit(5);
  return res.json({ item, related });
});

app.post("/api/resources/:id/download", auth, async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "Resource not found" });
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (resource.lastDownloadResetAt < weekAgo) {
    resource.weeklyDownloadCount = 0;
    resource.lastDownloadResetAt = now;
  }
  resource.downloadCount += 1;
  resource.weeklyDownloadCount += 1;
  await resource.save();

  await Download.findOneAndUpdate(
    { user: req.user._id, resource: resource._id },
    { $set: { lastDownloadedAt: now }, $inc: { totalDownloadsByUser: 1 } },
    { upsert: true, new: true }
  );

  res.json({ url: resource.externalUrl || resource.fileUrl, downloadCount: resource.downloadCount });
});

app.get("/api/dashboard", auth, async (req, res) => {
  const [recent, popular, weeklyPopular] = await Promise.all([
    Resource.find().sort({ createdAt: -1 }).limit(8),
    Resource.find().sort({ downloadCount: -1 }).limit(5),
    Resource.find().sort({ weeklyDownloadCount: -1 }).limit(10)
  ]);
  const recommendations = await Resource.find({
    $or: [{ yearSemester: req.user.yearSemester }, { university: req.user.universityName }]
  })
    .sort({ downloadCount: -1, createdAt: -1 })
    .limit(6);
  res.json({ recent, popular, weeklyPopular, recommendations });
});

app.get("/api/activity", auth, async (_req, res) => {
  const recent = await Resource.find().sort({ createdAt: -1 }).limit(20);
  res.json(recent);
});

app.post("/api/blog", auth, adminOnly, async (req, res) => {
  const created = await BlogPost.create({ ...req.body, author: req.user._id });
  res.status(201).json(created);
});
app.get("/api/blog", auth, async (_req, res) => res.json(await BlogPost.find().sort({ createdAt: -1 })));
app.put("/api/blog/:id", auth, adminOnly, async (req, res) => res.json(await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete("/api/blog/:id", auth, adminOnly, async (req, res) => res.json(await BlogPost.findByIdAndDelete(req.params.id)));

app.post("/api/contact", auth, async (req, res) => {
  const created = await ContactMessage.create(req.body);
  res.status(201).json({ message: "Message submitted", id: created._id });
});

app.get("/api/contact", auth, adminOnly, async (_req, res) => {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }));
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const bootstrap = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_resource_hub");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@urh.et";
  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 10);
    await User.create({
      email: adminEmail,
      fullName: "Master Admin",
      universityName: "Addis Ababa University",
      studentId: "ADMIN-000",
      passwordHash,
      role: "admin",
      yearSemester: "Year 4 - Semester 2"
    });
    console.log("Seeded default admin account");
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
};

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
