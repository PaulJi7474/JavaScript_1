// Base URL for the Interview App RESTful API
const API_BASE_URL = "https://comp2140a2.uqcloud.net/api";

// JWT token for authorization, replace with your actual token from My Grades in Blackboard
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4NDkxMjMifQ.zloDtPVIpdCxmfBWaTQDJHt6kJHIz3xqY1sfZ4ZYElA";

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = "s4849123";

/**
 * Helper function to handle API requests.
 * It sets the Authorization token and optionally includes the request body.
 */
export async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`,
    },
  };

  if (method === "POST" || method === "PATCH") {
    options.headers.Prefer = "return=representation";
  }

  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json();
}

/**
 * Function to insert a new interview into the database.
 */
export function createInterview(interview) {
  return apiRequest("/interview", "POST", interview);
}

/**
 * Function to list all interviews associated with the current user.
 */
export function getInterviews() {
  return apiRequest("/interview");
}

/**
 * Function to get a single interview by its ID.
 */
export function getInterview(id) {
  return apiRequest(`/interview?id=eq.${id}`);
}

/**
 * Function to update an interview by its ID.
 */
export function updateInterview(id, interview) {
  return apiRequest(`/interview?id=eq.${id}`, "PATCH", interview);
}

/**
 * Function to delete an interview by its ID.
 */
export function deleteInterview(id) {
  return apiRequest(`/interview?id=eq.${id}`, "DELETE");
}

/**
 * Example driver to demonstrate API usage with the helper utilities.
 */
// export async function main() {
//   try {
//     const newInterview = {
//       title: "Front-end Developer Interview",
//       job_role: "Mid-level Front-end Developer",
//       description:
//         "Interview focusing on React, JavaScript fundamentals, and responsive design principles.",
//       status: "Draft",
//     };
//     const createdInterview = await createInterview(newInterview);
//     console.log("Created Interview:", createdInterview);

//     const allInterviews = await getInterviews();
//     console.log("All Interviews:", allInterviews);

//     if (allInterviews.length > 0) {
//       const singleInterview = await getInterview(allInterviews[0].id);
//       console.log("Single Interview:", singleInterview);
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// }