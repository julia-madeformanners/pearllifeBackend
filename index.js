
const express = require('express');
const axios = require('axios');
const http = require("http");
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const BASE_URL = 'https://eu-prod.oppwa.com/';
const ENTITY_ID = process.env.OPP_ENTITY_ID;
const AUTH_TOKEN = process.env.OPP_TOKEN ;


const cors = require("cors");
const allowedOrigins = [
  "http://localhost:3000",
  "https://pearllife.netlify.app",
];

const server = http.createServer(app);

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.post('/create-checkout', async (req, res) => {
  const { amount = '7217.73', currency = 'AED', paymentType = 'DB' } = req.body;
  const params = new URLSearchParams();
  params.append('entityId', ENTITY_ID);
  params.append('amount', amount);
  params.append('currency', currency);
  params.append('paymentType', paymentType);
  
  try {
    const r = await axios.post(`${BASE_URL}/v1/checkouts`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

app.post('/payment-status', async (req, res) => {
  const { resourcePath } = req.body;
  if (!resourcePath) return res.status(400).json({ error: 'resourcePath required' });
  try {
    const r = await axios.get(`${BASE_URL}${resourcePath}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      params: { entityId: ENTITY_ID }
    });
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});
app.post("/payment-notification", async (req, res) => {
   const { user } = req.body; 
  
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.dreamhost.com",
      port: 465,
      secure: true,
      auth: {
        user: "hello@pearllifefuneralservices.com",
        pass: "G6%xY2BGW1%EfXNt"
      }
    });

    const mailOptions = {
      from: `"Website Payment Notification`,
      to: "hello@pearllifefuneralservices.com", 
      subject: `💳 New Payment Received - ${user.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;padding:15px;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#4a4a4a;">💰 New Payment Received</h2>
          <p>Details of the payment made by a user:</p>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td><b>Name:</b></td><td>${user.name}</td></tr>
            <tr><td><b>Email:</b></td><td>${user.email}</td></tr>
            <tr><td><b>Phone:</b></td><td>${user.phone}</td></tr>
            <tr><td><b>Amount Paid:</b></td><td>£ 1495</td></tr>
          </table>
          <p style="margin-top:20px;">
            <small>This is an automated notification — please do not reply.</small>
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Payment notification sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send payment notification", error: err.message });
  }
});

// app.post("/receive-data", (req, res) => {
//   tempUserData = req.body;
//   res.json({ message: "Data received successfully", data: tempUserData });
// });

// app.get("/get-user-data", (req, res) => {
//   res.json(tempUserData);
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
