(function () {
  "use strict";

  var TIPOS = {
    batente: { tipo: "janela", abertura: "batente_1_folha", nome: "Janela de batente" },
    correr: { tipo: "janela", abertura: "correr_2_folhas", nome: "Janela de correr" },
    porta: { tipo: "janela", abertura: "porta_batente_1_folha", nome: "Porta de varanda" },
    estore: { tipo: "estore", abertura: null, nome: "Estore" }
  };
  var MATERIAIS = {
    pvc: { serieJanela: "PVC-76", serieEstore: "EST-PVC-MAN", nome: "PVC" },
    aluminio: { serieJanela: "ALU-RPT", serieEstore: "EST-ALU-TERM-MAN", nome: "Alumínio" }
  };

  function vaoNovo() {
    return {
      tipo: "batente",
      material: "pvc",
      larguraCm: 120,
      alturaCm: 140,
      quantidade: 1,
      vidroLowe: false,
      estore: false,
      instalacao: false
    };
  }

  function euro(n) {
    return Number(n).toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + "\u00a0€";
  }

  function clampInt(v, min, max) {
    var n = parseInt(String(v), 10);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function lerForm(form) {
    var tipo = form.tipo.value;
    var material = form.material.value;
    return {
      tipo: TIPOS[tipo] ? tipo : "batente",
      material: MATERIAIS[material] ? material : "pvc",
      larguraCm: clampInt(form.largura.value, 30, 400),
      alturaCm: clampInt(form.altura.value, 30, 400),
      quantidade: clampInt(form.quantidade.value, 1, 99),
      vidroLowe: !!(form.vidroLowe && form.vidroLowe.checked),
      estore: !!(form.estore && form.estore.checked),
      instalacao: !!(form.instalacao && form.instalacao.checked)
    };
  }

  function escreverForm(form, vao) {
    form.tipo.value = vao.tipo;
    form.material.value = vao.material;
    form.largura.value = vao.larguraCm;
    form.altura.value = vao.alturaCm;
    form.quantidade.value = vao.quantidade;
    form.vidroLowe.checked = !!vao.vidroLowe;
    form.estore.checked = !!vao.estore;
    form.instalacao.checked = !!vao.instalacao;
    atualizarVisibilidade(form, vao.tipo);
  }

  function atualizarVisibilidade(form, tipo) {
    var eJanela = tipo !== "estore";
    form.vidroLowe.closest("label").hidden = !eJanela;
    form.estore.closest("label").hidden = !eJanela;
    if (!eJanela) {
      form.vidroLowe.checked = false;
      form.estore.checked = false;
    }
  }

  function rotuloVao(vao) {
    var t = TIPOS[vao.tipo].nome;
    var m = MATERIAIS[vao.material].nome;
    var extras = [];
    if (vao.tipo !== "estore" && vao.vidroLowe) extras.push("Low-E");
    if (vao.tipo !== "estore" && vao.estore) extras.push("estore");
    if (vao.instalacao) extras.push("instalação");
    var extraTxt = extras.length ? " · " + extras.join(", ") : "";
    return t + " " + m + " " + vao.larguraCm + "\u00a0×\u00a0" + vao.alturaCm + "\u00a0cm ×\u00a0" + vao.quantidade + extraTxt;
  }

  function itensDeVao(vao) {
    var mat = MATERIAIS[vao.material];
    var meta = TIPOS[vao.tipo];
    var largura_mm = vao.larguraCm * 10;
    var altura_mm = vao.alturaCm * 10;
    var itens = [];
    if (vao.tipo === "estore") {
      itens.push({
        tipo: "estore",
        serie: mat.serieEstore,
        largura_mm: largura_mm,
        altura_mm: altura_mm,
        quantidade: vao.quantidade
      });
    } else {
      itens.push({
        tipo: "janela",
        serie: mat.serieJanela,
        abertura: meta.abertura,
        largura_mm: largura_mm,
        altura_mm: altura_mm,
        vidro: vao.vidroLowe ? "duplo_lowe_argon" : "duplo_standard",
        cor: "branco",
        quantidade: vao.quantidade,
        instalacao: vao.instalacao ? "standard" : "nao"
      });
      if (vao.estore) {
        itens.push({
          tipo: "estore",
          serie: mat.serieEstore,
          largura_mm: largura_mm,
          altura_mm: altura_mm,
          quantidade: vao.quantidade
        });
      }
    }
    if (vao.tipo === "estore" && vao.instalacao) {
      itens.push({
        tipo: "servico",
        codigo: "INST-STD",
        quantidade: vao.quantidade
      });
    }
    return itens;
  }

  function pedidoDe(vaos) {
    var itens = [];
    vaos.forEach(function (v) {
      itens = itens.concat(itensDeVao(v));
    });
    return {
      orcamento_id: "ORC-DEMO",
      iva: { regime: "normal_23" },
      deslocacao: { zona: "A" },
      observacoes: "Demonstração com preços de exemplo. Não é um orçamento de uma empresa real nem uma proposta comercial.",
      itens: itens,
      empresa: {
        nome: "Demonstração — Orçamentos Rápidos",
        email: "geral.orcamentosrapidos@gmail.com",
        area_servico: "Portugal"
      }
    };
  }

  function iniciar() {
    var calc = window.OrcamentosRapidosCalc;
    var catalogo = window.CATALOGO_EXEMPLO;
    var form = document.getElementById("form-vao");
    var lista = document.getElementById("lista-vaos");
    var resultado = document.getElementById("resultado");
    var folha = document.getElementById("folha-orcamento");
    var erroEl = document.getElementById("simulador-erro");
    if (!calc || !catalogo || !form || !lista || !resultado) return;

    var vaos = [vaoNovo()];
    var selecionado = 0;

    function mostrarErro(msg) {
      if (!erroEl) return;
      if (!msg) {
        erroEl.hidden = true;
        erroEl.textContent = "";
      } else {
        erroEl.hidden = false;
        erroEl.textContent = msg;
      }
    }

    function calcularAgora() {
      try {
        var orc = calc.calcular(pedidoDe(vaos), catalogo);
        mostrarErro("");
        return orc;
      } catch (err) {
        mostrarErro(err.message || "Não foi possível calcular este vão. Confirme as medidas.");
        return null;
      }
    }

    function renderLista() {
      lista.innerHTML = "";
      vaos.forEach(function (vao, i) {
        var li = document.createElement("li");
        if (i === selecionado) li.className = "ativo";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "vao-escolha";
        btn.setAttribute("aria-pressed", i === selecionado ? "true" : "false");
        btn.textContent = "Vão " + (i + 1) + " — " + rotuloVao(vao);
        btn.addEventListener("click", function () {
          selecionado = i;
          escreverForm(form, vaos[selecionado]);
          render();
        });
        li.appendChild(btn);
        if (vaos.length > 1) {
          var rem = document.createElement("button");
          rem.type = "button";
          rem.className = "vao-remover";
          rem.setAttribute("aria-label", "Remover vão " + (i + 1));
          rem.textContent = "Remover";
          rem.addEventListener("click", function () {
            vaos.splice(i, 1);
            if (selecionado >= vaos.length) selecionado = vaos.length - 1;
            escreverForm(form, vaos[selecionado]);
            render();
          });
          li.appendChild(rem);
        }
        lista.appendChild(li);
      });
    }

    function renderResultado(orc) {
      if (!orc) {
        resultado.innerHTML = "";
        if (folha) folha.innerHTML = "";
        atualizarBarra(null);
        return;
      }
      var linhasHtml = orc.linhas.map(function (l) {
        return (
          "<tr>" +
          "<td><span class=\"desc\">" + escapeHtml(l.descricao) + "</span>" +
          "<span class=\"qty\">" + formatQtd(l.quantidade) + "\u00a0" + escapeHtml(l.unidade) + " × " + euro(l.preco_unitario_s_iva) + "</span></td>" +
          "<td class=\"col-preco\">" + euro(l.total_s_iva) + "</td>" +
          "</tr>"
        );
      }).join("");
      var avisoMin = orc.linhas.some(function (l) { return l.codigo === "MIN-ENCOMENDA"; })
        ? "<p class=\"nota-min\">Neste catálogo de exemplo há uma encomenda mínima de 400\u00a0€ (s/IVA). A diferença aparece como regularização.</p>"
        : "";
      resultado.innerHTML =
        "<table class=\"linhas-orc\"><caption class=\"visually-hidden\">Linhas do orçamento de exemplo</caption>" +
        "<thead><tr><th scope=\"col\">Descrição</th><th scope=\"col\">s/IVA</th></tr></thead>" +
        "<tbody>" + linhasHtml + "</tbody></table>" +
        avisoMin +
        "<dl class=\"totais\">" +
        "<div><dt>Subtotal s/IVA</dt><dd>" + euro(orc.totais.subtotal_s_iva) + "</dd></div>" +
        "<div><dt>IVA 23%</dt><dd>" + euro(orc.totais.iva_total) + "</dd></div>" +
        "<div class=\"total\"><dt>Total c/IVA</dt><dd>" + euro(orc.totais.total_c_iva) + "</dd></div>" +
        "</dl>" +
        "<p class=\"aviso-exemplo\">Preços de exemplo — com a sua tabela, o orçamento sai com os seus preços e o seu logótipo.</p>";
      atualizarBarra(orc);
      preencherFolha(orc);
    }

    function formatQtd(q) {
      var n = Number(q);
      if (Number.isInteger(n)) return String(n);
      return n.toLocaleString("pt-PT", { maximumFractionDigits: 4 });
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function preencherFolha(orc) {
      if (!folha) return;
      var hoje = new Date();
      var data = hoje.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
      var linhas = orc.linhas.map(function (l) {
        return (
          "<tr><td>" + escapeHtml(l.descricao) + "</td><td>" + formatQtd(l.quantidade) +
          "\u00a0" + escapeHtml(l.unidade) + "</td><td>" + euro(l.preco_unitario_s_iva) +
          "</td><td>" + euro(l.total_s_iva) + "</td></tr>"
        );
      }).join("");
      folha.innerHTML =
        "<header class=\"folha-cab\">" +
        "<p class=\"folha-marca\">Orçamentos Rápidos</p>" +
        "<p class=\"folha-aviso\">Preços de exemplo — com a sua tabela, o orçamento sai com os seus preços e o seu logótipo. Este documento é uma demonstração, não uma proposta comercial de uma empresa real.</p>" +
        "<p>Data: " + escapeHtml(data) + " · Referência: " + escapeHtml(orc.orcamento_id) + "</p>" +
        "</header>" +
        "<h1>Orçamento de demonstração</h1>" +
        "<table><thead><tr><th>Descrição</th><th>Qtd</th><th>Preço s/IVA</th><th>Total s/IVA</th></tr></thead><tbody>" +
        linhas + "</tbody></table>" +
        "<dl class=\"folha-totais\">" +
        "<div><dt>Subtotal s/IVA</dt><dd>" + euro(orc.totais.subtotal_s_iva) + "</dd></div>" +
        "<div><dt>IVA 23%</dt><dd>" + euro(orc.totais.iva_total) + "</dd></div>" +
        "<div><dt>Total c/IVA</dt><dd>" + euro(orc.totais.total_c_iva) + "</dd></div>" +
        "</dl>" +
        "<p class=\"folha-nota\">IVA à taxa normal de 23%. Deslocação de exemplo: zona A (incluída). Cálculo feito no próprio browser, com o catálogo de exemplo da Orçamentos Rápidos.</p>";
    }

    function render() {
      renderLista();
      renderResultado(calcularAgora());
    }

    form.addEventListener("input", function () {
      atualizarVisibilidade(form, form.tipo.value);
      vaos[selecionado] = lerForm(form);
      // keep visible fields in range after clamp without fighting typing too hard
      renderLista();
      renderResultado(calcularAgora());
    });

    form.addEventListener("change", function () {
      vaos[selecionado] = lerForm(form);
      escreverForm(form, vaos[selecionado]);
      render();
    });

    document.getElementById("btn-adicionar").addEventListener("click", function () {
      vaos.push(vaoNovo());
      selecionado = vaos.length - 1;
      escreverForm(form, vaos[selecionado]);
      render();
      form.largura.focus();
    });

    function imprimir() {
      render();
      document.body.classList.add("a-imprimir");
      window.print();
    }
    document.getElementById("btn-pdf").addEventListener("click", imprimir);
    var btnBarra = document.getElementById("btn-pdf-barra");
    if (btnBarra) btnBarra.addEventListener("click", imprimir);
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("a-imprimir");
    });

    function atualizarBarra(orc) {
      var barra = document.getElementById("barra-total");
      var valor = document.getElementById("barra-valor");
      if (!barra || !valor) return;
      if (!orc) {
        valor.textContent = "—";
        barra.hidden = true;
        return;
      }
      valor.textContent = euro(orc.totais.total_c_iva);
      barra.hidden = false;
    }

    escreverForm(form, vaos[0]);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
