const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
  info: {
    title: 'Vendor API',
    description: 'Auto-generated API Documentation for Vercel',
    version: '1.0.0'
  },
  host: null, // Vercel detects this automatically
  schemes: ['https', 'http'],
  definitions: {
    // Manually define your Address model structure here for the UI
    Address: {
      customer: "64f1a2b3c4d5e6f7a8b9c0d1",
      fullName: "John Doe",
      phone: "9876543210",
      pincode: "110001",
      state: "Delhi",
      city: "New Delhi",
      area: "Connaught Place",
      houseNo: "Flat 101",
      landmark: "Near Metro Station"
    }
  }
};

const outputFile = path.join(__dirname, 'swagger-output.json');
const endpointsFiles = [path.join(__dirname, 'server.js')]; // Point to your server.js

swaggerAutogen(outputFile, endpointsFiles, doc);