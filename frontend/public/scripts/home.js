const loginForm = document.getElementById('loginForm')

loginForm.addEventListener('change', (e) => {
    if (e.target.value === 'company') {
        loginForm.children[0].children[0].placeholder = 'Razão Social';
    }
    else {
        loginForm.children[0].children[0].placeholder = 'Nome';
    }
});

const loginButtons = document.querySelectorAll('.login-button');

const signIn = document.querySelector('.signin');
const logIn = document.querySelector('.login');

loginButtons.forEach(loginButton => {
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        signIn.classList.toggle('hidden');
        logIn.classList.toggle('hidden');
    });
});
