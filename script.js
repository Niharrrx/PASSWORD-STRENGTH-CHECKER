document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const togglePassword = document.getElementById('toggle-password');
    const strengthBar = document.getElementById('strength-bar');
    const feedbackText = document.getElementById('feedback-text');
    
    // Suggestion checklist elements
    const checks = {
        length: document.getElementById('length-check'),
        lowercase: document.getElementById('lowercase-check'),
        uppercase: document.getElementById('uppercase-check'),
        number: document.getElementById('number-check'),
        special: document.getElementById('special-check'),
    };

    // --- Show/Hide Password Toggle ---
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Change icon
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // --- Password Input Event Listener ---
    passwordInput.addEventListener('input', async () => {
        const password = passwordInput.value;
        
        if (password.length === 0) {
            resetUI();
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/strength', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            updateUI(data);

        } catch (error) {
            console.error('Error fetching password strength:', error);
            feedbackText.textContent = 'Error analyzing password.';
        }
    });

    function updateUI(data) {
        const score = data.score;
        const totalPoints = 6; // Max possible score
        const strengthPercent = (score / totalPoints) * 100;

        // 1. Update Strength Bar
        strengthBar.style.width = `${strengthPercent}%`;
        strengthBar.className = 'strength-bar'; // Reset classes
        if (score <= 2) {
            strengthBar.classList.add('weak');
        } else if (score <= 4) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }

        // 2. Update Feedback Text
        feedbackText.textContent = data.feedback;
        feedbackText.style.color = getComputedStyle(strengthBar).backgroundColor;


        // 3. Update Checklist
        for (const check in data.checks) {
            const element = checks[check];
            if (data.checks[check]) {
                element.classList.remove('invalid');
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
                element.classList.add('invalid');
            }
        }
    }

    function resetUI() {
        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        feedbackText.textContent = '';
        Object.values(checks).forEach(element => {
            element.classList.remove('valid', 'invalid');
        });
    }
    
    // Initialize UI state
    resetUI();
});