let cachedActivities = {};

const initializeResources = () => {
    const resourcesList = document.querySelectorAll('li');
    const resourcesListContainer = document.querySelectorAll('section');

    for (let i = 0; i < resourcesList.length; i++) {
        resourcesList[i].addEventListener('click', () => {
            resourcesListContainer[i + 1].children[0].classList.toggle('hidden');
            resourcesListContainer[i + 1].children[0].classList.toggle('show');
        });
    }
};

initializeResources();

const enrolledTrainings = async (activities, i) => {
    await fetch('/api/mentor-activities/get-activities').then(res => res.json()).then(data => {
        cachedActivities = Object.assign({}, data);

        for (const username in data) {
            for (item of data[username]) {
                activities.innerHTML += `
                    <div class="box spacing-wrapper">
                        <h2>Nome do aluno</h2>
                        <p>${item.username}</p>
                        <h2>Código do treinamento</h2>
                        <p>${item.training_cod}</p>
                    </div>
                `;
            }
        }
    });
};

const reprovedTrainigs = async (activities, cachedActivities) => {
    for (const username in cachedActivities) {
        for (item of cachedActivities[username]) {
            if (item.pass === false) {
                activities.innerHTML += `
                <div class="box spacing-wrapper">
                    <h2>Nome do aluno</h2>
                    <p>${item.username}</p>
                    <h2>Código do treinamento</h2>
                    <p>${item.training_cod}</p>
                </div>
                `;
            }
        }
    }
};

const completedTrainings = async (activities, cachedActivities) => {
    for (const username in cachedActivities) {
        for (item of cachedActivities[username]) {
            if (item.completed === true) {
                activities.innerHTML += `
                <div class="box spacing-wrapper">
                    <h2>Nome do aluno</h2>
                    <p>${item.username}</p>
                    <h2>Código do treinamento</h2>
                    <p>${item.training_cod}</p>
                </div>
                `;
            }
        }
    }
};

const getAllActivities = async () => {
    const activities = document.querySelector('.all-activities');

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos inscritos</h2>';

    await enrolledTrainings(activities);

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos reprovados</h2>'

    await reprovedTrainigs(activities, cachedActivities);

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos concluídos</h2>';

    await completedTrainings(activities, cachedActivities);

    for (let i = 0; i < activities.children.length; i++) {
        if (activities.children[i].tagName === 'H2') {
            if (activities.children[i + 1] !== undefined && activities.children[i + 1].tagName === 'H2') {
                const noActivities = document.createElement('div');
                noActivities.textContent = 'Nenhum treinamento encontrado';
                noActivities.classList.add('box');

                activities.insertBefore(noActivities, activities.children[i + 1]);
            }
        }
    }
};

getAllActivities();
