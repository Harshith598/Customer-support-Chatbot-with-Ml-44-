async function sendMessage() {
    const input = document.getElementById('chat-input').value;
    if (!input) return;

    const chatOutput = document.getElementById('chat-output');

    // Append user's message to the chat (right-aligned)
    chatOutput.innerHTML += `
        <div class="message user-message">
            <p><strong>You:</strong> ${input}</p>
        </div>
    `;

    if (input.toLowerCase().includes('raise a ticket')) {
        const ticketDetails = {
            name: 'User Name', // Replace with actual user data
            email: 'user@example.com', // Replace with actual user email
            subject: 'Ticket Subject', // Customize subject if needed
            description: input // Use the input as the ticket description
        };

        try {
            const ticketResponse = await fetch('http://localhost:3000/tickets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketDetails)
            });

            const ticketData = await ticketResponse.json();

            if (ticketData.ticket && ticketData.ticket.id) {
                // Ticket successfully created, show response on the left
                chatOutput.innerHTML += `
                    <div class="message system-message">
                        <p><strong>System:</strong> Ticket created: ${ticketData.ticket.id}</p>
                    </div>
                `;
            } else {
                chatOutput.innerHTML += `
                    <div class="message system-message">
                        <p><strong>System:</strong> Error creating ticket. Please try again.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            chatOutput.innerHTML += `
                <div class="message system-message">
                    <p><strong>System:</strong> Error creating ticket. Please try again later.</p>
                </div>
            `;
        }
    } else {
        try {
            const response = await fetch('http://localhost:3000/ask-gpt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: input })
            });

            const data = await response.json();
            // Append GPT response to the chat (left-aligned)
            chatOutput.innerHTML += `
                <div class="message gpt-message">
                    <p><strong>GPT:</strong> ${data.response}</p>
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
            chatOutput.innerHTML += `
                <div class="message system-message">
                    <p><strong>System:</strong> Error communicating with GPT. Please try again later.</p>
                </div>
            `;
        }
    }

    document.getElementById('chat-input').value = '';
    chatOutput.scrollTop = chatOutput.scrollHeight; // Auto-scroll to the bottom
}
