// Protege acesso direto
if (localStorage.getItem("autenticado") !== "true") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("💠 Fluxium iniciado...");

  // ======================
  // Função de Fade-Out universal
  // ======================
  function fadeOutAndRedirect(url) {
    const fadeDiv = document.createElement("div");
    fadeDiv.style.position = "fixed";
    fadeDiv.style.top = 0;
    fadeDiv.style.left = 0;
    fadeDiv.style.width = "100%";
    fadeDiv.style.height = "100%";
    fadeDiv.style.background = "linear-gradient(135deg, #4b79a1, #283e51)";
    fadeDiv.style.opacity = 0;
    fadeDiv.style.transition = "opacity 0.8s ease";
    fadeDiv.style.zIndex = 9999;
    document.body.appendChild(fadeDiv);

    // ativa o fade
    setTimeout(() => (fadeDiv.style.opacity = 1), 50);

    // redireciona após o efeito
    setTimeout(() => {
      window.location.href = url;
    }, 800);
  }

  // ======================
  // NAVEGAÇÃO ENTRE ABAS
  // ======================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((tc) => tc.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // ======================
  // BOTÃO SAIR (com fade)
  // ======================
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("autenticado");
    fadeOutAndRedirect("login.html");
  });

  // ======================
  // VARIÁVEIS
  // ======================
  let caixaInicial = 0;
  let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
  let historico = JSON.parse(localStorage.getItem("historico")) || [];

  // ======================
  // ELEMENTOS
  // ======================
  const elements = {
    valorInicial: document.getElementById("valorInicial"),
    confirmarCaixa: document.getElementById("confirmarCaixa"),
    valorRecebido: document.getElementById("valorRecebido"),
    formaPagamento: document.getElementById("formaPagamento"),
    valorTroco: document.getElementById("valorTroco"),
    adicionarEntrada: document.getElementById("adicionarEntrada"),
    listaLancamentos: document.getElementById("listaLancamentos"),
    totalDia: document.getElementById("totalDia"),
    finalizarDia: document.getElementById("finalizarDia"),
    historicoFechamentos: document.getElementById("historicoFechamentos"),
    totalSemanal: document.getElementById("totalSemanal"),
    exportarDados: document.getElementById("exportarDados"),
    exportarHistorico: document.getElementById("exportarHistorico"),
  };

  // ======================
  // FUNÇÕES AUXILIARES
  // ======================
  function atualizarLista() {
    elements.listaLancamentos.innerHTML = "";
    let total = caixaInicial;

    lancamentos.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `💵 R$ ${item.valor.toFixed(2)} | ${item.forma} | Troco: R$ ${item.troco.toFixed(2)} <small>${item.data}</small>`;
      elements.listaLancamentos.appendChild(li);
      total += item.valor - item.troco;
    });

    elements.totalDia.textContent = total.toFixed(2);
  }

  function atualizarHistorico() {
    elements.historicoFechamentos.innerHTML = "";
    let totalSemanal = 0;
    historico.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.data} — Total: R$ ${item.total.toFixed(2)}`;
      elements.historicoFechamentos.appendChild(li);
      totalSemanal += item.total;
    });
    elements.totalSemanal.textContent = totalSemanal.toFixed(2);
  }

  function limparCampos() {
    elements.valorRecebido.value = "";
    elements.valorTroco.value = "";
    elements.formaPagamento.selectedIndex = 0;
  }

  // ======================
  // EXPORTAÇÃO (mantida)
  // ======================
  function exportarPlanilhaDiaAtual() {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const dados = [
      ["FLUXIUM - RELATÓRIO DIÁRIO"],
      ["Data:", dataAtual],
      [],
      ["Valor (R$)", "Forma", "Troco (R$)", "Hora"],
    ];
    lancamentos.forEach((item) => {
      dados.push([
        item.valor.toFixed(2),
        item.forma,
        item.troco.toFixed(2),
        item.data,
      ]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fluxium_Diario");
    XLSX.writeFile(workbook, "fluxium_diario_" + dataAtual.replace(/\//g, "-") + ".xlsx");
    alert("📊 Fluxium: Relatório diário exportado com sucesso!");
  }

  function exportarPlanilhaHistorico() {
    const dados = [
      ["FLUXIUM - HISTÓRICO DE FECHAMENTOS"],
      [],
      ["Data", "Total (R$)"],
    ];
    historico.forEach((item) => {
      dados.push([item.data, item.total.toFixed(2)]);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fluxium_Historico");
    XLSX.writeFile(workbook, "fluxium_historico.xlsx");
    alert("📅 Fluxium: Histórico exportado com sucesso!");
  }

  // ======================
  // EVENTOS
  // ======================
  elements.confirmarCaixa.addEventListener("click", () => {
    const valor = parseFloat(elements.valorInicial.value);
    if (!valor || valor <= 0) {
      alert("Informe um valor válido!");
      return;
    }
    caixaInicial = valor;
    alert(`💠 Fluxium: Caixa inicial de R$ ${caixaInicial.toFixed(2)} registrado.`);
    atualizarLista();
  });

  elements.adicionarEntrada.addEventListener("click", () => {
    const valor = parseFloat(elements.valorRecebido.value);
    const forma = elements.formaPagamento.value;
    const troco = parseFloat(elements.valorTroco.value) || 0;
    if (!valor || valor <= 0) {
      alert("Informe um valor válido!");
      return;
    }

    const entrada = {
      valor,
      forma,
      troco,
      data: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    lancamentos.push(entrada);
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
    atualizarLista();
    limparCampos();
  });

  elements.finalizarDia.addEventListener("click", () => {
    const totalDia = parseFloat(elements.totalDia.textContent);
    const data = new Date().toLocaleDateString("pt-BR");
    historico.push({ data, total: totalDia });
    localStorage.setItem("historico", JSON.stringify(historico));
    lancamentos = [];
    caixaInicial = 0;
    localStorage.removeItem("lancamentos");
    atualizarLista();
    atualizarHistorico();
    alert("📅 Fluxium: Fechamento do dia salvo com sucesso!");
  });

  elements.exportarDados.addEventListener("click", exportarPlanilhaDiaAtual);
  elements.exportarHistorico.addEventListener("click", exportarPlanilhaHistorico);

  // ======================
  // INICIALIZAÇÃO
  // ======================
  atualizarLista();
  atualizarHistorico();
});
