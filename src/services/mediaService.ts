import apiClient from "./apiClient";
import axios from "axios";

export const mediaService = {
  streamVideo: (videoId: string) => {
    return `${apiClient.defaults.baseURL}/media/stream/${videoId}`;
  },

  uploadMedia: async (file: File, folder?: string) => {
    // 1. Get presigned upload URL from backend
    const presignResponse = await apiClient.post("/media/presigned-url", {
      fileName: file.name,
      contentType: file.type,
      folder,
    });

    const { uploadUrl, publicUrl, key, method, headers } = presignResponse.data.data;

    // 2. Perform the upload to the URL
    if (uploadUrl.startsWith("/")) {
      // Local fallback: must send withCredentials to pass jwtMiddleware on local router
      const url = `${apiClient.defaults.baseURL}${uploadUrl}`;
      await apiClient({
        method,
        url,
        data: file,
        headers: {
          ...headers,
          "Content-Type": file.type, // ensure correct content-type
        },
      });
    } else {
      // S3 upload: use plain axios to avoid sending backend session cookies or custom headers
      await axios({
        method,
        url: uploadUrl,
        data: file,
        headers: {
          ...headers,
          "Content-Type": file.type, // S3 signature expects the exact Content-Type
        },
      });
    }

    // Return wrapper mimicking AxiosResponse to keep compatibility with admin-portal forms:
    // res.data.data.url -> publicUrl
    return {
      data: {
        message: "File uploaded successfully",
        data: {
          url: publicUrl,
          key,
        },
      },
    };
  },
};

export default mediaService;
