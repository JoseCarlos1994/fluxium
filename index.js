// =======================
// 🔹 Conexão com Firebase
// =======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// 🟡 Cole aqui o código do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCxdkQYeq5P5DSoB9hSLP7GzBXOD9ovgXw",
  authDomain: "fluxium-abcaf.firebaseapp.com",
  projectId: "fluxium-abcaf",
  storageBucket: "fluxium-abcaf.firebasestorage.app",
  messagingSenderId: "803559513243",
  appId: "1:803559513243:web:f3a46d9c658903093e7a3e",
  measurementId: "G-8JR1ET6J0V"
};

// Inicializa o app e o banco Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =======================
// 🔹 Funções do Fluxium
// =======================

// Seleciona as abas
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Botão Sair
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuarioAtual");
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
  });
}

// =======================
// 🔹 Controle de Caixa
// =======================

// Confirmação de caixa inicial
const confirmarCaixaBtn = document.getElementById("confirmarCaixa");
if (confirmarCaixaBtn) {
  confirmarCaixaBtn.addEventListener("click", () => {
    const valorInicial = parseFloat(document.getElementById("valorInicial").value);
    if (!valorInicial || valorInicial <= 0) {
      alert("Informe um valor inicial válido!");
      return;
    }
    localStorage.setItem("caixaInicial", valorInicial);
    alert("Caixa inicial confirmado: R$ " + valorInicial.toFixed(2));
  });
}

// =======================
// 🔹 Registrar entrada no Firestore
// =======================
const btnAdicionar = document.getElementById("adicionarEntrada");
if (btnAdicionar) {
  btnAdicionar.addEventListener("click", async () => {
    const valor = parseFloat(document.getElementById("valorRecebido").value);
    const tipo = document.getElementById("formaPagamento").value;
    const troco = parseFloat(document.getElementById("valorTroco").value) || 0;

    if (!valor || valor <= 0) {
      alert("Informe um valor válido!");
      return;
    }

    try {
      // Salva a entrada no Firestore
      await addDoc(collection(db, "entradas"), {
        valor: valor,
        tipo: tipo,
        troco: troco,
        data: new Date().toLocaleString("pt-BR")
      });

      alert("✅ Entrada salva com sucesso no Firebase!");
      document.getElementById("valorRecebido").value = "";
      document.getElementById("valorTroco").value = "";

      // Atualiza lista localmente
      atualizarEntradas();
    } catch (e) {
      console.error("Erro ao salvar no Firestore: ", e);
      alert("⚠️ Erro ao salvar no banco. Veja o console.");
    }
  });
}

// =======================
// 🔹 Listar entradas do Firestore
// =======================
async function atualizarEntradas() {
  const lista = document.getElementById("listaLancamentos");
  if (!lista) return;
  lista.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "entradas"));
    let total = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.data} - ${data.tipo}: R$ ${data.valor.toFixed(2)} (Troco: R$ ${data.troco.toFixed(2)})`;
      lista.appendChild(li);
      total += data.valor;
    });

    document.getElementById("totalDia").textContent = total.toFixed(2);
  } catch (e) {
    console.error("Erro ao listar entradas:", e);
  }
}

// =======================
// 🔹 Inicialização automática
// =======================
document.addEventListener("DOMContentLoaded", () => {
  atualizarEntradas();
});
