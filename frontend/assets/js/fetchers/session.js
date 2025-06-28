async function createSession() {
    try {
        const response = await fetch('/api/session/log-in-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: localStorage.getItem('uid') // Get the user ID from localStorage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        const data = await response.json();
        window.tokenBoxLink = data.token_box_link; // Store the token in a global variable

    } catch (error) {
        console.error('Error creating session:', error);
        throw error;
    }
}

async function authenticateSession() {
    try {
        const response = await fetch('/api/session/auth-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: localStorage.getItem('uid'), // Get the user ID from localStorage
                token_bok_link: window.tokenBoxLink // Use the token stored in a global variable
            })
        });

        if (!response.ok) {
            throw new Error('Failed to authenticate session');
        }

        const data = await response.json();
        return data.auth; // Return the authenticated session data

    } catch (error) {
        console.error('Error authenticating session:', error);
        throw error;
    }
}

window.logoutSession = async function () {
    try {
        const response = await fetch('/api/session/log-out-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: localStorage.getItem('uid') // Get the user ID from localStorage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to log out session');
        }

        // Clear the token from the global variable
        window.tokenBoxLink = null;

    } catch (error) {
        console.error('Error logging out session:', error);
        throw error;
    }
}

window.keepSession = async function () {
    try {
        const response = await fetch('/api/session/keep-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uid: localStorage.getItem('uid') // Get the user ID from localStorage
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reset session');
        }

    } catch (error) {
        console.error('Error resetting session:', error);
        throw error;
    }
}

export { createSession, authenticateSession };