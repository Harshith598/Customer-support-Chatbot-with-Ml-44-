const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/create', async (req, res) => {
    const { name, email, subject, description } = req.body;

    try {
        const response = await axios.post(
            `https://${process.env.FRESHDESK_DOMAIN}/api/v2/tickets`,
            {
                name: name,
                email: email,
                subject: subject,
                description: description,
                status: 2, // Status: Open
                priority: 1 // Priority: Low
            },
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(process.env.FRESHDESK_API_KEY + ':X').toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Freshdesk Ticket Created:', response.data);
        res.json({ message: 'Ticket created successfully!', ticket: response.data });
    } catch (error) {
        console.error('Freshdesk API Error:', error.response?.data); // Log the response data
        console.error('Error creating ticket:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error creating ticket' });
    }
});

// Make sure to export the router
module.exports = router;
