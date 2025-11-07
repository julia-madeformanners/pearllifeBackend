
const express = require('express');
const axios = require('axios');
const http = require("http");
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
  "https://pearllife.netlify.app"

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
  const { amount = '1', currency = 'AED', paymentType = 'DB' } = req.body;
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
