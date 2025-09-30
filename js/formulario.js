
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// obtener elementos del DOM
const cartSidebar = document.getElementById("cart-sidebar");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartIcon = document.getElementById("cart-icon");
const cartCount = document.getElementById("cart-count");
const closeCartBtn = document.getElementById("close-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const addToCartButtons = document.querySelectorAll(".add-to-cart");


  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateIconCount() {
    const totalCount = cart.reduce((s, it) => s + it.quantity, 0);
    cartCount.textContent = totalCount;
  }

  // ---------------- render ----------------
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

      const btnMinus = document.createElement("button");
      btnMinus.type = "button";
      btnMinus.textContent = "-";

      const btnPlus = document.createElement("button");
      btnPlus.type = "button";
      btnPlus.textContent = "+";

      const btnRemove = document.createElement("button");
      btnRemove.type = "button";
      btnRemove.textContent = "Eliminar";

      // listeners locales
      btnMinus.addEventListener("click", () => updateQuantityByName(item.name, -1));
      btnPlus.addEventListener("click", () => updateQuantityByName(item.name, 1));
      btnRemove.addEventListener("click", () => removeByName(item.name));

      controls.append(btnMinus, btnPlus, btnRemove);
      li.append(info, controls);
      cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);
    updateIconCount();
    saveCart();
  }

  // ---------------- operaciones ----------------
  function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.quantity++;
    else cart.push({ name, price, quantity: 1 });
    renderCart();
  }

  function updateQuantityByName(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
    renderCart();
  }

  function removeByName(name) {
    cart = cart.filter(i => i.name !== name);
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  // ---------------- eventos UI ----------------
  if (addToCartButtons && addToCartButtons.length) {
    addToCartButtons.forEach(btn => {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        const name = btn.dataset.name || btn.getAttribute("data-name");
        const price = parseFloat(btn.dataset.price || btn.getAttribute("data-price")) || 0;
        if (!name) {
          console.warn("Botón .add-to-cart sin data-name");
          return;
        }
        addToCart(name, price);
        
      });
    });
  } else {
    console.warn("No se encontraron botones .add-to-cart en el DOM.");
  }

  cartIcon.addEventListener("click", () => cartSidebar.classList.toggle("open"));
  closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));

  checkoutBtn.addEventListener("click", () => {
    // Mostrar modal de éxito + confetti
    showSuccessModal();
    clearCart();
  });

  // ---------------- modal + confetti (lo hice con ayuda de chat GPT ) :) ----------------
  function showSuccessModal() {
    const modal = document.createElement("div");
    modal.className = "success-modal";
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
    box.innerHTML = `<h2>🎉 ¡Felicidades por tu compra!</h2><p>Vuelva pronto.</p>`;
    const close = document.createElement("button");
    close.textContent = "Cerrar";
    close.style.marginTop = "12px";
    close.addEventListener("click", () => modal.remove());
    box.appendChild(close);
    modal.appendChild(box);
    document.body.appendChild(modal);

    showConfetti();
    setTimeout(() => modal.remove(), 6000); // se cierra solo después
  }

  function showConfetti() {
    const confettiContainer = document.createElement("div");
    Object.assign(confettiContainer.style, {
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 10000, overflow: "hidden"
    });
    document.body.appendChild(confettiContainer);

    const colors = ["#f44336","#e91e63","#9c27b0","#3f51b5","#2196f3","#4caf50","#ffeb3b","#ff9800"];

    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      const size = Math.random()*10 + 6;
      Object.assign(el.style, {
        position: "absolute",
        top: "-20px",
        left: Math.random()*100 + "%",
        width: `${size}px`,
        height: `${size*0.6}px`,
        background: colors[Math.floor(Math.random()*colors.length)],
        opacity: 0.9,
        transform: `rotate(${Math.random()*360}deg)`,
        borderRadius: "2px"
      });
      confettiContainer.appendChild(el);
      const duration = 2000 + Math.random()*2500;
      el.animate([
        { transform: el.style.transform + " translateY(0)", opacity: 1 },
        { transform: el.style.transform + " translateY(110vh) rotate(720deg)", opacity: 0.8 }
      ], { duration, easing: "cubic-bezier(.2,.6,.2,1)" });
      setTimeout(() => el.remove(), duration + 100);
    }

    setTimeout(() => confettiContainer.remove(), 5000);
  }

  // Inicializar render (lee localStorage)
  renderCart();
