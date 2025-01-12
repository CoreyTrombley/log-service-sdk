# **log-service-sdk**

An SDK for interacting with your logging service. It integrates seamlessly with [Winston](https://github.com/winstonjs/winston) for structured logging and allows sending logs to your logging service with minimal setup.

---

## **Features**

- Easily integrate with your logging service.
- Supports API token-based authentication.
- Built-in support for [Winston](https://github.com/winstonjs/winston).
- Configurable `applicationId` for grouping logs by application.
- Automatically sends logs to your backend endpoint.

---

## **Installation**

Install the SDK using NPM:

```bash
npm install log-service-sdk
```

---

## **Usage**

### **1. Import and Initialize Logger**

Initialize the logger with your `applicationId`, `apiToken`, and optionally the endpoint URL:

```javascript
const { initializeLogger } = require("log-service-sdk");

// Initialize the logger
const logger = initializeLogger(
  "my-app-id",
  "<your-api-token>",
  "https://your-logging-service.com/logs"
);
```

### **2. Log Messages**

Use the logger to log messages at various levels (`info`, `error`, `warn`, etc.):

```javascript
// Log an informational message
logger.info("User logged in", { userId: "12345" });

// Log an error message
logger.error("An error occurred", { error: "Something went wrong" });
```

---

## **API**

### **`initializeLogger(applicationId, apiToken, endpoint)`**

- **`applicationId`**: A unique identifier for your application (string, required).
- **`apiToken`**: API token for authenticating with the logging service (string, required).
- **`endpoint`**: URL of the logging service endpoint (string, optional, defaults to `http://localhost:5000/logs`).

Returns:

- A configured Winston logger instance.

---

## **Examples**

### **Basic Example**

```javascript
const { initializeLogger } = require("log-service-sdk");

const logger = initializeLogger("my-app", "your-api-token");

// Log various messages
logger.info("This is an info log");
logger.warn("This is a warning");
logger.error("This is an error", { additionalData: "value" });
```

### **Override `applicationId` for Specific Logs**

```javascript
logger.info("Overriding applicationId", { applicationId: "other-app" });
```

---

## **Error Handling**

The SDK handles errors gracefully when sending logs:

- Logs the error to the console using `console.error`.
- Ensures the logging flow is not interrupted even if the backend is unreachable.

---

## **Development**

### **1. Clone the Repository**

```bash
git clone https://github.com/<your-username>/log-service-sdk.git
cd log-service-sdk
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Run Tests**

```bash
npm test
```

---

## **Contributing**

We welcome contributions! Feel free to submit issues and pull requests to improve the SDK.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
