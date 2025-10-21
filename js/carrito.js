
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------- ELEMENTOS DEL DOM ----------
const cartSidebar = document.getElementById("cart-sidebar");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartIcon = document.getElementById("cart-icon");
const cartCount = document.getElementById("cart-count");
const closeCartBtn = document.getElementById("close-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const addToCartButtons = document.querySelectorAll(".add-to-cart");

// ---------- FUNCIONES BÁSICAS ----------
function guardarCarrito() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function actualizarContadorCarrito() {
  const totalCount = cart.reduce((s, it) => s + it.quantity, 0);
  cartCount.textContent = totalCount;
}

// ---------- RENDER DEL CARRITO ----------
function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.gap = "8px";

    const info = document.createElement("div");
    info.innerHTML = `<strong>${item.name}</strong><br>$${item.price} x <span class="qty">${item.quantity}</span>`;

    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "6px";

    const btnDisminuir = document.createElement("button");
    btnDisminuir.textContent = "-";

    const btnAumentar = document.createElement("button");
    btnAumentar.textContent = "+";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";

    btnDisminuir.addEventListener("click", () => actualizarPorNombre(item.name, -1));
    btnAumentar.addEventListener("click", () => actualizarPorNombre(item.name, 1));
    btnEliminar.addEventListener("click", () => eliminarPorNombre(item.name));

    controls.append(btnDisminuir, btnAumentar, btnEliminar);
    li.append(info, controls);
    cartItems.appendChild(li);
  });

  cartTotal.textContent = total.toFixed(2);
  actualizarContadorCarrito();
  guardarCarrito();
}

// ---------- OPERACIONES DEL CARRITO ----------

// AÑADIMOS CANTIDAD AL CARRITO Y MUESTRA CONFIRMACION CON TOASTIFY
function añadirAlCarrito(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.quantity++;
  else cart.push({ name, price, quantity: 1 });

  renderCart();
  Toastify({
    text: `🛒 ${name} agregado al carrito`,
    backgroundColor: "#4caf50",
    duration: 2000,
    gravity: "bottom",
    position: "right"
  }).showToast();
}

function actualizarPorNombre(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(i => i.name !== name);
  renderCart();
}

// ELIMINAMOS CONTIDAD DEL CARRITO Y MOSTRAMOS CONFIRMACION CON TOSTIIFY
function eliminarPorNombre(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
  Toastify({
    text: `❌ ${name} eliminado del carrito`,
    backgroundColor: "#f44336",
    duration: 2000,
    gravity: "bottom",
    position: "right"
  }).showToast();
}

function eliminarCarrito() {
  cart = [];
  saveCart();
  renderCart();
}

// ---------- EVENTOS UI ----------
if (addToCartButtons.length) {
  addToCartButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (!name) return;
      añadirAlCarrito(name, price);
    });
  });
}

cartIcon.addEventListener("click", () => cartSidebar.classList.toggle("open"));
closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));

// ---------- FETCH + PROMISE + ASINCRONÍA ----------
async function showPaymentModal() {
  if (cart.length === 0) {
    Toastify({
      text: "Tu carrito está vacío 🛒",
      backgroundColor: "#ff9800",
      duration: 2000,
      gravity: "bottom",
      position: "right"
    }).showToast();
    return;
  }

  try {
    const response = await fetch("../js/metodosPago.json");
    if (!response.ok) throw new Error("Error al cargar métodos de pago");
    const metodos = await response.json();

    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
      display: "flex", justifyContent: "center", alignItems: "center",
      background: "rgba(0,0,0,0.6)", zIndex: 9999
    });

    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "24px";
    box.style.borderRadius = "8px";
    box.style.textAlign = "center";

    box.innerHTML = "<h2>💳 Elegí tu método de pago</h2>";
    metodos.forEach(m => {
      const btn = document.createElement("button");
      btn.textContent = m.nombre;
      btn.style.display = "block";
      btn.style.margin = "10px auto";
      btn.addEventListener("click", () => {
        modal.remove();
        showSuccessModal(m.nombre);
        eliminarCarrito();
      });
      box.appendChild(btn);
    });

    const close = document.createElement("button");
    close.textContent = "Cancelar";
    close.style.marginTop = "12px";
    close.addEventListener("click", () => modal.remove());
    box.appendChild(close);

    modal.appendChild(box);
    document.body.appendChild(modal);

  } catch (error) {
    console.error(error);
    Toastify({
      text: "Error al cargar métodos de pago ❌",
      backgroundColor: "#f44336",
      duration: 3000
    }).showToast();
  }
}

// ---------- FINALIZAR COMPRA ----------
checkoutBtn.addEventListener("click", () => {
  showPaymentModal();
});

// ---------- MODAL DE ÉXITO ----------
function showSuccessModal(metodo) {
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed", left: 0, top: 0, width: "100%", height: "100%",
    display: "flex", justifyContent: "center", alignItems: "center",
    background: "rgba(0,0,0,0.5)", zIndex: 9999
  });

  const box = document.createElement("div");
  box.style.background = "#fff";
  box.style.padding = "24px";
  box.style.borderRadius = "8px";
  box.style.textAlign = "center";
  box.innerHTML = `<h2>🎉 ¡Pago completado!</h2><p>Método: ${metodo}</p>`;

  const close = document.createElement("button");
  close.textContent = "Cerrar";
  close.addEventListener("click", () => modal.remove());
  box.appendChild(close);
  modal.appendChild(box);
  document.body.appendChild(modal);

  Toastify({
    text: `Compra finalizada con ${metodo}`,
    backgroundColor: "#4caf50",
    duration: 3000,
    gravity: "bottom",
    position: "right"
  }).showToast();
}

// ---------- INICIALIZAR ----------
renderCart();
