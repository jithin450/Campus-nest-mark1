const axios = require('axios');

const testSmsApi = async () => {
  try {
    const payload = {
      to: "9492476981",
      message: "Test message from API",
    };

    console.log("Testing SMS API with payload:", payload);

    const response = await axios.post("https://api.smsprovider.com/send", payload);

    console.log("SMS API Response:", response.data);
  } catch (error) {
    console.error("Error testing SMS API:", error);
  }
};

testSmsApi();
