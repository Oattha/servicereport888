import axios from "axios";
import { BACKEND_URL } from "../utils/config";

export async function scanDocument(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BACKEND_URL}/api/ocr/scan`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 90000,
    },
  );

  return response.data;
}
