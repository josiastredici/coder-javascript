const loginPage = document.getElementById("login-page");
const mainPage = document.getElementById("main-page");

function revisarSiEstaLogueado() {
    if (!sessionStorage.user) {
        loginPage.style.display = 'block';
        mainPage.style.display = 'none';
    } else {
        const usuario = JSON.parse(sessionStorage.user);
        login(usuario.user);
        loginPage.style.display = 'none';
        mainPage.style.display = 'block';
    }
}

const btnIngresar = document.getElementById("btn-ingresar");
btnIngresar.addEventListener("click", () => {
    const nombreIngresado = document.getElementById("userName").value;
    if (nombreIngresado) {
        login(nombreIngresado);
    } else {
        playSound("userVacioAudio");
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: '¡El nombre de usuario no puede estar vacío!',
        });
    }
});

const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", () => { logout(); });

const btnReiniciarStats = document.getElementById("btn-reset-stats");
btnReiniciarStats.addEventListener('click', () => {
    reiniciarEstadisticas();
});

const btnLimpiar = document.getElementById("btn-limpiar");
btnLimpiar.addEventListener("click", () => {
    playSound("limpiarAudio");
    limpiarNombres();
});

const btnReiniciar = document.getElementById("btn-reiniciar");
btnReiniciar.addEventListener("click", () => {
    reiniciarJuego();
});

const celdas = document.querySelectorAll(".celda");
celdas.forEach(c => c.addEventListener('click', jugada));

function login(nombreIngresado) {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioActual = {
        user: nombreIngresado,
        victorias: 0
    };
    if (!usuarios.find(u => u.user === nombreIngresado)) {
        usuarios.push(usuarioActual);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
    sessionStorage.setItem("user", JSON.stringify(usuarioActual));
    actualizarMenu();
    loginPage.style.display = 'none';
    mainPage.style.display = 'block';
    
}

function actualizarMenu() {
    const userMenu = document.getElementById("userMenu");
    if (userMenu) {
        const usuario = JSON.parse(sessionStorage.getItem("user")).user;
        document.getElementById("userWelcome").innerHTML = `¡Bienvenido ${usuario}!`;
    }
}

function reiniciarEstadisticas() {
    Swal.fire({
        icon: 'info',
        title: 'Estadísticas reiniciadas',
        text: 'Se han eliminado todos los registros de partidas.',
    });
    localStorage.removeItem("historialPartidas");
    mostrarHistorial();
}

function logout() {
    sessionStorage.removeItem("user");
    location.reload();
}

const idBtnSorpresa1 = "btn-sorpresa-1";
const nombresRandomBtns = document.querySelectorAll(".btn-sorpresa");
const nombresRandom = ["Pepe", "Moni", "Paola", "Coqui", "María Elena", "Dardo", "Pumba", "Timón", "Michifus", "Panqueca", "Quico", "Chavo", "Chilindrina", "Sr. Barriga", "La Bruja del 71", "Doña Florinda", "Don Ramón"];

function getNombreRandom() {
    return nombresRandom[Math.floor(Math.random() * nombresRandom.length)];
}

nombresRandomBtns.forEach(btn =>
    btn.addEventListener("click", () => {
        playSound("sorpresaAudio");
        const opcActual = btn.id === idBtnSorpresa1 ? 1 : 2;
        setNombreRandom(opcActual);
    }));

function limpiarNombres() {
    document.querySelectorAll(".player-name").forEach(i => i.value = "");
    sessionStorage.removeItem("Jugador1");
    sessionStorage.removeItem("Jugador2");
}

function setNombreRandom(id) {
    const nombreRandom = getNombreRandom();
    document.getElementById(`player${id}Name`).value = nombreRandom;
    sessionStorage.setItem("Jugador" + id, nombreRandom);
}

function playSound(nombreAudio) {
    const audio = document.getElementById(nombreAudio);
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}

let esTurnoDeX = true;
let partidaGanada = false;

function revisarJugadores() {
    let nombres = document.querySelectorAll(".player-name");
    if (nombres[0].value === "") {
        setNombreRandom(1);
    } else {
        sessionStorage.setItem("Jugador1", nombres[0].value);
    }
    if (nombres[1].value === "") {
        setNombreRandom(2);
    } else {
        sessionStorage.setItem("Jugador2", nombres[1].value);
    }
}

function jugada(e) {
    revisarJugadores();
    if (partidaGanada || e.target.innerHTML.trim() !== "") return;

    let msjTurno = document.getElementById("turno");
    e.target.innerHTML = esTurnoDeX ? "X" : "O";
    msjTurno.innerHTML = `Es turno de ${esTurnoDeX ? "O" : "X"}`;
    esTurnoDeX = !esTurnoDeX;

    revisarSiGano();
}

function revisarSiGano() {
    const opcionesGanador = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [6, 4, 2]];
    for (let posiciones of opcionesGanador) {
        if (evaluarOpcion(posiciones)) {
            const ganador = celdas[posiciones[0]].innerHTML;
            mostrarMensajeGanador(ganador);
            return;
        }
    }

    // Empate
    if ([...celdas].every(c => c.innerHTML !== "") && !partidaGanada) {
        document.getElementById("turno").innerHTML = "¡Empate!";
    }
}

function evaluarOpcion(posiciones) {
    const [a, b, c] = posiciones;
    if (celdas[a].innerHTML && celdas[a].innerHTML === celdas[b].innerHTML && celdas[b].innerHTML === celdas[c].innerHTML) {
        partidaGanada = true;
        return true;
    }
    return false;
}

function mostrarMensajeGanador(jugador) {
    playSound("ganadorAudio");
    const nroJugador = jugador === 'X' ? 1 : 2;
    const nombreJugador = sessionStorage.getItem(`Jugador${nroJugador}`);
    let mensaje = `¡Ganó ${nombreJugador} (${jugador})!`;
    document.getElementById('turno').innerHTML = mensaje;
    createConfetti();
    guardarResultadoPartida(nombreJugador, jugador);
    
}

function reiniciarJuego() {
    partidaGanada = false;
    document.getElementById('turno').innerHTML = "Haz click en cualquier parte del tablero para iniciar";
    for (let celda of celdas) {
        celda.innerHTML = "";
    }
    limpiarNombres();
    esTurnoDeX = true;
    document.querySelectorAll(".confetti").forEach(div => div.remove());
}

function guardarResultadoPartida(jugador, ficha) {
    const data = {
        jugador,
        ficha,
        fecha: new Date().toISOString()
    };

    
    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type": "application/json"
        }
    })
    .then(response => response.json())
    .then(json => {
        console.log("Resultado enviado:", json);
    })
    .catch(err => {
        console.error("Error al enviar resultado:", err);
    });

    let historial = JSON.parse(localStorage.getItem("historialPartidas")) || [];
    historial.push(data);
    localStorage.setItem("historialPartidas", JSON.stringify(historial));
    mostrarHistorial();
}

function mostrarHistorial() {
    const lista = document.getElementById("historial-lista");
    if (!lista) return;
    lista.innerHTML = "";
    const historial = JSON.parse(localStorage.getItem("historialPartidas")) || [];
    historial.slice().reverse().forEach((partida, index) => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.innerText = `#${historial.length - index}: Ganó ${partida.jugador} (${partida.ficha}) el ${new Date(partida.fecha).toLocaleString()}`;
        lista.appendChild(item);
    });
}

window.onload = () => {
    revisarSiEstaLogueado();
    mostrarHistorial();
};

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        let confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.width = confetti.style.height = Math.random() * 15 + 5 + "px";
        confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
        confetti.style.animationDelay = Math.random() * 2 + "s";
        document.body.appendChild(confetti);
    }
}

function getRandomColor() {
    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function mostrarHoraArgentina() {
    const ahora = new Date();
    const formato = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById("hora-local").textContent = "Hora local: " + formato.format(ahora);
}

setInterval(mostrarHoraArgentina, 1000);


function obtenerClimaBuenosAires() {
    const lat = -34.61;
    const lon = -58.38;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=America%2FArgentina%2FBuenos_Aires`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = data.current.temperature_2m;
            const codigoClima = data.current.weathercode;
            const descripcion = interpretarCodigoClima(codigoClima);
            document.getElementById("clima").textContent = `Clima: ${descripcion}, ${temp}°C`;
        })
        .catch(error => {
            console.error("Error al obtener el clima:", error);
            document.getElementById("clima").textContent = "Clima: No disponible";
        });
}

function interpretarCodigoClima(codigo) {
    const codigos = {
        0: "Despejado",
        1: "Mayormente despejado",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Niebla",
        61: "Lluvia ligera",
        63: "Lluvia moderada",
        65: "Lluvia intensa",
        80: "Chubascos",
        95: "Tormenta"
    };
    return codigos[codigo] || "Condición desconocida";
}

obtenerClimaBuenosAires();