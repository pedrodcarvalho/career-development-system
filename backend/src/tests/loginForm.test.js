const LoginForm = require('./loginForm');

describe('LoginForm', () => {
    let loginForm;

    beforeEach(() => {
        loginForm = new LoginForm();
    });

    test('Valid Email', () => {
        const email = 'jhondoe@gmail.com'
        const result = loginForm.validateEmail(email);
        expect(result).toBe(true);
    });

    test('Invalid Email', () => {
        const email = 'jhondoegmailcom';
        const result = loginForm.validateEmail(email);
        expect(result).toBe(false);
    });

    test('Valid Password', () => {
        const password = '12345678';
        const result = loginForm.validatePassword(password);
        expect(result).toBe(true);
    });

    test('Invalid Email', () => {
        const password = '1234567';
        const result = loginForm.validatePassword(password);
        expect(result).toBe(false);
    });
});
