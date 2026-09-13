/* =========================================================
   HUERTO HOGAR - JAVASCRIPT
   Funciones comunes del proyecto.
   No necesita librerías adicionales.
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "huertoHogarCarrito";
    const SESSION_KEY = "huertoHogarSesionActiva";

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
        const boton = formulario.querySelector("button[type='submit']");
        const mensaje = document.createElement("div");

        mensaje.className = "alert d-none mt-3";
        mensaje.setAttribute("role", "alert");
        formulario.insertBefore(mensaje, boton.parentElement);

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const correoValido = correo.value.includes("@") && correo.value.includes(".");

            if (!correoValido) {
                mensaje.className = "alert alert-danger mt-3";
                mensaje.textContent = "El correo no es válido. Ejemplo@ejemplo.cl";
                return;
            }

            if (!contrasena.value.trim()) {
                mensaje.className = "alert alert-danger mt-3";
                mensaje.textContent = "Ingresa tu contraseña.";
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
        renderizarCarrito();
        actualizarTotal();
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
        const formulario = document.querySelector("form");

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

            if (!nombre?.value.trim() || !correo?.value.trim() ||
                !contrasena?.value || !confirmar?.value) {
                alert("Completa los campos obligatorios.");
                return;
            }

            if (contrasena.value !== confirmar.value) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            alert("Usuario registrado correctamente.");
            formulario.reset();
        });
    }

    function prepararNuevoUsuario() {
        const formulario = document.getElementById("formNuevoUsuario");

        if (!formulario) {
            return;
        }

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            const contrasena = document.getElementById("password");
            const confirmar = document.getElementById("confirmarPassword");

            if (!contrasena || !confirmar) {
                return;
            }

            if (contrasena.value !== confirmar.value) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            alert("Usuario registrado correctamente.");
            formulario.reset();
        });
    }

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
        prepararCatalogo();
        prepararDetalle();
        prepararRegistro();
        prepararNuevoUsuario();
        prepararCupon();
        prepararLogin();
        actualizarBotonSesion();

        if (document.getElementById("totalCarrito")) {
            actualizarCarritoVisual();
        }
    });

})();
