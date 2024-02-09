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

const createAdminTraining = (data) => {
    const trainingCard = document.createElement('div');
    trainingCard.classList.add('box');

    trainingCard.innerHTML = `
    <h1 class="flex">${data.name} | Cod: ${data.cod}</h1>
    <p>Nome do treinamento</p>
    <input type="text" value="${data.name}" id="trainingName">
    <p>Descrição</p>
    <input type="text" value="${data.desc}" id="trainingDesc">
    <p>Carga horária</p>
    <input type="text" value="${data.workload}" id="trainigWorkload">
    <p>Início do treinamento</p>
    <input type="date" value="${data.training_start}" id="trainigStart">
    <p>Término do treinamento</p>
    <input type="date" value="${data.training_end}" id="trainingEnd">
    <p>Início das inscrições</p>
    <input type="date" value="${data.enroll_start}" id="enrollStart">
    <p>Término das inscrições</p>
    <input type="date" value="${data.enroll_end}" id="enrollEnd">
    <p>Mínimo de alunos</p>
    <input type="number" min="1" value="${data.min_students}" id="minStudents">
    <p>Máximo de alunos</p>
    <input type="number" min="1" value="${data.max_students}" id="maxStudents">
    `;

    const editQuiz = document.createElement('div');
    editQuiz.classList.add('edit-quiz');

    const quizTitle = document.createElement('p');
    quizTitle.textContent = 'Perguntas do Quiz';
    editQuiz.appendChild(quizTitle);

    data.all_questions.map((item) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item;
        editQuiz.appendChild(input);
    });

    trainingCard.appendChild(editQuiz);

    const noBorder = document.createElement('div');
    noBorder.classList.add('no-border');

    const updateButton = document.createElement('button');
    updateButton.textContent = 'Atualizar';
    noBorder.appendChild(updateButton);

    updateButton.addEventListener('click', () => {
        fetch('/api/admin-trainings/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                cod: data.cod,
                name: document.querySelector('#trainingName').value,
                desc: document.querySelector('#trainingDesc').value,
                training_start: document.querySelector('#trainigStart').value,
                training_end: document.querySelector('#trainingEnd').value,
                workload: document.querySelector('#trainigWorkload').value,
                enroll_start: document.querySelector('#enrollStart').value,
                enroll_end: document.querySelector('#enrollEnd').value,
                min_students: document.querySelector('#minStudents').value,
                max_students: document.querySelector('#maxStudents').value,
                all_questions: [...document.querySelectorAll('.edit-quiz input')].map((item) => item.value),
            }),
        }).then(res => {
            if (res.status === 204) {
                window.location.reload();
            }
        });
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Deletar';
    noBorder.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => {
        fetch('/api/admin-trainings/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
                cod: data.cod,
            }),
        }).then(res => {
            if (res.status === 204) {
                window.location.reload();
            }
        });
    });

    trainingCard.appendChild(noBorder);

    return trainingCard;
};

const fetchAdminTrainings = async () => {
    const adminTrainings = document.querySelector('.admin-trainings');

    fetch('/api/admin-trainings/your-trainings').then(res => res.json()).then(data => {
        data.map((data) => {
            const trainingCard = createAdminTraining(data);
            adminTrainings.appendChild(trainingCard);
        });
    });
};

const enrolledTrainings = async (data, activities) => {
    await fetch('/api/trainings/is-enrolled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod: data.cod }),
    }).then(res => {
        if (res.status === 200) {
            const activity = createTrainingCard(data);
            activity.children[9].remove();
            activity.classList.add('normalize-width');
            activities.appendChild(activity);
        }

        return res.json();
    }).then(data => {
        cachedEnrollments.push(data);

        const menuButton = document.querySelector('.burger');
        menuButton.classList.remove('loading');
        menuButton.disabled = false;
    });
};

const reprovedTrainigs = async (data, activities) => {
    await fetch('/api/trainings/is-reproved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cod: data.cod }),
    }).then(res => {
        if (res.status === 200) {
            const activity = createTrainingCard(data);
            activity.innerHTML += '<h2>Motivo: pontuação inferior a 70%</h2>';
            activity.children[9].remove();
            activity.classList.add('normalize-width');
            activities.appendChild(activity);
        }
    });
};

const completedTrainings = async (data, activities, index) => {
    if (cachedEnrollments[index] !== null && cachedEnrollments[index].completed === true) {
        const activity = createTrainingCard(data);
        activity.children[9].remove();
        activity.classList.add('normalize-width');
        activities.appendChild(activity);
    }
};

const getAllActivities = async () => {
    const activities = document.querySelector('.all-activities');

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos inscritos</h2>';

    for (let i = 0; i < cachedTrainings.length; i++) {
        await enrolledTrainings(cachedTrainings[i], activities);
    }

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos reprovados</h2>'

    for (let i = 0; i < cachedTrainings.length; i++) {
        await reprovedTrainigs(cachedTrainings[i], activities);
    }

    activities.innerHTML += '<h2 class="spacing-wrapper">Treinamentos concluídos</h2>';

    for (let i = 0; i < cachedTrainings.length; i++) {
        await completedTrainings(cachedTrainings[i], activities, i);
    }

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

    await fetchAdminTrainings();

    await getAllActivities();
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

const addQuizQuestions = () => {
    const addQuestion = document.querySelector('.add-question');
    const quizQuestion = document.querySelector('.quiz-question');

    addQuestion.addEventListener('click', () => {
        const newQuestion = document.createElement('div');

        newQuestion.classList.add('quiz-question');

        newQuestion.innerHTML = `
            <input type="text" id="question-${document.querySelectorAll('.quiz-question').length + 1}" placeholder="Digite sua questão">
            <input type="text" id="answer-a" placeholder="Digite a resposta certa aqui">
            <input type="text" id="answer-b" placeholder="Digite a resposta errada aqui">
            <input type="text" id="answer-c" placeholder="Digite a resposta errada aqui">
        `;

        quizQuestion.parentNode.insertBefore(newQuestion, addQuestion);
    });
};

addQuizQuestions();

// On form submit get all questions and put them in a hidden field
const getQuizQuestions = () => {
    const allQuestionsField = document.getElementById('all-questions');
    const allQuestions = document.querySelectorAll('.quiz-question');

    let result = [];
    let questionNumber = 1;

    for (let i = 0; i < allQuestions.length; i++) {
        for (let j = 0; j < allQuestions[i].children.length; j++) {
            if (allQuestions[i].children[j].id.includes('question')) {
                result.push(`Pergunta ${questionNumber}: ${allQuestions[i].children[j].value}`);

                questionNumber++;
            }
            else {
                result.push(allQuestions[i].children[j].value);
            }
        }
    }

    allQuestionsField.value = result;
};

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

    updateJobs();
};

fetchJobs();

const updateJobs = async () => {
    const adminJobs = document.querySelector('.your-jobs');

    const allJobs = await fetch('/api/jobs').then(res => res.json()).then(data => data);

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
