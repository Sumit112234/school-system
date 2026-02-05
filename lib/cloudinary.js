// Cloudinary configuration and helpers

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Upload image to Cloudinary
export async function uploadImage(file, folder = "school-management") {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "school_management");
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Upload with signed upload (more secure)
export async function uploadImageSigned(base64Data, folder = "school-management") {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature
    const signature = await generateSignature(timestamp, folder);
    
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Generate signature for signed uploads
async function generateSignature(timestamp, folder) {
  const str = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  
  // Create SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex;
}

// Delete image from Cloudinary
export async function deleteImage(publicId) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const str = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    return {
      success: result.result === "ok",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Generate optimized image URL
export function getOptimizedUrl(publicId, options = {}) {
  const { width, height, crop = "fill", quality = "auto", format = "auto" } = options;
  
  let transformations = `q_${quality},f_${format}`;
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  if (crop) transformations += `,c_${crop}`;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

// Get avatar URL with fallback
export function getAvatarUrl(publicId, size = 100) {
  if (!publicId) {
    return `https://ui-avatars.com/api/?size=${size}&background=random`;
  }
  return getOptimizedUrl(publicId, { width: size, height: size, crop: "thumb" });
}
