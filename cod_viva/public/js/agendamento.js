const mensagem = document.getElementById('mensagem-sucesso');
const form = document.getElementById('form-agendamento');
const dataInput = document.getElementById('data');
const horaInput = document.getElementById('hora');
const HORARIOS_POR_DIA = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

const agendaContainer = document.getElementById('agenda');


async function carregarAgendaSemanal() {
    const agendamentos = await getAgendamentos();
    agendaContainer.innerHTML = '';

    agendamentos.forEach(a => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
            <h2>${a.data} - ${a.hora}</h2>
            <p>${a.modalidade}</p>
            `;  

        agendaContainer.appendChild(div);
    })
}

carregarAgendaSemanal();



const hoje = new Date().toISOString().split('T')[0];
dataInput.setAttribute('min', hoje);



dataInput.addEventListener('input', async () => {
    const dataSelecionada = dataInput.value;
    const agendamentos = await getAgendamentos();

    const ocupados = agendamentos
        .filter(a => a.data === dataSelecionada)
        .map(a => a.hora);

    horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
    HORARIOS_POR_DIA.forEach(hora => {
        if (!ocupados.includes(hora)) {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            horaInput.appendChild(option);
        }
    });

    if (ocupados.length >= HORARIOS_POR_DIA.length) {
        alert("Essa data está totalmente ocupada.");
        dataInput.value = "";
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    agendar();
});

async function agendar() {
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const data = dataInput.value;
    const hora = horaInput.value;
    const modalidade = document.getElementById('modalidade').value;

    const conflito = await temConflito(data, hora, modalidade);
    if (conflito) {
        mensagem.innerHTML = `Já existe um agendamento para esta data e horário.`;
        mensagem.style.display = 'block';
        mensagem.style.color = 'red';

        setTimeout(() => mensagem.style.display = 'none', 3000);
        return;
    }

    try {
        const response = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, data, hora, modalidade })
        });

        if (response.ok) {
            mensagem.innerHTML = '✅ Agendamento enviado com sucesso!';
            mensagem.style.display = 'block';
            mensagem.style.color = 'green';
            form.reset();
            horaInput.innerHTML = '<option value="">Selecione o Horário</option>';
            setTimeout(() => mensagem.style.display = 'none', 3000);
            carregarAgendamentos();
            carregarAgendaSemanal();
        } else {
            const erro = await response.json();
            alert('Erro ao agendar: ' + erro.message);
        }
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
}

async function temConflito(data, hora, modalidade) {
    const agendamentos = await getAgendamentos();
    return agendamentos.some(a => a.data === data && a.hora === hora && a.modalidade === modalidade);
}

async function getAgendamentos() {
    const res = await fetch('/api/agendamentos');
    return await res.json();
}

async function carregarAgendamentos() {
    const agendamentos = await getAgendamentos();
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';

    agendamentos.forEach(a => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h2>${a.nome}</h2>
            <p>${a.telefone}</p>
            <p>${a.data}</p>
            <p>${a.hora}</p>
            <p>${a.modalidade}</p>
        `;
        cardsContainer.appendChild(card);
    });
}

carregarAgendamentos();
