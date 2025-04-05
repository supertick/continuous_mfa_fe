const BASE_URL = process.env.REACT_APP_API_BASE_URL || `${window.location.origin}/v1`;

let jwtToken = null;

const handleError = (error) => {
  console.error("API Client Error:", error);

  if (error.response?.status === 401) {
    console.warn("Unauthorized request. Redirecting to login...");
    apiClient.clearToken();
    window.location.href = "/#login"; // Adjust based on your app's routing
  }

  throw error; // Re-throw for further handling
};

const logRequest = (method, url, options) => {
  console.info(`HTTP ${method} Request to: ${BASE_URL}${url}`);
  console.info("Options:", options);
};

const apiClient = {
  setToken(token) {
    jwtToken = token;
  },

  clearToken() {
    jwtToken = null;
  },

  generateTimestampId(){
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  },

  async request(method, url, data = null, isForm = false, responseType = null) {
    // Derive response type if not explicitly set
    if (!responseType) {
      // Remove query parameters before processing
      const urlWithoutQuery = url.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop().toLowerCase();
      if (["json"].includes(extension)) {
          responseType = "json";
      } else if (["zip", "png", "jpg", "jpeg", "gif", "pdf", "xlsx"].includes(extension)) {
          responseType = "blob";
      } else if (["txt", "csv", "log", "html", "md"].includes(extension)) {
          responseType = "text";
      } else {
          responseType = "json"; // Default to JSON if unknown
      }
  }
    const headers = {
        ...(responseType !== "blob" && { "Content-Type": isForm ? "application/x-www-form-urlencoded" : "application/json" }),
        ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
    };

    const options = {
        method,
        headers,
        ...(data && { body: isForm ? new URLSearchParams(data).toString() : JSON.stringify(data) }),
    };

    logRequest(method, url, options);

    try {
        const response = await fetch(`${BASE_URL}${url}`, options);

        if (!response.ok) {
            if (response.status === 401) {
                handleError({ response });
            }
            throw new Error(`${method} request to ${url} failed with status ${response.status}`);
        }

        // Handle inferred response types
        switch (responseType) {
            case "json":
                return response.status !== 204 ? await response.json() : null;
            case "blob":
                return await response.blob();
            case "text":
                return await response.text();
            default:
                return response;
        }
    } catch (error) {
        console.error(`Request Error: ${method} ${url}`, error);
        handleError(error);
        throw error; // Re-throw for further handling
    }
},


  get(url, responseType = "json") {
    return this.request("GET", url, null, false, responseType);
  },

  post(url, data) {
    return this.request("POST", url, data);
  },

  postForm(url, data) {
    return this.request("POST", url, data, true);
  },

  put(url, data) {
    return this.request("PUT", url, data);
  },

  delete(url) {
    return this.request("DELETE", url);
  },

  head(url) {
    return this.request("HEAD", url);
  },

  async getRaw(url) {
    try {
      // return this.request("GET", url, null, false, null);
      const response = await this.request("GET", url, null, false, null);
      return response;
    } catch (error) {
      console.error(`Failed to fetch image: ${url}`, error);
      return null;
    }
  },

  /**
   * Fetches an image from the API and returns an object URL for immediate use.
   */
  async getImage(url) {
    try {
      const blob = await this.get(url, "blob");
      if (!blob) return null;
      
      return URL.createObjectURL(blob); // Create and return object URL
    } catch (error) {
      console.error(`Failed to fetch image: ${url}`, error);
      return null;
    }
  }
}  

export default apiClient;
