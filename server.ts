import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import mime from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, "nas_storage");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  // Add a welcome file
  fs.writeFileSync(path.join(STORAGE_DIR, "welcome.txt"), "Bienvenido a DroidNAS. Este es tu servidor local.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes (Mimicking Android App Logic) ---

  // Get Server Status & Stats
  app.get("/api/status", async (req, res) => {
    const files = await fs.readdir(STORAGE_DIR);
    let usedInNas = 0;
    for (const file of files) {
      const stats = await fs.stat(path.join(STORAGE_DIR, file));
      usedInNas += stats.size;
    }

    // Simulated device storage stats (Total: 128GB, Used: 110GB, Free: 18GB)
    // We'll simulate a "low space" scenario by default to show the alert logic
    const totalStorage = 128 * 1024 * 1024 * 1024; // 128 GB
    const freeStorage = 18 * 1024 * 1024 * 1024;  // 18 GB (Less than 20GB)
    const usedStorage = totalStorage - freeStorage;

    res.json({
      status: "running",
      ip: "192.168.1.45",
      port: 8080,
      deviceName: "Pixel 7 Pro",
      storageUsed: usedInNas,
      fileCount: files.length,
      uptime: process.uptime(),
      batteryOptimization: "optimized",
      deviceStorage: {
        total: totalStorage,
        used: usedStorage,
        free: freeStorage
      },
      remoteDevices: [
        { id: "remote-1", name: "Galaxy S23 Ultra", ip: "192.168.1.12", status: "online" },
        { id: "remote-2", name: "iPad Pro", ip: "192.168.1.88", status: "online" }
      ]
    });
  });

  // List files with optional subdirectory support
  app.get("/api/files", async (req, res) => {
    try {
      const subPath = (req.query.path as string) || "";
      const targetDir = path.join(STORAGE_DIR, subPath);
      
      // Security check to prevent directory traversal
      if (!targetDir.startsWith(STORAGE_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!fs.existsSync(targetDir)) {
        return res.status(404).json({ error: "Directory not found" });
      }

      const files = await fs.readdir(targetDir);
      const fileDetails = await Promise.all(
        files.map(async (name) => {
          const fullPath = path.join(targetDir, name);
          const stats = await fs.stat(fullPath);
          return {
            name,
            path: path.join(subPath, name),
            size: stats.size,
            mtime: stats.mtime,
            isDir: stats.isDirectory(),
            mimeType: stats.isDirectory() ? "directory" : (mime.lookup(name) || "application/octet-stream")
          };
        })
      );
      
      // Sort: Folders first, then files
      fileDetails.sort((a, b) => {
        if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
        return a.isDir ? -1 : 1;
      });

      res.json(fileDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  // Upload files to specific path
  app.post("/api/upload", upload.array("files"), async (req, res) => {
    try {
      const subPath = (req.query.path as string) || "";
      const targetDir = path.join(STORAGE_DIR, subPath);

      // Security check
      if (!targetDir.startsWith(STORAGE_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!fs.existsSync(targetDir)) {
        await fs.ensureDir(targetDir);
      }

      // Move uploaded files to target directory
      const files = req.files as Express.Multer.File[];
      for (const file of files) {
        const finalPath = path.join(targetDir, file.originalname);
        await fs.move(file.path, finalPath, { overwrite: true });
      }

      res.json({ message: "Files uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Create directory
  app.post("/api/mkdir", async (req, res) => {
    try {
      const { name, path: subPath } = req.body;
      const targetDir = path.join(STORAGE_DIR, subPath || "", name);

      // Security check
      if (!targetDir.startsWith(STORAGE_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }

      await fs.ensureDir(targetDir);
      res.json({ message: "Directory created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create directory" });
    }
  });

  // Download file (using query param for full path)
  app.get("/api/download", (req, res) => {
    const subPath = (req.query.path as string) || "";
    const filePath = path.join(STORAGE_DIR, subPath);
    
    if (!filePath.startsWith(STORAGE_DIR)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // Preview file (using query param for full path)
  app.get("/api/preview", (req, res) => {
    const subPath = (req.query.path as string) || "";
    const filePath = path.join(STORAGE_DIR, subPath);

    if (!filePath.startsWith(STORAGE_DIR)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (fs.existsSync(filePath)) {
      const mimeType = mime.lookup(filePath) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).send("File not found");
    }
  });

  // Delete file/folder (using query param for full path)
  app.delete("/api/files", async (req, res) => {
    try {
      const subPath = (req.query.path as string) || "";
      const filePath = path.join(STORAGE_DIR, subPath);

      if (!filePath.startsWith(STORAGE_DIR)) {
        return res.status(403).json({ error: "Access denied" });
      }

      await fs.remove(filePath);
      res.json({ message: "Item deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // --- Vite middleware for development ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DroidNAS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
