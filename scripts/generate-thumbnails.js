import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Device-specific viewport configurations
const VIEWPORTS = {
  desktop: {
    width: 1200,
    height: 675,
  },
  mobile: {
    width: 375,
    height: 667,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
};

// Prototype configurations
// Note: Update this array when adding new prototypes
// The 'id' should match the filename in src/labs/data/prototypes.ts
// The 'path' should match the route defined in your router
// The 'deviceType' should match the deviceType in src/labs/data/prototypes.ts
const prototypes = [
  {
    id: "asset-attributes",
    path: "/asset-attributes",
    deviceType: "desktop", // 'desktop' | 'mobile' | 'tablet'
  },
  // Add more prototypes here as they are created
  // Example:
  // {
  //   id: 'my-mobile-prototype',
  //   path: '/my-mobile-prototype',
  //   deviceType: 'mobile',
  // },
];

// Configuration
const RENDER_DELAY = 1500; // Wait for animations and data to load
const SERVER_PORT = 5173;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

async function startDevServer() {
  console.log("Starting Vite dev server...");

  return new Promise((resolve, reject) => {
    const server = spawn("npx", ["vite", "--port", SERVER_PORT.toString()], {
      cwd: join(__dirname, ".."),
      stdio: "pipe",
    });

    server.stdout.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Local:") || output.includes("ready in")) {
        console.log("Dev server is ready");
        // Give it a moment to be fully ready
        setTimeout(() => resolve(server), 2000);
      }
    });

    server.stderr.on("data", (data) => {
      console.error(`Server error: ${data}`);
    });

    server.on("error", (error) => {
      reject(error);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error("Server startup timeout"));
    }, 30000);
  });
}

async function generateThumbnail(browser, prototype) {
  const deviceType = prototype.deviceType || "desktop";
  const viewport = VIEWPORTS[deviceType];

  console.log(`Generating thumbnail for: ${prototype.id} (${deviceType})`);

  const page = await browser.newPage();

  try {
    // Set viewport size based on device type
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 2, // For retina/high-DPI displays
    });

    // Navigate to the prototype with thumbnail parameter to hide the banner
    const url = `${BASE_URL}${prototype.path}?thumbnail=true`;
    console.log(`  Navigating to: ${url}`);

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for additional rendering time
    await new Promise((resolve) => setTimeout(resolve, RENDER_DELAY));

    // Hide elements with data-thumbnail-hide attribute (as a CSS backup)
    await page.evaluate(() => {
      const elementsToHide = document.querySelectorAll(
        '[data-thumbnail-hide="true"]'
      );
      elementsToHide.forEach((el) => {
        el.style.display = "none";
      });
    });

    // Ensure output directory exists
    const outputDir = join(__dirname, "..", "public", "thumbnails");
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Take screenshot
    const outputPath = join(outputDir, `${prototype.id}.png`);
    await page.screenshot({
      path: outputPath,
      type: "png",
    });

    console.log(`  ✓ Saved to: ${outputPath}`);
  } catch (error) {
    console.error(
      `  ✗ Error generating thumbnail for ${prototype.id}:`,
      error.message
    );
    throw error;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("=== Prototype Thumbnail Generator ===\n");

  let server = null;
  let browser = null;

  try {
    // Start dev server
    server = await startDevServer();

    // Launch browser
    console.log("\nLaunching headless browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("\nGenerating thumbnails...\n");

    // Generate thumbnails for each prototype
    for (const prototype of prototypes) {
      await generateThumbnail(browser, prototype);
    }

    console.log(`\n✓ Successfully generated ${prototypes.length} thumbnail(s)`);
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (browser) {
      console.log("\nClosing browser...");
      await browser.close();
    }

    if (server) {
      console.log("Stopping dev server...");
      server.kill();
      // Give it a moment to cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\nDone!\n");
  }
}

main();
