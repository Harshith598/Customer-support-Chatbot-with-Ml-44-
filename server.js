require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./chatbot-support-56600-firebase-adminsdk-tcvjc-7344ca1b51.json');
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://<chatbot-support-56600>.firebaseio.com"
});
const firestore = firebaseAdmin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/tickets', ticketRoutes);

// GPT integration route
app.post('/ask-gpt', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        const gptResponse = response.data.choices[0].message.content;
        
        // Check if the response contains a specific keyword to create a ticket
        console.log('GPT Response:', gptResponse);
        if (gptResponse.toLowerCase().includes('raise a ticket')) {
            // Here, you can customize how you get the ticket details
            const ticketDetails = {
                name: 'User Name', // Replace with actual user info
                email: 'user@example.com', // Replace with actual user info
                subject: 'Ticket Subject', // Customize as needed
                description: prompt // Use the original prompt as ticket description
                
            };console.log('Creating Ticket with Details:', ticketDetails);


            // Call the ticket creation route
            const ticketResponse = await axios.post(
                `${req.protocol}://${req.get('host')}/tickets/create`, ticketDetails);
                console.log('Freshdesk Response:', ticketResponse.data);
            // Append the ticket creation response to the GPT response
            res.json({ response: `${gptResponse} Ticket created: ${ticketResponse.data.ticket.id}` });
        }

        // Save conversation to Firestore
        await firestore.collection('conversations').add({
            prompt: prompt,
            response: gptResponse,
            timestamp: new Date()
        });

        res.json({ response: gptResponse });
    } catch (error) {
        console.error('Error with GPT:', error.message);
        res.status(500).send('Error with GPT API');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
