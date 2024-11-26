document.addEventListener("DOMContentLoaded", () => {
    const ticketForm = document.getElementById("ticketForm");
    const listaTicketsAbiertos = document.getElementById("listaTicketsAbiertos");
    const listaTicketsEnValidacion = document.getElementById("listaTicketsEnValidacion");
    const listaTicketsCerrados = document.getElementById("listaTicketsCerrados");
    const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const loginForm = document.getElementById("loginForm");
    const loginFormContainer = document.getElementById("loginFormContainer");
    const contenido = document.getElementById("contenido");
    const navMenu = document.getElementById("navMenu");

    // Usuarios y contraseñas predefinidos
    const usuarios = {
        "admin": "admin123",
        "cmelendez": "admin123"
    };

    // Manejar la creación de tickets
    ticketForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const problema = document.getElementById("problema").value.trim();
        const descripcion = document.getElementById("descripcion").value.trim();
        const imagenFile = document.getElementById("imagen").files[0];

        if (!nombre || !problema || !descripcion) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const estado = "Abierto";

        let imagenDataUrl = "";
        if (imagenFile) {
            try {
                imagenDataUrl = await fileToBase64(imagenFile);
                if (!imagenDataUrl.startsWith("data:image/")) {
                    throw new Error("El archivo no es una imagen válida.");
                }
            } catch (error) {
                console.error("Error al procesar la imagen:", error);
                alert("Hubo un problema al cargar la imagen. Intenta nuevamente.");
                return;
            }
        }

        const ticket = { id: Date.now(), nombre, problema, descripcion, estado, imagenDataUrl };
        tickets.push(ticket);
        localStorage.setItem("tickets", JSON.stringify(tickets));

        alert("¡Ticket creado!");
        ticketForm.reset();
        mostrarSeccion('abiertos');
        mostrarTickets();
    });

    // Convertir archivo a Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")) {
                reject("El archivo seleccionado no es una imagen.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Mostrar tickets en las listas correspondientes
    function mostrarTickets() {
        listaTicketsAbiertos.innerHTML = "";
        listaTicketsEnValidacion.innerHTML = "";
        listaTicketsCerrados.innerHTML = "";

        tickets.forEach(ticket => {
            const ticketHTML = `
                <div class="ticket ${ticket.estado === 'Abierto' ? 'ticket-abierto' : ''} 
                                 ${ticket.estado === 'En Validación' ? 'ticket-en-validacion' : ''} 
                                 ${ticket.estado === 'Cerrado' ? 'ticket-cerrado' : ''}">
                    <p><strong>Nombre:</strong> ${ticket.nombre}</p>
                    <p><strong>Problema:</strong> ${ticket.problema}</p>
                    <p><strong>Descripción:</strong> ${ticket.descripcion}</p>
                    ${ticket.imagenDataUrl ? `<img src="${ticket.imagenDataUrl}" alt="Imagen del problema" class="imagen-ticket">` : ""}
                    <select onchange="cambiarEstado(${ticket.id}, this.value)">
                        <option value="Abierto" ${ticket.estado === "Abierto" ? "selected" : ""}>Abierto</option>
                        <option value="En Validación" ${ticket.estado === "En Validación" ? "selected" : ""}>En Validación</option>
                        <option value="Cerrado" ${ticket.estado === "Cerrado" ? "selected" : ""}>Cerrado</option>
                    </select>
                </div>`;

            if (ticket.estado === "Abierto") {
                listaTicketsAbiertos.innerHTML += ticketHTML;
            } else if (ticket.estado === "En Validación") {
                listaTicketsEnValidacion.innerHTML += ticketHTML;
            } else if (ticket.estado === "Cerrado") {
                listaTicketsCerrados.innerHTML += ticketHTML;
            }
        });
    }

    // Cambiar el estado del ticket y moverlo a la sección correspondiente
    window.cambiarEstado = (id, nuevoEstado) => {
        const ticket = tickets.find(t => t.id === id);
        if (ticket) {
            ticket.estado = nuevoEstado;
            localStorage.setItem("tickets", JSON.stringify(tickets));
            mostrarTickets();
        }
    };

    // Mostrar la sección seleccionada
    window.mostrarSeccion = (seccionId) => {
        document.querySelectorAll(".contenido section").forEach(sec => {
            sec.classList.add("seccion-oculta");
            sec.classList.remove("seccion-activa");
        });
        document.getElementById(seccionId).classList.add("seccion-activa");
        document.getElementById(seccionId).classList.remove("seccion-oculta");
    };

    // Manejar el login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value;
        const contrasena = document.getElementById("contrasena").value;

        if (usuarios[usuario] && usuarios[usuario] === contrasena) {
            loginFormContainer.style.display = "none";
            navMenu.style.display = "block";
            contenido.style.display = "block";
            mostrarSeccion('agregarTicket');  
            mostrarTickets();
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    });

    // Función para cerrar sesión
    window.cerrarSesion = () => {
        navMenu.style.display = "none";
        contenido.style.display = "none";
        loginFormContainer.style.display = "flex";
        loginFormContainer.style.justifyContent = "center";
        loginFormContainer.style.alignItems = "center";
        loginFormContainer.style.height = "100vh";
        document.getElementById("usuario").value = "";
        document.getElementById("contrasena").value = "";
    };
});
