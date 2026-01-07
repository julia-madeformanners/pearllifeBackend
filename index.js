
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
const AUTH_TOKEN = process.env.OPP_TOKEN;


const cors = require("cors");
const allowedOrigins = [
  "http://localhost:3000",
  "https://pearllife.netlify.app",
];

const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
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
  const { amount, currency, paymentType } = req.body;
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
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log('❌ SMTP connection error:', error);
      } else {
        console.log('✅ SMTP server is ready to send messages');
      }
    });

    const mailOptions = {
      from: `"Website Payment Notification`,
      to: `${user.email}, meeryawad19@gmail.com`,
      subject: `🧾 Payment Invoice - ${user.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f4f4;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:25px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

            <h2 style="text-align:center;color:#333;margin-bottom:20px;">
              🧾 Payment Invoice<br>
              <span style="font-size:14px;color:#777;">Pearl Life Funeral Services</span>
            </h2>

            <p>Dear <b>${user.name}</b>,</p>
            <p>Thank you for your payment. Below are the details of your transaction:</p>

            <table style="width:100%;border-collapse:collapse;margin-top:15px;">
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>Name</b></td>
                <td style="padding:8px;border:1px solid #ddd;">${user.name}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>Email</b></td>
                <td style="padding:8px;border:1px solid #ddd;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>Phone</b></td>
                <td style="padding:8px;border:1px solid #ddd;">${user.phone}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>1 Person Cremation</b></td>
                <td style="padding:8px;border:1px solid #ddd;">£ ${user.firstOptionValue}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>2 Person Cremation</b></td>
                <td style="padding:8px;border:1px solid #ddd;">£ ${user.secondOptionValue}</td>
              </tr>
              <tr>
                <td style="padding:8px;border:1px solid #ddd;"><b>Extra Amount</b></td>
                <td style="padding:8px;border:1px solid #ddd;">£ ${user.extraValue}</td>
              </tr>
              <tr style="background:#fafafa;">
                <td style="padding:10px;border:1px solid #ddd;"><b>Total Paid</b></td>
                <td style="padding:10px;border:1px solid #ddd;font-size:18px;"><b>£ ${user.amount}</b></td>
              </tr>
            </table>

            <p style="margin-top:20px;">If you have any questions, feel free to contact us.</p>

            <p style="margin-top:30px;text-align:center;color:#777;font-size:12px;">
              Pearl Life Funeral Services — This is an automated invoice.
            </p>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Invoice sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send invoice", error: err.message });
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
