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
    await fetch('/api/company-activities/get-activities').then(res => res.json()).then(data => {
        cachedActivities = Object.assign({}, data);

        for (const username in data) {
            for (item of data[username]) {

                activities.innerHTML += `
                    <div class="box spacing-wrapper">
                        <h2>Nome do aluno</h2>
                        <p>${item.username}</p>
                        <h2>Código do treinamento</h2>
                        <p>${item.training_cod}</p>
                        ${item.score !== undefined ? `<h2>Nota</h2><p>${item.score}</p>` : '<h2>Nota</h2><p>Sem nota</p>'}
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
                    ${item.score !== undefined ? `<h2>Nota</h2><p>${item.score}</p>` : '<h2>Nota</h2><p>Sem nota</p>'}
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
                    ${item.score !== undefined ? `<h2>Nota</h2><p>${item.score}</p>` : '<h2>Nota</h2><p>Sem nota</p>'}
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

const updateAndDeleteJobs = async () => {
    const adminJobs = document.querySelector('.your-jobs');

    const allJobs = await fetch('/api/jobs/company-jobs').then(res => res.json()).then(data => data);

    allJobs.map((data) => {
        adminJobs.innerHTML += `
        <div class="box">
        <form action="/api/jobs/update-delete" method="post" class="column flex-start" id="jobs-form2">
        <h1>${data.name}</h1>
        <p>Título da vaga</p>
        <input type="text" name="name" placeholder="Título da vaga" value="${data.name}">
        <p>Nome da empresa</p>
        <input type="text" name="company" placeholder="Nome da empresa" value="${data.company}">
        <p>Descrição</p>
        <input type="text" name="desc" placeholder="Descrição" value="${data.desc}">
        <p>Requisitos</p>
        <input type="text" name="requirements" placeholder="Requisitos" value="${data.requirements}">
        <p>Faixa salarial</p>
        <input type="text" name="wage" placeholder="Faixa salarial (xxxx,xx)" value="${data.wage}">
        <p>Curso associado</p>
        <input type="text" name="associated_trainings" placeholder="Cursos associados (código,código)" value="${data.associated_trainings}">
        <p>Usuários Inscritos</p>
        <textarea rows="4" cols="30" name="subscribed_users" form="jobs-form2" placeholder="Usuários Inscritos (nome,nome)" ">${data.subscribed_users}</textarea>
        <input type="text" name="old_name" value="${data.name}" class="hidden">
        <div class="no-border">
        <input type="submit" name="action" value="Atualizar">
        <input type="submit" name="action" value="Deletar">
        </div>
        </form>
        </div>
        `;
    });
}

updateAndDeleteJobs();
