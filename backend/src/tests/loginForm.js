class LoginForm {
    validateEmail(email) {
        const emailRegex = /\S+@\S+\.\S+/;

        return emailRegex.test(email);
    }

    validatePassword(password) {
        if (password.length >= 8) {
            return true;
        }

        return false;
    }
}

module.exports = LoginForm;
