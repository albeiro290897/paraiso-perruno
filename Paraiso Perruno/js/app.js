document.addEventListener("DOMContentLoaded", () => {

    // 1. MENÚ RESPONSIVE MÓVIL
    const btnMenu = document.getElementById('menu-toggle');
    const navegacion = document.getElementById('navegacion');
    
    if (btnMenu && navegacion) {
        btnMenu.addEventListener('click', () => {
            navegacion.classList.toggle('activo');
            btnMenu.textContent = navegacion.classList.contains('activo') ? '✕' : '☰';
        });
    }
 
    // 2. GALERÍA MODAL 
    const modal = document.getElementById("modal-galeria");
    const modalImg = document.getElementById("img-modal");
    const spanCerrar = document.querySelector(".modal-cerrar");
    const imagenesGaleria = document.querySelectorAll(".item-galeria img");

    if (modal && modalImg && spanCerrar && imagenesGaleria.length > 0) {
        imagenesGaleria.forEach(img => {
            img.addEventListener("click", () => {
                modal.style.display = "block";
                modalImg.src = img.src;
                modalImg.alt = img.alt; 
            });
        });

        const cerrarModal = () => { modal.style.display = "none"; };
        
        spanCerrar.addEventListener("click", cerrarModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) cerrarModal();
        });
        
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.style.display === "block") {
                cerrarModal();
            }
        });
    }

    // 3. CONTROL DE ENERGÍA 
    const rangeInput = document.getElementById("nivel-energia");
    const valorEnergia = document.getElementById("valor-energia");
    
    if (rangeInput && valorEnergia) {
        rangeInput.addEventListener("input", (e) => {
            valorEnergia.textContent = e.target.value;
        });
    }

    // 4. MÓDULO DE CARRITO DE COMPRAS
    const btnCarritoNav = document.getElementById('btn-carrito-nav');
    const carritoPanel = document.getElementById('carrito-panel');
    const btnCerrarPanel = document.getElementById('cerrar-panel');
    const gridServicios = document.querySelector('.grid-servicios');
    const contenedorCarrito = document.getElementById('carrito-items');
    const totalSpan = document.getElementById('carrito-total');
    const contadorNav = document.getElementById('contador-carrito');
    const btnVaciar = document.getElementById('vaciar-carrito');
    const btnLimpiarForm = document.getElementById('btn-limpiar');
    const btnWhatsappCarrito = document.getElementById('btn-whatsapp-carrito');

    let carrito = JSON.parse(localStorage.getItem('carritoParaíso')) || [];

    const guardarCarrito = () => {
        localStorage.setItem('carritoParaíso', JSON.stringify(carrito));
    };

    const abrirCerrarPanel = () => {
        if (btnCarritoNav && carritoPanel) {
            btnCarritoNav.addEventListener('click', (e) => {
                e.preventDefault();
                carritoPanel.classList.toggle('activo');
            });
        }
    };

    const cerrarPanel = () => {
        if (btnCerrarPanel && carritoPanel) {
            btnCerrarPanel.addEventListener('click', () => {
                carritoPanel.classList.remove('activo');
            });
        }
    };

    if (gridServicios) {
        gridServicios.addEventListener('click', (e) => {
            const boton = e.target.closest('.btn-agregar');
            if (boton) {
                e.preventDefault();
                
                const producto = {
                    id: boton.dataset.id,
                    nombre: boton.dataset.nombre,
                    precio: parseFloat(boton.dataset.precio)
                };

                agregarAlCarrito(producto);
            }
        });
    }

    function agregarAlCarrito(producto) {
        const index = carrito.findIndex(item => item.id === producto.id);
        if (index !== -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        guardarCarrito();
        renderizarCarrito();
        sincronizarBotonesServicios();

        if (carritoPanel) carritoPanel.classList.add('activo');
    }

    function renderizarCarrito() {
        if (!contenedorCarrito) return;
        contenedorCarrito.innerHTML = '';

        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = '<p class="carrito-vacio-msg">El carrito está vacío.</p>';
            if (totalSpan) totalSpan.textContent = '0';
            if (contadorNav) contadorNav.textContent = '0';
            actualizarEstadoBotonCotizacion();
            return;
        }

        let totalAcumulado = 0;
        let totalUnidades = 0;

        carrito.forEach((item, index) => {
            const divItem = document.createElement('div');
            divItem.classList.add('item-carrito-estilo');

            const pInfo = document.createElement('p');
            const subtotal = item.precio * item.cantidad;
            pInfo.textContent = `${index + 1}. ${item.nombre} (x${item.cantidad}) - $${subtotal.toLocaleString('es-CO')}`;
            divItem.appendChild(pInfo);

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.classList.add('btn-eliminar-item');
            btnEliminar.setAttribute('aria-label', `Eliminar ${item.nombre} del carrito`);
            btnEliminar.addEventListener('click', () => eliminarProducto(item.id));
            divItem.appendChild(btnEliminar);

            contenedorCarrito.appendChild(divItem);

            totalAcumulado += subtotal;
            totalUnidades += item.cantidad;
        });

        if (totalSpan) totalSpan.textContent = totalAcumulado.toLocaleString('es-CO');
        if (contadorNav) contadorNav.textContent = totalUnidades;
        
        actualizarEstadoBotonCotizacion();
    }

    function eliminarProducto(id) {
        carrito = carrito.filter(item => item.id !== id);
        guardarCarrito();
        renderizarCarrito();
        sincronizarBotonesServicios();
    }

    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            if(confirm('¿Estás seguro de vaciar el carrito?')) {
                carrito = [];
                guardarCarrito();
                renderizarCarrito();
                sincronizarBotonesServicios();
            }
        });
    }

    if (btnLimpiarForm) {
        btnLimpiarForm.addEventListener('click', () => {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            sincronizarBotonesServicios();
        });
    }

    // FUNCIÓN: Sincronizar estado de botones de servicios
    function sincronizarBotonesServicios() {
        const botones = document.querySelectorAll('.btn-agregar');
        botones.forEach(boton => {
            const id = boton.dataset.id;
            const yaEstaEnCarrito = carrito.some(item => item.id === id);
            
            if (yaEstaEnCarrito) {
                boton.textContent = '✓ Agregado al carrito';
                boton.disabled = true;
                boton.classList.add('btn-agregado');
            } else {
                boton.textContent = 'Agregar al Carrito';
                boton.disabled = false;
                boton.classList.remove('btn-agregado');
            }
        });
    }

    // 5. BOTÓN DE COTIZACIÓN POR WHATSAPP
    function actualizarEstadoBotonCotizacion() {
        if (btnWhatsappCarrito) {
            btnWhatsappCarrito.disabled = carrito.length === 0;
        }
    }

    if (btnWhatsappCarrito) {
        btnWhatsappCarrito.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('🛒 Tu carrito está vacío. Agrega servicios para generar una cotización.');
                return;
            }

            let mensaje = `¡Hola Paraíso Perruno! 🐾 Quiero cotizar los siguientes servicios:\n\n`;
            
            carrito.forEach((item, index) => {
                const subtotal = item.precio * item.cantidad;
                mensaje += `${index + 1}. ${item.nombre} (x${item.cantidad}) - $${subtotal.toLocaleString('es-CO')}\n`;
            });

            const total = carrito.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);
            
            mensaje += `\n💰 *Total a cotizar:* $${total.toLocaleString('es-CO')}\n\n`;
            mensaje += `¿Podrían confirmarme disponibilidad y horarios? ¡Gracias! 🙏`;

            const urlWhatsApp = `https://wa.me/573118583684?text=${encodeURIComponent(mensaje)}`;
            
            window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
        });
    }

    // 6. ENVÍO FORMULARIO DE RESERVA POR WHATSAPP
    const form = document.getElementById("formulario-reserva");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const getVal = (id) => document.getElementById(id)?.value.trim() || "No especificado";

            const nombre = getVal("nombre");
            const correo = getVal("correo");
            const telefono = getVal("telefono");
            const mascota = getVal("nombre-mascota");
            const tipo = getVal("tipo-mascota");
            const edad = getVal("edad-mascota");
            const ubicacion = getVal("ubicacion-recogida"); 
            const servicio = getVal("servicio-interes");
            const energia = rangeInput ? rangeInput.value : "8";
            const mensajeAdicional = getVal("mensaje");

            let resumenCarrito = "Ninguno";
            if (carrito.length > 0) {
                resumenCarrito = carrito.map(i => `• ${i.nombre} (x${i.cantidad})`).join("\n");
            }

            const textoWhatsApp = 
                `¡Hola, *Paraíso Perruno*! 🐾 Quiero solicitar una reserva:\n\n` +
                `👤 *Propietario:* ${nombre}\n` +
                `📞 *Teléfono:* ${telefono}\n` +
                `📧 *Correo:* ${correo}\n\n` +
                `🐶 *Mascota:* ${mascota}\n` +
                `🐾 *Raza/Especie:* ${tipo}\n` +
                `⏳ *Edad:* ${edad}\n` +
                `📍 *Ubicación:* ${ubicacion}\n\n` +
                `🛒 *Servicios en Carrito:*\n${resumenCarrito}\n\n` +
                `🎯 *Servicio principal:* ${servicio}\n` +
                `⚡ *Energía:* ${energia}/10\n` +
                `💬 *Mensaje:* ${mensajeAdicional}`;

            const urlWhatsApp = `https://wa.me/573118583684?text=${encodeURIComponent(textoWhatsApp)}`;
            
            window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
        });
    }

    // Inicializar al cargar la página
    renderizarCarrito();
    sincronizarBotonesServicios(); 
    abrirCerrarPanel();
    cerrarPanel();

});