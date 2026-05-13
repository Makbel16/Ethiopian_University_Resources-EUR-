import mongoose from "mongoose";

const { Schema } = mongoose;

export const resourceCategories = [
  "Lecture Notes",
  "Previous Exams",
  "Textbooks/PPTs",
  "Research Papers",
  "Lab Manuals",
  "Reference Links"
];

export const ethiopianUniversities = [
  "Addis Ababa University",
  "Bahir Dar University",
  "Jimma University",
  "Mekelle University",
  "ASTU",
  "Other Ethiopian Universities"
];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    universityName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    yearSemester: { type: String, default: "Year 1 - Semester 1" },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Resource" }]
  },
  { timestamps: true }
);

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: resourceCategories, required: true },
    subject: { type: String, required: true, trim: true },
    yearSemester: { type: String, required: true, trim: true },
    university: { type: String, enum: ethiopianUniversities, required: true },
    fileUrl: { type: String, trim: true },
    externalUrl: { type: String, trim: true },
    thumbnailUrl: { type: String, trim: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    downloadCount: { type: Number, default: 0 },
    weeklyDownloadCount: { type: Number, default: 0 },
    lastDownloadResetAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text", description: "text", subject: "text" });

const downloadSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resource: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    lastDownloadedAt: { type: Date, default: Date.now },
    totalDownloadsByUser: { type: Number, default: 1 }
  },
  { timestamps: true }
);

downloadSchema.index({ user: 1, resource: 1 }, { unique: true });

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const contactMessageSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    resolved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export const Resource = mongoose.model("Resource", resourceSchema);
export const Download = mongoose.model("Download", downloadSchema);
export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
