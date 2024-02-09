window.onload = () => {
    const toast = document.getElementById('toast');
    const description = document.getElementById('description');

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('error') === 'alreadyAnswered') {
        description.textContent = 'Você já respondeu esse quiz!';
    }

    const toastNotify = () => {
        toast.className = 'show';

        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }

    if (description.textContent !== '') {
        toastNotify();
    }
}
