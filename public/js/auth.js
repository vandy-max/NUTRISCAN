document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');

    // Determine which form to show based on URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'signup') {
        showSignup();
    } else {
        showLogin();
    }

    // Login form submission
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const result = await window.nutriScanAPI.login(email, password); // Use the new API method

            if (result.success) {
                showAlert('Login successful! Redirecting...', 'success');
                window.location.href = result.redirect;
            } else {
                showAlert(result.message || 'Invalid credentials.', 'danger');
            }
        });
    }

    // Signup form submission
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showAlert('Passwords do not match.', 'warning');
                return;
            }

            const result = await window.nutriScanAPI.register(username, email, password); // Use the new API method

            if (result.success) {
                showAlert('Registration successful! Redirecting...', 'success');
                window.location.href = result.redirect;
            } else {
                showAlert(result.message || 'Registration failed.', 'danger');
            }
        });
    }
});

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
}

function showSignup() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
}

function showAlert(message, type = 'danger') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;

    let bgColor, textColor, borderColor;
    switch (type) {
        case 'success':
            bgColor = 'bg-secondary/20';
            textColor = 'text-secondary';
            borderColor = 'border-secondary';
            break;
        case 'warning':
            bgColor = 'bg-warning/20';
            textColor = 'text-warning';
            borderColor = 'border-warning';
            break;
        default:
            bgColor = 'bg-danger/20';
            textColor = 'text-danger';
            borderColor = 'border-danger';
            break;
    }

    alertDiv.className = `p-4 rounded-lg border ${bgColor} ${textColor} ${borderColor}`;
    alertDiv.textContent = message;
    alertDiv.classList.remove('hidden');

    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}