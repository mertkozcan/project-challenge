const axios = require('axios');

// Test notification creation
async function testNotification() {
    try {
        const response = await axios.post('http://localhost:5000/api/notifications', {
            userId: '1', // Replace with actual user ID
            type: 'GAME_INVITE',
            title: 'Test Bingo Invitation',
            message: 'You have been invited to play Bingo!',
            data: { roomId: 'test-room-123', invitationId: 'test-inv-456' }
        });

        console.log('✅ Notification created:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testNotification();
