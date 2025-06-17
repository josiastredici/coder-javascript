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

/* Event listeners de botones */

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

/* Login y menú */

function login(nombreIngresado) {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    let usuarioActual = {
        user: nombreIngresado,
        victorias: 0
    };
    if (usuarios.length === 0) {
        usuarios.push(usuarioActual);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    } else {
        const usuarioGuardado = usuarios.filter(u => u.user === usuarioActual.user);
        usuarioActual.victorias = usuarioGuardado.victorias;
        loginPage.style.display = 'none';
        mainPage.style.display = 'block';
    }
    sessionStorage.setItem("user", JSON.stringify(usuarioActual));
    actualizarMenu();
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
  icon: 'error',
  title: '¡Ups!',
  text: '¡En construcción!',
});
    localStorage.clear();
}

function logout() {
    sessionStorage.removeItem("user");
    location.reload();
}


/* Formulario Jugadores */
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

/* Efectos de sonido */

function playSound(nombreAudio) {
    const audio = document.getElementById(nombreAudio);
    audio.currentTime = 0;
    audio.play();
}

/* Jugadas */

let esTurnoDeX = true;

function revisarJugadores() {
    let nombres = document.querySelectorAll(".player-name");
    if (nombres[0].value === "") { 
        setNombreRandom(1);
    } else { sessionStorage.setItem("Jugador1", nombres[0].value); }
    if (nombres[1].value === "") {
        setNombreRandom(2);
    } else { sessionStorage.setItem("Jugador2", nombres[1].value); }
}

function jugada(e) {
    revisarJugadores();
    if (partidaGanada) {
        return;
    }
    if (e.target.innerHTML.trim() === ""){
        let msjTurno = document.getElementById("turno");
        if(esTurnoDeX){
            e.target.innerHTML= "X";
            msjTurno.innerHTML = "Es turno de O";
        }
        else {
            e.target.innerHTML= "O";
            msjTurno.innerHTML = "Es turno de X";
        }    
    }        
    esTurnoDeX = !esTurnoDeX;
    revisarSiGano();
}

let partidaGanada = false;
function revisarSiGano() {
    const opcionesGanador = [[0,1,2], [3,4,5], [6,7,8], [0,3,6],[1,4,7], [2,5,8], [0,4,8], [6,4,2]]; // posiciones ganadoras
    for (let i = 0; i < opcionesGanador.length; i++) {
        let posicionesAEvaluar = opcionesGanador[i];
        if (evaluarOpcion(posicionesAEvaluar)){
            let ganador = celdas[posicionesAEvaluar[0]].innerHTML;
            mostrarMensajeGanador(ganador);
        }
    }
}

function evaluarOpcion(posicionesAEvaluar) {
    for (let i = 0; i < posicionesAEvaluar.length; i++) {
        if (!celdas[posicionesAEvaluar[i]].innerHTML) { // si alguna celda está vacía, todavía no ganó
            return false;
        }
    }
    if (celdas[posicionesAEvaluar[0]].innerHTML === celdas[posicionesAEvaluar[1]].innerHTML &&
        celdas[posicionesAEvaluar[1]].innerHTML === celdas[posicionesAEvaluar[2]].innerHTML) {
            partidaGanada = true;
            return true;
        }
        return false;
}

function mostrarMensajeGanador(jugador) {
    playSound("ganadorAudio");
    const nroJugador = jugador === 'X' ? 1 : 2;
    const nombreJugador = sessionStorage.getItem(`Jugador${nroJugador}`)
    let msjGanador = `¡Ganaron las ${jugador}! ¡Ganó el jugador ${nombreJugador}!`;
    createConfetti()
    document.getElementById('turno').innerHTML = msjGanador;
}


function reiniciarJuego() {
    partidaGanada = false;
    document.getElementById('turno').innerHTML = "Haz click en cualquier parte del tablero para iniciar";
    for (let i = 0; i < celdas.length; i++){
        celdas[i].innerHTML = "";
    }
    limpiarNombres();
    esTurnoDeX = true;
    document.querySelectorAll(".confetti").forEach(div => div.remove());
}

/* Recarga de página */

window.onload = function () {
    revisarSiEstaLogueado();
}

/* A estas funciones las encontré buscando en internet, no la hice de cero */

function createConfetti() {
    for (let i = 0; i < 50; i++) { // Generate 50 confetti elements
        let confetti = document.createElement("div");
        confetti.classList.add("confetti");

        // Random position, color, size, speed, and rotation
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
