const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// API Route
app.post('/api/submit-client-form', async (req, res) => {
  try {
    const formData = req.body;
    const DIGIO_API_KEY = process.env.DIGIO_API_KEY;

    if (!DIGIO_API_KEY) {
      return res.status(500).json({
        success: false,
        error: { message: 'Server configuration error' }
      });
    }

    const postData = {
      signers: [
        {
          identifier: formData.email,
          name: formData.clientName,
          sign_type: "aadhaar"
        }
      ],
      expire_in_days: 10,
      send_sign_link: true,
      notify_signers: true,
      will_self_sign: false,
      display_on_page: "custom",
      file_name: `${formData.clientName}.pdf`,
      templates: [
        {
          template_key: "TMP250409085749067X19LUJRRQRYTGK",
          template_values: {
            "client full name": formData.clientName,
            "clientId": formData.clientId || "NA",
            "address": formData.address,
            "dob": formData.dob,
            "pan": formData.pan,
            "email": formData.email
          }
        }
      ]
    };

    const response = await axios.post(
      'https://api.digio.in/v2/client/template/multi_templates/create_sign_request', 
      postData, 
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': DIGIO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || { message: 'Server error' }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Digio API Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});