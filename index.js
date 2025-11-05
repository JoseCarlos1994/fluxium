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
  storageBucket: "fluxium-abcaf.appspot.com",
  messagingSenderId: "803559513243",
  appId: "1:803559513243:web:f34a6d9c58903e7a3e",
  measurementId: "G-8JR1ET6J0V"
};

// Inicializa o app e o banco Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =======================
// 🔹 Utilitário para seleção rápida
// =======================
const $ = (id) => document.getElementById(id);

// =======================
// 🔹 Inicia tudo após o carregamento do DOM
// =======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("Fluxium iniciado com sucesso 🚀");

  // ================
  // 🔸 Navegação por abas
  // ================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      if (tab) document.getElementById(tab).classList.add("active");
    });
  });

  // ================
  // 🔸 Botão de logout
  // ================
  const logoutBtn = $("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuarioAtual");
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 500);
    });
  }

  // ================
  // 🔸 Caixa inicial
  // ================
  const confirmarCaixaBtn = $("confirmarCaixa");
  if (confirmarCaixaBtn) {
    confirmarCaixaBtn.addEventListener("click", () => {
      const valorInicial = parseFloat($("valorInicial").value);
      if (!valorInicial || valorInicial <= 0) {
        alert("Informe um valor inicial válido!");
        return;
      }
      localStorage.setItem("caixaInicial", valorInicial);
      alert("Caixa inicial confirmado: R$ " + valorInicial.toFixed(2));
    });
  }

  // ================
  // 🔸 Registrar entrada (salvar no Firestore)
  // ================
  const btnAdicionar = $("adicionarEntrada");
  if (btnAdicionar) {
    btnAdicionar.addEventListener("click", async () => {
      const valor = parseFloat($("valorRecebido").value);
      const tipo = $("formaPagamento").value;
      const troco = parseFloat($("valorTroco").value) || 0;

      if (!valor || valor <= 0) {
        alert("Informe um valor válido!");
        return;
      }

      try {
        await addDoc(collection(db, "entradas"), {
          valor: valor,
          tipo: tipo,
          troco: troco,
          data: new Date().toLocaleString("pt-BR")
        });

        alert("✅ Entrada salva com sucesso no Firebase!");
        $("valorRecebido").value = "";
        $("valorTroco").value = "";

        atualizarEntradas();
      } catch (e) {
        console.error("Erro ao salvar no Firestore: ", e);
        alert("⚠️ Erro ao salvar no banco. Verifique as regras do Firestore.");
      }
    });
  }

  // ================
  // 🔸 Fechamento do dia
  // ================
  const finalizarDiaBtn = $("finalizarDia");
  if (finalizarDiaBtn) {
    finalizarDiaBtn.addEventListener("click", async () => {
      const total = parseFloat($("totalDia").textContent) || 0;
      try {
        await addDoc(collection(db, "fechamentos"), {
          data: new Date().toLocaleString("pt-BR"),
          total: total
        });
        alert("📅 Fechamento salvo com sucesso no Firebase!");
      } catch (e) {
        console.error("Erro ao salvar fechamento:", e);
      }
    });
  }

  // ================
  // 🔸 Exportações (placeholders)
  // ================
  const exportarDia = $("exportarDados");
  if (exportarDia) {
    exportarDia.addEventListener("click", () => {
      alert("📤 Função de exportação será adicionada em breve!");
    });
  }

  const exportarHistorico = $("exportarHistorico");
  if (exportarHistorico) {
    exportarHistorico.addEventListener("click", () => {
      alert("📤 Função de exportar histórico será adicionada em breve!");
    });
  }

  // ================
  // 🔸 Atualizar lista de entradas
  // ================
  async function atualizarEntradas() {
    const lista = $("listaLancamentos");
    if (!lista) return;
    lista.innerHTML = "";

    try {
      const querySnapshot = await getDocs(collection(db, "entradas"));
      let total = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const valor = Number(data.valor) || 0;
        const tipo = data.tipo || "Indefinido";
        const troco = Number(data.troco) || 0;
        const dataStr = data.data || new Date().toLocaleString("pt-BR");

        const li = document.createElement("li");
        li.textContent = `${dataStr} - ${tipo}: R$ ${valor.toFixed(2)} (Troco: R$ ${troco.toFixed(2)})`;
        lista.appendChild(li);

        total += valor;
      });

      $("totalDia").textContent = total.toFixed(2);
    } catch (e) {
      console.error("Erro ao listar entradas:", e);
    }
  }

  atualizarEntradas();
});
