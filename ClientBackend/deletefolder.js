import cloudinary from "./config/cloudinary.js";

async function deleteFolder(folderPath) {
  try {
    // 1️⃣ List all resources in the folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath, // e.g. "rejected-approvals/"
      max_results: 500,   // max 500 per request
    });

    if (resources.resources.length === 0) {
      console.log("Folder already empty");
      return;
    }

    // 2️⃣ Collect public_ids
    const publicIds = resources.resources.map(r => r.public_id);

    // 3️⃣ Delete all resources
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log("Deleted resources:", result);
  } catch (err) {
    console.error("Failed to delete folder:", err);
  }
}
