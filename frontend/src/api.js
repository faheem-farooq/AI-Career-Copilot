import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/_backend" : "http://127.0.0.1:9000");

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_URL}/upload/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

export const analyzeResume = async (resumeText, jobDescription) => {
  const response = await axios.post(`${API_URL}/analyze/`, {
    resume_text: resumeText,
    job_description: jobDescription
  });

  return response.data;
};

export const generateCoverLetter = async (resumeText, jobDescription) => {
  const response = await axios.post(`${API_URL}/cover-letter/`, {
    resume_text: resumeText,
    job_description: jobDescription
  });

  return response.data;
};
