let cachedTrainings = {};
let cachedEnrollments = [];

const attachEventListener = (cod) => {
    document.querySelector(`.quiz-${cod}`).addEventListener('click', () => {
        window.location.href = `/api/quiz/${cod}`;
    });
};

const initializeTests = (data) => {
    const tests = document.querySelector('div.tests');

    const test = document.createElement('div');
    test.classList.add('box');

    test.innerHTML = `
    <h1>${data.name}</h1>
    <p>Responda ao quiz para avaliar sua eligibilidade</p>
    <button class="quiz-${data.cod}">Responder</button>
    `;

    tests.appendChild(test);

    attachEventListener(data.cod);
};

const getButtonState = async (data) => {
    const enrollButtons = document.querySelectorAll('.enroll-button');
    let enrolledButtonIndex = 0;

    for (button of enrollButtons) {
        await fetch('/api/trainings/is-enrolled', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod: button.parentNode.children[7].textContent.split(' ')[3] }),
        }).then(res => {
            if (res.status === 200) {
                button.textContent = 'Inscrito';

                initializeTests(data[enrolledButtonIndex]);
            }
            else if (res.status === 208) {
                button.textContent = 'Inscrever-se';
            }
        });

        enrolledButtonIndex++;
    }

    for (button of enrollButtons) {
        await fetch('/api/trainings/date-range', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cod: button.parentNode.children[7].textContent.split(' ')[3] }),
        }).then(res => res.json()).then(data => {
            if (data.message === 'Inscrições Encerradas') {
                button.textContent = 'Inscrições Encerradas';
                button.disabled = true;
                button.classList.add('disabled');
            }
            else if (data.message === 'Inscrições não começaram') {
                button.textContent = 'Inscrições não começaram';
                button.disabled = false;
                button.classList.add('disabled');
            }
        });
    }
};

const createTrainingCard = (data) => {
    const trainingCard = document.createElement('div');
    trainingCard.classList.add('box');

    trainingCard.innerHTML = `
    <h2>${data.name}</h2>
    <p>${data.desc}</p>
    <p>Carga Horária: ${data.workload}hrs</p>
    <p>Começo do Treinamento: ${data.training_start.split('-').reverse().join('/')}</p>
    <p>Término do Treinamento: ${data.training_end.split('-').reverse().join('/')}</p>
    <p>Começo das Inscrições: ${data.enroll_start.split('-').reverse().join('/')}</p>
    <p>Término das Inscrições: ${data.enroll_end.split('-').reverse().join('/')}</p>
    <p>Código do Treinamento: ${data.cod}</p>
    <p>Alunos: Mínimo ${data.min_students} | Máximo ${data.max_students}</p>
    `;

    const enrollButton = document.createElement('button');
    enrollButton.classList.add('enroll-button');
    enrollButton.textContent = '...';

    trainingCard.appendChild(enrollButton);

    enrollButton.addEventListener('click', () => {
        if (enrollButton.textContent === 'Inscrever-se') {
            fetch('/api/trainings/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cod: data.cod }),
            }).then(res => {
                if (res.status === 204) {
                    enrollButton.textContent = 'Inscrito';
                }
            });
        }
        else {
            enrollButton.textContent = 'Desinscrever?'
            enrollButton.classList.add('confirm-button');

            enrollButton.addEventListener('click', () => {
                enrollButton.classList.remove('confirm-button');

                fetch('/api/trainings/unenroll', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cod: data.cod }),
                }).then(res => {
                    if (res.status === 204) {
                        enrollButton.textContent = 'Inscrever-se';
                    }
                });
            });
        }
    });

    return trainingCard;
};

const enrolledTrainings = async (data) => {
    await fetch('/api/trainings/is-enrolled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod: data.cod }),
    }).then(res => {
        return res.json();
    }).then(data => {
        cachedEnrollments.push(data);

        const menuButton = document.querySelector('.burger');
        menuButton.classList.remove('loading');
        menuButton.disabled = false;
    });
};

const getAllEnrollments = async () => {
    for (let i = 0; i < cachedTrainings.length; i++) {
        await enrolledTrainings(cachedTrainings[i]);
    }

    getAllCourses();
};

const fetchTrainings = async () => {
    await fetch('/api/trainings').then(res => res.json()).then(async data => {
        const trainingGrid = document.querySelector('.trainings-grid');

        cachedTrainings = [...data];

        data.map((data) => {
            const trainingCard = createTrainingCard(data);
            trainingGrid.appendChild(trainingCard);
        });

        await getButtonState(data);
    });

    await getAllEnrollments();
};

fetchTrainings();

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

const openMenu = () => {
    const menu = document.querySelector('.menu');
    const menuButton = document.querySelector('.burger');
    const trainingsReport = document.querySelector('.trainings-report');

    menuButton.addEventListener('click', () => {
        menu.classList.toggle('open');
        trainingsReport.innerHTML = '';

        cachedEnrollments.map((data, i) => {
            if (data !== null) {
                trainingsReport.innerHTML += `
                <div class="box flex column spacing-wrapper margin">
                <h2>${cachedTrainings[i].name}</h2>
                <p>Pontuação: ${data.score !== undefined ? data.score : 'Quiz pendente'}</p>
                <p>Status: ${data.pass === true ? 'Apto' : 'Inapto'}</p>
                </div>
                `;
            }
        });
    });
}

openMenu();

const getAllCourses = () => {
    const courses = document.querySelector('.courses-grid');

    cachedEnrollments.map((data, i) => {
        if (data !== null && data.pass === true) {
            courses.innerHTML += `
            <div class="box flex column spacing-wrapper margin">
            <h2>${cachedTrainings[i].name}</h2>
            <a href=/api/course/${data.training_cod} class="link">Fazer Curso</a>
            </div>
            `;
        }
    });
};

const fetchJobs = async () => {
    const jobsGrid = document.querySelector('.jobs-grid');
    const allAvailableJobs = await fetch('/api/jobs/available-jobs').then(res => res.json()).then(data => data);

    allAvailableJobs.map((data) => {
        jobsGrid.innerHTML += `
        <div class="box jobs-card spacing-wrapper">
        <div>
        <h1>${data.name}</h1>
        </div>
        <div>
        <h4>Empresa</h4>
        <p>${data.company}</p>
        </div>
        <div>
        <h4>Descrição</h4>
        <p>${data.desc}</p>
        </div>
        <div>
        <h4>Requisitos</h4>
        <p>${data.requirements}</p>
        </div>
        <div>
        <h4>Salário</h4>
        <p>R$ ${data.wage}</p>
        </div>
        <h4>Treinos associados</h4>
        <p>${data.associated_trainings}</p>
        <h4>Usuários inscritos</h4>
        <p>${data.subscribed_users}</p>
        <a href="/api/jobs/update-list/${encodeURI(data.name)}" class="link">Candidatar-se</a>
        </div>
        `;
    });
};

fetchJobs();
