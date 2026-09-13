/* =========================================================
   HUERTO HOGAR - JAVASCRIPT
   Funciones comunes del proyecto.
   No necesita librerías adicionales.
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "huertoHogarCarrito";
    const SESSION_KEY = "huertoHogarSesionActiva";
    const USERS_KEY = "huertoHogarUsuarios";

    const regiones = [
        "Arica y Parinacota", "Tarapaca", "Antofagasta", "Atacama", "Coquimbo",
        "Valparaiso", "Region Metropolitana de Santiago", "O'Higgins", "Maule",
        "Nuble", "Biobio", "La Araucania", "Los Rios", "Los Lagos", "Aysen",
        "Magallanes y de la Antartica Chilena"
    ];

    const dominiosPermitidos = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

    function correoPermitido(valor, obligatorio = true) {
        const correo = String(valor || "").trim();
        const dominio = correo.split("@")[1]?.toLowerCase();
        return (!obligatorio && !correo) ||
            (correo.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) && dominiosPermitidos.includes(dominio));
    }

    function campoValido(valor, maximo, obligatorio = true) {
        const texto = String(valor || "").trim();
        return (!obligatorio && !texto) || (texto.length > 0 && texto.length <= maximo);
    }

    function contrasenaValida(valor) {
        const texto = String(valor || "");
        return texto.length >= 4 && texto.length <= 10;
    }

    function validarRun(valor) {
        const run = String(valor || "").trim().toUpperCase();

        if (!/^[0-9]{6,8}[0-9K]$/.test(run)) {
            return false;
        }

        const cuerpo = run.slice(0, -1).split("").reverse();
        const suma = cuerpo.reduce((total, digito, indice) =>
            total + Number(digito) * ((indice % 6) + 2), 0);
        const resto = 11 - (suma % 11);
        const verificador = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

        return verificador === run.slice(-1);
    }

    function mostrarErrores(formulario, errores) {
        formulario.querySelectorAll(".alert-validacion").forEach(elemento => elemento.remove());

        if (errores.length === 0) {
            return false;
        }

        const mensaje = document.createElement("div");
        mensaje.className = "alert alert-danger alert-validacion mt-3";
        mensaje.setAttribute("role", "alert");
        mensaje.textContent = errores.join(" ");
        formulario.prepend(mensaje);
        return true;
    }

    function cargarUsuarios() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        } catch (error) {
            return [];
        }
    }

    function guardarUsuario(usuario) {
        const usuarios = cargarUsuarios();
        usuarios.push(usuario);
        localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
    }

    const productosHuerto = [
        { id: "manzanas", nombre: "Manzanas Fuji", precio: 1200, imagen: "img/manzana2.jpg" },
        { id: "naranjas", nombre: "Naranjas Valencia", precio: 1000, imagen: "img/naranja2.jpg" },
        { id: "platanos", nombre: "Plátanos Cavendish", precio: 800, imagen: "img/banana.jpg" },
        { id: "zanahorias", nombre: "Zanahorias Orgánicas", precio: 900, imagen: "img/zanahoria.jpg" },
        { id: "espinacas", nombre: "Espinacas Frescas", precio: 700, imagen: "img/espinaca3.jpg" },
        { id: "pimientos", nombre: "Pimientos Tricolores", precio: 1500, imagen: "img/pimiento2.jpg" },
        { id: "miel", nombre: "Miel Orgánica", precio: 5000, imagen: "img/miel.jpg" }
    ];

    function cargarCarrito() {
        try {
            const guardado = localStorage.getItem(STORAGE_KEY);
            const carrito = guardado ? JSON.parse(guardado) : {};

            Object.values(carrito).forEach(item => {
                const producto = buscarProducto(item.id);

                if (producto) {
                    item.nombre = producto.nombre;
                    item.precio = producto.precio;
                    item.imagen = producto.imagen;
                }
            });

            return carrito;
        } catch (error) {
            console.warn("No se pudo leer el carrito:", error);
            return {};
        }
    }

    function guardarCarrito(carrito) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    }

    function buscarProducto(id) {
        return productosHuerto.find(producto => producto.id === id);
    }

    function agregarProducto(producto, cantidad = 1) {
        const carrito = cargarCarrito();
        const productoOficial = buscarProducto(producto.id) || producto;

        if (!carrito[productoOficial.id]) {
            carrito[productoOficial.id] = {
                id: productoOficial.id,
                nombre: productoOficial.nombre,
                precio: productoOficial.precio,
                imagen: productoOficial.imagen,
                cantidad: 0
            };
        }

        carrito[productoOficial.id].precio = productoOficial.precio;
        carrito[productoOficial.id].nombre = productoOficial.nombre;
        carrito[productoOficial.id].imagen = productoOficial.imagen;

        carrito[productoOficial.id].cantidad += cantidad;
        guardarCarrito(carrito);
        return carrito[productoOficial.id];
    }

    function formatearPrecio(numero) {
        return "$" + Number(numero).toLocaleString("es-CL");
    }

    function actualizarBotonSesion() {
        const botones = document.querySelectorAll("a.btn-warning[href='login.html']");
        const sesionActiva = localStorage.getItem(SESSION_KEY) === "true";

        botones.forEach(boton => {
            boton.textContent = sesionActiva
                ? "Cerrar Sesión"
                : "Iniciar Sesión / Registrarse";

            boton.addEventListener("click", function (event) {
                if (!sesionActiva) {
                    return;
                }

                event.preventDefault();
                localStorage.removeItem(SESSION_KEY);
                window.location.href = "index.html";
            });
        });
    }

    function prepararLogin() {
        const formulario = document.getElementById("formLogin");

        if (!formulario) {
            return;
        }

        const correo = document.getElementById("correoLogin");
        const contrasena = document.getElementById("contrasena");
        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const errores = [];

            if (!correoPermitido(correo.value)) {
                errores.push("El correo es obligatorio, debe tener máximo 100 caracteres y terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.");
            }

            if (!contrasenaValida(contrasena.value)) {
                errores.push("La contraseña es obligatoria y debe tener entre 4 y 10 caracteres.");
            }

            if (mostrarErrores(formulario, errores)) {
                return;
            }

            localStorage.setItem(SESSION_KEY, "true");
            window.location.href = "index.html";
        });
    }

    /* ---------------------------------------------------------
       CATÁLOGO
       Permite que "Agregar al carrito" realmente agregue.
       --------------------------------------------------------- */

    function mostrarOpcionesCarrito(producto) {
        const modal = document.createElement("div");

        modal.className = "modal fade";
        modal.tabIndex = -1;
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title h5">Producto añadido</h2>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">${producto.nombre} fue añadido al carrito.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-success" data-accion="continuar">
                            Continuar comprando
                        </button>
                        <button type="button" class="btn btn-success" data-accion="carrito">
                            Ir al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        if (!window.bootstrap?.Modal) {
            const irAlCarrito = window.confirm(
                producto.nombre + " fue añadido al carrito.\n\n" +
                "Aceptar: ir al carrito\nCancelar: continuar comprando"
            );

            modal.remove();

            if (irAlCarrito) {
                window.location.href = "carrito.html";
            }

            return;
        }

        const instancia = new window.bootstrap.Modal(modal, {
            backdrop: "static"
        });

        modal.querySelector('[data-accion="continuar"]').addEventListener("click", function () {
            instancia.hide();
        });

        modal.querySelector('[data-accion="carrito"]').addEventListener("click", function () {
            window.location.href = "carrito.html";
        });

        modal.addEventListener("hidden.bs.modal", function () {
            instancia.dispose();
            modal.remove();
        }, { once: true });

        instancia.show();
    }

    function renderizarProductos() {
        const contenedor = document.getElementById("listaProductos");

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = productosHuerto.map(producto => `
            <div class="col">
                <div class="card h-100 bg-blanco">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body">
                        <h4 class="card-title">${producto.nombre}</h4>
                        <p class="card-text">Precio: ${formatearPrecio(producto.precio)} por unidad</p>
                    </div>
                    <div class="card-footer bg-transparent border-success">
                        <a href="carrito.html">Agregar al carrito</a>
                    </div>
                </div>
            </div>
        `).join("");
    }

    function prepararCatalogo() {
        const enlaces = document.querySelectorAll("a[href='carrito.html']");

        enlaces.forEach(enlace => {
            if (enlace.textContent.trim().toLowerCase() !== "agregar al carrito") {
                return;
            }

            enlace.addEventListener("click", function (event) {
                event.preventDefault();

                const card = enlace.closest(".card");

                if (!card) {
                    window.location.href = "carrito.html";
                    return;
                }

                const titulo = card.querySelector(".card-title");
                const precioTexto = card.querySelector(".card-text");

                const nombre = titulo
                    ? titulo.textContent.trim()
                    : "Producto";

                const productoBase = productosHuerto.find(producto =>
                    nombre.toLowerCase().includes(producto.nombre.toLowerCase().replace("es", ""))
                );

                let producto;

                if (productoBase) {
                    producto = productoBase;
                } else {
                    const precioEncontrado = precioTexto
                        ? precioTexto.textContent.replace(/[^\d]/g, "")
                        : "0";

                    producto = {
                        id: nombre.toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/\s+/g, "-"),
                        nombre: nombre,
                        precio: Number(precioEncontrado) || 0,
                        imagen: card.querySelector("img")?.getAttribute("src") || ""
                    };
                }

                agregarProducto(producto, 1);
                mostrarOpcionesCarrito(producto);
            });
        });
    }

    /* ---------------------------------------------------------
       CARRITO
       Mantiene las funciones usadas directamente por el HTML.
       --------------------------------------------------------- */

    window.cambiarCantidad = function (producto, cambio) {
        const carrito = cargarCarrito();

        if (!carrito[producto]) {
            if (cambio <= 0) {
                return;
            }

            const base = buscarProducto(producto);

            if (!base) {
                return;
            }

            carrito[producto] = {
                id: base.id,
                nombre: base.nombre,
                precio: base.precio,
                imagen: base.imagen,
                cantidad: 0
            };
        }

        carrito[producto].cantidad += cambio;

        if (carrito[producto].cantidad < 0) {
            carrito[producto].cantidad = 0;
        }

        if (carrito[producto].cantidad === 0) {
            delete carrito[producto];
        }

        guardarCarrito(carrito);
        actualizarCarritoVisual();
    };

    function renderizarCarrito() {
        const contenedor = document.getElementById("listaCarrito");

        if (!contenedor) {
            return;
        }

        const productos = Object.values(cargarCarrito())
            .filter(item => Number(item.cantidad) > 0);

        if (productos.length === 0) {
            contenedor.innerHTML = `
                <p class="text-muted mb-4">
                    Tu carrito está vacío.
                </p>
            `;
            return;
        }

        contenedor.innerHTML = productos.map(item => `
            <div class="border-bottom pb-4 mb-4">
                <div class="row align-items-center g-3">
                    <div class="col-4 col-md-3">
                        <img src="${item.imagen}" alt="${item.nombre}" class="img-fluid rounded"
                            style="height: 150px; width: 100%; object-fit: cover;">
                    </div>
                    <div class="col-8 col-md-5">
                        <h2 class="h5">${item.nombre}</h2>
                        <p class="text-muted mb-0">Producto fresco y seleccionado de Huerto Hogar.</p>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="text-md-end">
                            <p class="fw-semibold mb-2">${formatearPrecio(item.precio)}</p>
                            <div class="d-flex justify-content-md-end align-items-center gap-2">
                                <button type="button" class="btn btn-outline-secondary rounded-circle"
                                    onclick="cambiarCantidad('${item.id}', -1)">-</button>
                                <span class="border rounded px-4 py-2">${item.cantidad}</span>
                                <button type="button" class="btn btn-outline-secondary rounded-circle"
                                    onclick="cambiarCantidad('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");
    }

    function actualizarCarritoVisual() {
        sincronizarCarritoFijo();
        renderizarCarrito();
        actualizarTotal();
    }

    function sincronizarCarritoFijo() {
        const carrito = cargarCarrito();

        Object.keys({
            manzanas: "cantidad-manzanas",
            platanos: "cantidad-platanos",
            naranjas: "cantidad-naranjas"
        }).forEach(id => {
            const elemento = document.getElementById({
                manzanas: "cantidad-manzanas",
                platanos: "cantidad-platanos",
                naranjas: "cantidad-naranjas"
            }[id]);

            if (elemento) {
                elemento.textContent = String(carrito[id]?.cantidad || 0);
            }
        });
    }

    window.actualizarTotal = function () {
        const elementoTotal = document.getElementById("totalCarrito");

        if (!elementoTotal) {
            return;
        }

        const carritoGuardado = cargarCarrito();

        let total = 0;

        Object.values(carritoGuardado).forEach(item => {
            total += Number(item.precio) * Number(item.cantidad);
        });

        elementoTotal.textContent = formatearPrecio(total);
    };

    window.pagar = function () {
        const total = document.getElementById("totalCarrito");

        if (!total) {
            alert("No se pudo calcular el total.");
            return;
        }

        alert("Pedido listo para continuar con el proceso de pago.\nTotal: " + total.textContent);
    };

    function prepararCupon() {
        const input = document.getElementById("cupon");

        if (!input) {
            return;
        }

        const boton = input.parentElement?.querySelector("button");

        if (!boton) {
            return;
        }

        boton.addEventListener("click", function () {
            const codigo = input.value.trim().toUpperCase();

            if (!codigo) {
                alert("Ingresa un código de cupón.");
                return;
            }

            if (codigo === "HUERTO10") {
                alert("Cupón aplicado: 10% de descuento.");
            } else {
                alert("El cupón ingresado no es válido.");
            }
        });
    }

    /* ---------------------------------------------------------
       DETALLE DE PRODUCTO
       --------------------------------------------------------- */

    const productosDetalle = [
        {
            nombre: "Manzanas",
            precio: 100,
            imagen: "img/manzana.jpg",
            descripcion: "Las manzanas son una fruta deliciosa y versátil, apreciada en todo el mundo por su sabor refrescante y sus numerosos beneficios para la salud."
        },
        {
            nombre: "Plátanos",
            precio: 120,
            imagen: "img/banana.jpg",
            descripcion: "Los plátanos son una fruta nutritiva y práctica, conocida por su sabor dulce y su aporte de energía."
        },
        {
            nombre: "Naranjas",
            precio: 150,
            imagen: "img/naranja2.jpg",
            descripcion: "Las naranjas son una fruta refrescante y jugosa, ideal para consumir directamente o preparar deliciosos jugos naturales."
        },
        {
            nombre: "Zanahorias",
            precio: 100,
            imagen: "img/zanahoria.jpg",
            descripcion: "Las zanahorias son un alimento versátil que puede disfrutarse fresco, cocido o como parte de diferentes preparaciones saludables."
        },
        {
            nombre: "Espinacas",
            precio: 130,
            imagen: "img/espinaca3.jpg",
            descripcion: "Las espinacas son una verdura nutritiva y versátil que puede utilizarse en ensaladas, batidos y diferentes recetas."
        },
        {
            nombre: "Pimientos",
            precio: 180,
            imagen: "img/pimiento2.jpg",
            descripcion: "Los pimientos aportan color y sabor a las comidas y pueden utilizarse tanto crudos como cocinados."
        },
        {
            nombre: "Miel",
            precio: 250,
            imagen: "img/miel.jpg",
            descripcion: "La miel es un producto natural de sabor dulce que puede utilizarse para acompañar alimentos y preparar diferentes recetas."
        }
    ];

    let productoActual = productosDetalle[0];

    function mostrarProductosRelacionadosNuevo() {
        const contenedor = document.getElementById("productosRelacionados");

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = "";

        productosDetalle
            .filter(producto => producto.nombre !== productoActual.nombre)
            .slice(0, 5)
            .forEach(producto => {
                const columna = document.createElement("div");
                columna.className = "col";

                columna.innerHTML = `
                    <div class="card h-100">
                        <img src="${producto.imagen}"
                             class="card-img-top"
                             alt="${producto.nombre}">
                        <div class="card-body">
                            <h3 class="h6 card-title">${producto.nombre}</h3>
                            <p class="fw-semibold mb-2">${formatearPrecio(producto.precio)}</p>
                            <button type="button"
                                    class="btn btn-outline-success btn-sm w-100">
                                Ver producto
                            </button>
                        </div>
                    </div>
                `;

                columna.querySelector("button").addEventListener("click", function () {
                    seleccionarProductoNuevo(producto.nombre);
                });

                contenedor.appendChild(columna);
            });
    }

    function seleccionarProductoNuevo(nombre) {
        const producto = productosDetalle.find(item => item.nombre === nombre);

        if (!producto) {
            return;
        }

        productoActual = producto;

        const nombreElemento = document.getElementById("nombreProducto");
        const precioElemento = document.getElementById("precioProducto");
        const descripcionElemento = document.getElementById("descripcionProducto");
        const breadcrumb = document.getElementById("breadcrumbProducto");
        const imagen = document.getElementById("imagenPrincipal");

        if (nombreElemento) nombreElemento.textContent = producto.nombre;
        if (precioElemento) precioElemento.textContent = formatearPrecio(producto.precio);
        if (descripcionElemento) descripcionElemento.textContent = producto.descripcion;
        if (breadcrumb) breadcrumb.textContent = producto.nombre;

        if (imagen) {
            imagen.src = producto.imagen;
            imagen.alt = producto.nombre;
        }

        mostrarProductosRelacionadosNuevo();
    }

    window.seleccionarProducto = seleccionarProductoNuevo;

    window.cambiarImagen = function (ruta) {
        const imagen = document.getElementById("imagenPrincipal");

        if (!imagen) {
            return;
        }

        const imagenAnterior = imagen.src;

        imagen.onerror = function () {
            imagen.onerror = null;
            imagen.src = imagenAnterior;
            alert("La imagen seleccionada no está disponible.");
        };

        imagen.src = ruta;
    };

    window.agregarAlCarrito = function () {
        const cantidadElemento = document.getElementById("cantidad");
        const cantidad = cantidadElemento ? Number(cantidadElemento.value) || 1 : 1;

        const producto = {
            id: productoActual.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, ""),
            nombre: productoActual.nombre,
            precio: productoActual.precio,
            imagen: productoActual.imagen
        };

        agregarProducto(producto, cantidad);

        alert(
            cantidad + " x " +
            productoActual.nombre +
            " fue añadido al carrito."
        );
    };

    function prepararDetalle() {
        if (!document.getElementById("productosRelacionados")) {
            return;
        }

        mostrarProductosRelacionadosNuevo();
    }

    /* ---------------------------------------------------------
       REGISTRO
       --------------------------------------------------------- */

    function prepararRegistro() {
        const formulario = document.getElementById("formRegistro");

        if (!formulario || !document.getElementById("confirmarContrasena")) {
            return;
        }

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const nombre = document.getElementById("nombre");
            const correo = document.getElementById("correo");
            const confirmar = document.getElementById("confirmarContrasena");

            /*
             * El HTML original tiene un pequeño error en el atributo
             * de la contraseña: idimg/manzana2.jpg="contrasena".
             * Por eso buscamos el primer input de tipo password.
             */
            const contrasena = formulario.querySelector('input[type="password"]');

            const errores = [];

            if (!campoValido(nombre?.value, 50)) {
                errores.push("El nombre es obligatorio y debe tener máximo 50 caracteres.");
            }

            if (!correoPermitido(correo?.value)) {
                errores.push("El correo debe tener máximo 100 caracteres y terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.");
            }

            if (!contrasenaValida(contrasena?.value)) {
                errores.push("La contraseña debe tener entre 4 y 10 caracteres.");
            }

            if (contrasena?.value !== confirmar?.value) {
                errores.push("Las contraseñas no coinciden.");
            }

            if (!formulario.querySelector("#region")?.value) {
                errores.push("La región es obligatoria.");
            }

            if (mostrarErrores(formulario, errores)) {
                return;
            }

            guardarUsuario({
                nombre: nombre.value.trim(),
                apellidos: "",
                correo: correo.value.trim().toLowerCase(),
                contrasena: contrasena.value,
                rol: "cliente",
                region: formulario.querySelector("#region").value
            });
            alert("Usuario registrado correctamente.");
            formulario.reset();
        });
    }

    function prepararContacto() {
        const formulario = document.getElementById("formContacto");

        if (!formulario) {
            return;
        }

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const nombre = document.getElementById("nombre_contacto");
            const correo = document.getElementById("correo_contacto");
            const mensaje = document.getElementById("mensaje");
            const errores = [];

            if (!campoValido(nombre?.value, 100)) {
                errores.push("El nombre es obligatorio y debe tener máximo 100 caracteres.");
            }

            if (!correoPermitido(correo?.value, false)) {
                errores.push("El correo debe tener máximo 100 caracteres y usar @duoc.cl, @profesor.duoc.cl o @gmail.com.");
            }

            if (!campoValido(mensaje?.value, 500)) {
                errores.push("El comentario es obligatorio y debe tener máximo 500 caracteres.");
            }

            if (mostrarErrores(formulario, errores)) {
                return;
            }

            alert("Mensaje enviado correctamente.");
            formulario.reset();
        });
    }

    function prepararNuevoUsuario() {
        const formulario = document.getElementById("formNuevoUsuario");

        if (!formulario) {
            return;
        }

        prepararRegiones(formulario);

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const contrasena = document.getElementById("password");
            const confirmar = document.getElementById("confirmarPassword");
            const rut = document.getElementById("rut");
            const nombre = document.getElementById("nombre");
            const apellidos = document.getElementById("apellidos");
            const correo = document.getElementById("correo");
            const direccion = document.getElementById("direccion");
            const region = document.getElementById("region");
            const rol = document.getElementById("rol");
            const estado = document.getElementById("estado");
            const errores = [];

            if (!validarRun(rut?.value)) {
                errores.push("El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion, y su dígito verificador debe ser correcto.");
            }

            if (!campoValido(nombre?.value, 50)) {
                errores.push("El nombre es obligatorio y debe tener máximo 50 caracteres.");
            }

            if (!campoValido(apellidos?.value, 100)) {
                errores.push("Los apellidos son obligatorios y deben tener máximo 100 caracteres.");
            }

            if (!correoPermitido(correo?.value)) {
                errores.push("El correo es obligatorio y debe tener máximo 100 caracteres con un dominio permitido.");
            }

            if (!contrasenaValida(contrasena?.value)) {
                errores.push("La contraseña debe tener entre 4 y 10 caracteres.");
            }

            if (contrasena?.value !== confirmar?.value) {
                errores.push("Las contraseñas no coinciden.");
            }

            if (!region?.value || !campoValido(direccion?.value, 300)) {
                errores.push("La región y la dirección son obligatorias; la dirección admite máximo 300 caracteres.");
            }

            if (!rol?.value || !["administrador", "cliente", "vendedor"].includes(rol.value)) {
                errores.push("Selecciona un tipo de usuario válido.");
            }

            if (!estado?.value || !["activo", "inactivo"].includes(estado.value)) {
                errores.push("Selecciona un estado válido.");
            }

            if (mostrarErrores(formulario, errores)) {
                return;
            }

            guardarUsuario({
                rut: rut.value.toUpperCase(),
                nombre: nombre.value.trim(),
                apellidos: apellidos.value.trim(),
                correo: correo.value.trim().toLowerCase(),
                fechaNacimiento: document.getElementById("fechaNacimiento")?.value || "",
                rol: rol.value,
                estado: estado.value,
                region: region.value,
                direccion: direccion.value.trim()
            });

            alert("Usuario registrado correctamente.");
            formulario.reset();
            prepararRegiones(formulario);
        });
    }

    function prepararRegiones(formulario) {
        const region = formulario.querySelector("#region");

        if (!region) {
            return;
        }

        if (region.options.length <= 1) {
            regiones.forEach(nombreRegion => {
                const opcion = document.createElement("option");
                opcion.value = nombreRegion;
                opcion.textContent = nombreRegion;
                region.appendChild(opcion);
            });
        }
    }

    window.validarProducto = function (producto) {
        const errores = [];
        const codigo = String(producto?.codigo || "").trim();
        const nombre = String(producto?.nombre || "").trim();
        const descripcion = String(producto?.descripcion || "").trim();
        const precio = Number(producto?.precio);
        const stock = Number(producto?.stock);
        const stockCritico = producto?.stockCritico === "" || producto?.stockCritico === undefined
            ? null
            : Number(producto.stockCritico);

        if (codigo.length < 3) errores.push("El código de producto es obligatorio y debe tener al menos 3 caracteres.");
        if (!campoValido(nombre, 100)) errores.push("El nombre del producto es obligatorio y admite máximo 100 caracteres.");
        if (descripcion.length > 500) errores.push("La descripción admite máximo 500 caracteres.");
        if (!Number.isFinite(precio) || precio < 0) errores.push("El precio es obligatorio y debe ser un número mayor o igual a 0.");
        if (!Number.isInteger(stock) || stock < 0) errores.push("El stock es obligatorio y debe ser un número entero mayor o igual a 0.");
        if (stockCritico !== null && (!Number.isInteger(stockCritico) || stockCritico < 0)) {
            errores.push("El stock crítico debe ser un número entero mayor o igual a 0.");
        }
        if (!String(producto?.categoria || "").trim()) errores.push("La categoría es obligatoria.");

        return { valido: errores.length === 0, errores };
    };

    window.alertaStockCritico = function (stock, stockCritico) {
        if (Number.isInteger(Number(stockCritico)) && Number(stock) <= Number(stockCritico)) {
            alert("Alerta: el stock está igual o por debajo del stock crítico.");
            return true;
        }

        return false;
    };

    /* ---------------------------------------------------------
       ADMINISTRACIÓN
       --------------------------------------------------------- */

    window.nuevoUsuario = function () {
        alert("Abrir formulario para crear un nuevo usuario.");
    };

    window.editarUsuario = function (id) {
        alert("Editar usuario con ID: " + id);
    };

    window.eliminarUsuario = function (id) {
        if (confirm("¿Deseas eliminar el usuario " + id + "?")) {
            alert("Usuario eliminado.");
        }
    };

    window.filtrarUsuarios = function () {
        const filtroElemento = document.getElementById("filtroUsuarios");
        const tabla = document.getElementById("tablaUsuarios");

        if (!filtroElemento || !tabla) {
            return;
        }

        const filtro = filtroElemento.value;
        const usuarios = tabla.querySelectorAll("tr[data-rol]");

        usuarios.forEach(usuario => {
            const rol = usuario.getAttribute("data-rol");
            usuario.style.display =
                filtro === "todos" || rol === filtro ? "" : "none";
        });
    };

    /* ---------------------------------------------------------
       INICIALIZACIÓN
       --------------------------------------------------------- */

    document.addEventListener("DOMContentLoaded", function () {
        renderizarProductos();
        prepararCatalogo();
        prepararDetalle();
        prepararRegistro();
        prepararNuevoUsuario();
        prepararContacto();
        prepararCupon();
        prepararLogin();
        actualizarBotonSesion();

        if (document.getElementById("totalCarrito")) {
            actualizarCarritoVisual();
        }
    });

})();
