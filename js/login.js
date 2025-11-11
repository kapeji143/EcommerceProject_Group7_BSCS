// =============================
// LOGIN PAGE SCRIPT
// =============================

// Wait for main.js to load header/footer first
document.addEventListener("DOMContentLoaded", () => {
    console.log("Login page loaded");

    // Initialize form switching
    initFormSwitching();

    // Initialize form submissions
    initLoginForm();
    initSignupForm();
    initForgotPasswordForm();
});

// =============================
// FORM SWITCHING
// =============================
function initFormSwitching() {
    const loginCard = document.getElementById("loginCard");
    const signupCard = document.getElementById("signupCard");
    const forgotPasswordCard = document.getElementById("forgotPasswordCard");

    const showSignupBtn = document.getElementById("showSignup");
    const showLoginBtn = document.getElementById("showLogin");
    const showForgotPasswordBtn = document.getElementById("showForgotPassword");
    const backToLoginBtn = document.getElementById("backToLogin");

    if (showSignupBtn) {
        showSignupBtn.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.add("d-none");
            signupCard.classList.remove("d-none");
            forgotPasswordCard.classList.add("d-none");
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.remove("d-none");
            signupCard.classList.add("d-none");
            forgotPasswordCard.classList.add("d-none");
        });
    }

    if (showForgotPasswordBtn) {
        showForgotPasswordBtn.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.add("d-none");
            signupCard.classList.add("d-none");
            forgotPasswordCard.classList.remove("d-none");
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            loginCard.classList.remove("d-none");
            signupCard.classList.add("d-none");
            forgotPasswordCard.classList.add("d-none");
        });
    }
}

// =============================
// LOGIN FORM
// =============================
function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const btnText = document.getElementById("btnText");
    const btnSpinner = document.getElementById("btnSpinner");
    const errorAlert = document.getElementById("errorAlert");
    const errorMessage = document.getElementById("errorMessage");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const rememberMe = document.getElementById("rememberMe").checked;

        // Hide previous errors
        errorAlert.classList.add("d-none");

        // Basic validation
        if (!email || !password) {
            showError(errorAlert, errorMessage, "Please fill in all fields");
            return;
        }

        if (!isValidEmail(email)) {
            showError(errorAlert, errorMessage, "Please enter a valid email address");
            return;
        }

        // Show loading state
        btnText.classList.add("d-none");
        btnSpinner.classList.remove("d-none");
        loginBtn.disabled = true;

        // Simulate API call (replace with actual authentication)
        setTimeout(() => {
            // Get stored users from localStorage
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Success - store login state
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("currentUser", JSON.stringify({
                    email: user.email,
                    name: user.name || email.split("@")[0]
                }));

                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                }

                // Redirect to home or previous page
                window.location.href = "../index.html";
            } else {
                // Failed login
                showError(errorAlert, errorMessage, "Invalid email or password");
                btnText.classList.remove("d-none");
                btnSpinner.classList.add("d-none");
                loginBtn.disabled = false;
            }
        }, 1000);
    });
}

// =============================
// SIGNUP FORM
// =============================
function initSignupForm() {
    const signupForm = document.getElementById("signupForm");
    const signupBtn = document.getElementById("signupBtn");
    const btnText = document.getElementById("signupBtnText");
    const btnSpinner = document.getElementById("signupBtnSpinner");
    const errorAlert = document.getElementById("signupErrorAlert");
    const errorMessage = document.getElementById("signupErrorMessage");
    const successAlert = document.getElementById("signupSuccessAlert");
    const successMessage = document.getElementById("signupSuccessMessage");

    if (!signupForm) return;

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // Hide previous messages
        errorAlert.classList.add("d-none");
        successAlert.classList.add("d-none");

        // Validation
        if (!email || !password || !confirmPassword) {
            showError(errorAlert, errorMessage, "Please fill in all fields");
            return;
        }

        if (!isValidEmail(email)) {
            showError(errorAlert, errorMessage, "Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            showError(errorAlert, errorMessage, "Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            showError(errorAlert, errorMessage, "Passwords do not match");
            return;
        }

        // Show loading state
        btnText.classList.add("d-none");
        btnSpinner.classList.remove("d-none");
        signupBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Get existing users
            const users = JSON.parse(localStorage.getItem("users")) || [];

            // Check if email already exists
            if (users.find(u => u.email === email)) {
                showError(errorAlert, errorMessage, "An account with this email already exists");
                btnText.classList.remove("d-none");
                btnSpinner.classList.add("d-none");
                signupBtn.disabled = false;
                return;
            }

            // Add new user
            users.push({
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem("users", JSON.stringify(users));

            // Show success message
            successMessage.textContent = "Account created successfully! Redirecting to login...";
            successAlert.classList.remove("d-none");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                document.getElementById("showLogin").click();
                signupForm.reset();
            }, 2000);

            btnText.classList.remove("d-none");
            btnSpinner.classList.add("d-none");
            signupBtn.disabled = false;
        }, 1000);
    });
}

// =============================
// FORGOT PASSWORD FORM
// =============================
function initForgotPasswordForm() {
    const forgotForm = document.getElementById("forgotPasswordForm");
    const forgotBtn = document.getElementById("forgotBtn");
    const btnText = document.getElementById("forgotBtnText");
    const btnSpinner = document.getElementById("forgotBtnSpinner");
    const errorAlert = document.getElementById("forgotErrorAlert");
    const errorMessage = document.getElementById("forgotErrorMessage");
    const successAlert = document.getElementById("forgotSuccessAlert");
    const successMessage = document.getElementById("forgotSuccessMessage");

    if (!forgotForm) return;

    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();

        // Hide previous messages
        errorAlert.classList.add("d-none");
        successAlert.classList.add("d-none");

        // Validation
        if (!email) {
            showError(errorAlert, errorMessage, "Please enter your email address");
            return;
        }

        if (!isValidEmail(email)) {
            showError(errorAlert, errorMessage, "Please enter a valid email address");
            return;
        }

        // Show loading state
        btnText.classList.add("d-none");
        btnSpinner.classList.remove("d-none");
        forgotBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Check if email exists
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const userExists = users.find(u => u.email === email);

            if (userExists) {
                successMessage.textContent = "Password reset link sent to your email!";
                successAlert.classList.remove("d-none");
                forgotForm.reset();
            } else {
                // For security, show success even if email doesn't exist
                successMessage.textContent = "If an account exists with this email, a reset link has been sent.";
                successAlert.classList.remove("d-none");
                forgotForm.reset();
            }

            btnText.classList.remove("d-none");
            btnSpinner.classList.add("d-none");
            forgotBtn.disabled = false;
        }, 1000);
    });
}

// =============================
// HELPER FUNCTIONS
// =============================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(alertElement, messageElement, message) {
    messageElement.textContent = message;
    alertElement.classList.remove("d-none");

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.add("d-none");
    }, 5000);
}