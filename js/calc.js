(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.OrcamentosRapidosCalc = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
"use strict";

/**
 * Calculador determinístico de orçamentos de caixilharia.
 * Não chama nenhum modelo de linguagem. Preços vêm de catalogo_precos.json.
 *
 * Versão para o browser (e para testes em Node). Recebe o pedido e o catálogo;
 * não acede à rede nem a um servidor.
 */



function toCents(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    throw new Error(`Valor numérico inválido: ${n}`);
  }
  return Math.round(n * 100);
}

function euros(cents) {
  return Math.round(cents) / 100;
}

function money(cents) {
  return Number(euros(cents).toFixed(2));
}

function byCodigo(lista) {
  const m = new Map();
  for (const item of lista) m.set(item.codigo, item);
  return m;
}

function areaM2(larguraMm, alturaMm) {
  if (!(larguraMm > 0) || !(alturaMm > 0)) {
    throw new Error(`Medidas inválidas: ${larguraMm} × ${alturaMm} mm`);
  }
  return (larguraMm / 1000) * (alturaMm / 1000);
}

function areaFaturavel(area, minima) {
  return Math.max(area, minima);
}

function naturezaIva(natureza) {
  return natureza === "mao_obra" ? "mao_obra" : "materiais";
}

function indexCatalogo(cat) {
  return {
    cat,
    series: byCodigo(cat.series),
    aberturas: byCodigo(cat.aberturas),
    vidros: byCodigo(cat.vidros),
    cores: byCodigo(cat.cores),
    estores: byCodigo(cat.estores),
    mosquiteiros: byCodigo(cat.mosquiteiros),
    servicos: byCodigo(cat.servicos),
    deslocacao: byCodigo(cat.deslocacao),
    areaMin: cat.regras.area_minima_m2_por_vao,
    minEncomenda: cat.regras.encomenda_minima_eur_s_iva,
  };
}

function linha({ codigo, descricao, quantidade, unidade, precoUnitarioEur, natureza, detalhe }) {
  const q = quantidade;
  const unitCents = toCents(precoUnitarioEur);
  const totalCents = Math.round(unitCents * q);
  return {
    codigo,
    descricao,
    quantidade: Number(q.toFixed(4)),
    unidade,
    preco_unitario_s_iva: money(unitCents),
    total_s_iva: money(totalCents),
    natureza: naturezaIva(natureza),
    detalhe: detalhe || null,
    _cents: totalCents,
  };
}

function calcJanela(item, idx, ix) {
  const qtd = item.quantidade == null ? 1 : item.quantidade;
  if (!(qtd > 0) || !Number.isInteger(qtd)) {
    throw new Error(`Item ${idx + 1}: quantidade de janela tem de ser um inteiro positivo`);
  }
  const serie = ix.series.get(item.serie);
  if (!serie) throw new Error(`Item ${idx + 1}: série desconhecida '${item.serie}'`);
  const abertura = ix.aberturas.get(item.abertura);
  if (!abertura) throw new Error(`Item ${idx + 1}: abertura desconhecida '${item.abertura}'`);
  const vidro = ix.vidros.get(item.vidro || "duplo_standard");
  if (!vidro) throw new Error(`Item ${idx + 1}: vidro desconhecido '${item.vidro}'`);
  const cor = ix.cores.get(item.cor || "branco");
  if (!cor) throw new Error(`Item ${idx + 1}: cor desconhecida '${item.cor}'`);

  const areaReal = areaM2(item.largura_mm, item.altura_mm);
  const areaUnit = areaFaturavel(areaReal, ix.areaMin);
  const areaTot = areaUnit * qtd;

  const linhas = [];
  const baseUnitEur = serie.preco_eur_m2 * abertura.fator;
  linhas.push(
    linha({
      codigo: serie.codigo,
      descricao: `${serie.nome} — ${abertura.nome} — ${item.largura_mm} × ${item.altura_mm} mm` +
        (qtd > 1 ? ` (×${qtd})` : ""),
      quantidade: areaTot,
      unidade: "m²",
      precoUnitarioEur: baseUnitEur,
      natureza: "materiais",
      detalhe: {
        tipo: "janela",
        area_real_m2_unitario: Number(areaReal.toFixed(4)),
        area_faturavel_m2_unitario: Number(areaUnit.toFixed(4)),
        fator_abertura: abertura.fator,
      },
    })
  );

  if (vidro.acrescimo_eur_m2) {
    linhas.push(
      linha({
        codigo: vidro.codigo,
        descricao: `${vidro.nome} — ${item.largura_mm} × ${item.altura_mm} mm`,
        quantidade: areaTot,
        unidade: "m²",
        precoUnitarioEur: vidro.acrescimo_eur_m2,
        natureza: "materiais",
      })
    );
  }
  for (const extra of item.vidros_extra || []) {
    const vx = ix.vidros.get(extra);
    if (!vx) throw new Error(`Item ${idx + 1}: vidro extra desconhecido '${extra}'`);
    if (!vx.acrescimo_eur_m2) continue;
    linhas.push(
      linha({
        codigo: vx.codigo,
        descricao: `${vx.nome} — ${item.largura_mm} × ${item.altura_mm} mm`,
        quantidade: areaTot,
        unidade: "m²",
        precoUnitarioEur: vx.acrescimo_eur_m2,
        natureza: "materiais",
      })
    );
  }

  if (cor.tipo === "percentagem" && cor.valor) {
    const baseCents = linhas[0]._cents;
    const acrescimoCents = Math.round(baseCents * cor.valor);
    linhas.push({
      codigo: cor.codigo,
      descricao: `${cor.nome} (${Math.round(cor.valor * 100)}% sobre a série)`,
      quantidade: 1,
      unidade: "un",
      preco_unitario_s_iva: money(acrescimoCents),
      total_s_iva: money(acrescimoCents),
      natureza: "materiais",
      detalhe: { percentagem: cor.valor },
      _cents: acrescimoCents,
    });
  } else if (cor.tipo === "m2" && cor.valor) {
    linhas.push(
      linha({
        codigo: cor.codigo,
        descricao: cor.nome,
        quantidade: areaTot,
        unidade: "m²",
        precoUnitarioEur: cor.valor,
        natureza: "materiais",
      })
    );
  }

  const instalacao = item.instalacao; // "standard" | "complexa" | false | "nao"
  if (instalacao && instalacao !== "nao" && instalacao !== "não") {
    const cod = instalacao === "complexa" ? "INST-COMPLEXA" : "INST-STD";
    const svc = ix.servicos.get(cod);
    linhas.push(
      linha({
        codigo: svc.codigo,
        descricao: `${svc.nome} — ${qtd} vão(s)`,
        quantidade: qtd,
        unidade: "vão",
        precoUnitarioEur: svc.preco_eur,
        natureza: "mao_obra",
      })
    );
  }
  if (item.remocao_antiga) {
    const svc = ix.servicos.get("REM-VAO");
    linhas.push(
      linha({
        codigo: svc.codigo,
        descricao: `${svc.nome} — ${qtd} vão(s)`,
        quantidade: qtd,
        unidade: "vão",
        precoUnitarioEur: svc.preco_eur,
        natureza: "mao_obra",
      })
    );
  }
  return linhas;
}

function calcAreaItem(item, ix, idx, mapa, tipoNome) {
  const qtd = item.quantidade == null ? 1 : item.quantidade;
  if (!(qtd > 0) || !Number.isInteger(qtd)) {
    throw new Error(`Item ${idx + 1}: quantidade tem de ser um inteiro positivo`);
  }
  const ref = mapa.get(item.serie || item.modelo || item.codigo);
  if (!ref) {
    throw new Error(`Item ${idx + 1}: ${tipoNome} desconhecido '${item.serie || item.modelo || item.codigo}'`);
  }
  if (ref.preco_eur_m2 == null) {
    throw new Error(`Item ${idx + 1}: o código '${ref.codigo}' não é precificado por m²`);
  }
  const areaReal = areaM2(item.largura_mm, item.altura_mm);
  const areaUnit = areaFaturavel(areaReal, ix.areaMin);
  const areaTot = areaUnit * qtd;
  const linhas = [
    linha({
      codigo: ref.codigo,
      descricao: `${ref.nome} — ${item.largura_mm} × ${item.altura_mm} mm` + (qtd > 1 ? ` (×${qtd})` : ""),
      quantidade: areaTot,
      unidade: "m²",
      precoUnitarioEur: ref.preco_eur_m2,
      natureza: "materiais",
      detalhe: {
        tipo: tipoNome,
        area_real_m2_unitario: Number(areaReal.toFixed(4)),
        area_faturavel_m2_unitario: Number(areaUnit.toFixed(4)),
      },
    }),
  ];
  return { linhas, qtd, ref };
}

function calcEstore(item, idx, ix) {
  const { linhas, qtd } = calcAreaItem(item, ix, idx, ix.estores, "estore");
  const extras = [
    ["motorizacao", "EST-MOTOR", (v) => v === true || v === "interruptor"],
    ["comando_radio", "EST-COMANDO", (v) => !!v],
    ["wifi", "EST-WIFI", (v) => !!v],
  ];
  if (item.serie === "EST-MOTORIZAR-EXISTENTE" || item.codigo === "EST-MOTORIZAR-EXISTENTE") {
    // priced per vão, not m2 — handled separately
  }
  for (const [campo, codigo, ok] of extras) {
    if (ok(item[campo] || item.comando === campo || item.comando === codigo)) {
      const ex = ix.estores.get(codigo);
      linhas.push(
        linha({
          codigo: ex.codigo,
          descricao: `${ex.nome} — ${qtd} vão(s)`,
          quantidade: qtd,
          unidade: "vão",
          precoUnitarioEur: ex.preco_eur_un,
          natureza: "materiais",
        })
      );
    }
  }
  // comando: "manual" | "motor" | "motor_radio" | "motor_wifi"
  const cmd = item.comando;
  if (cmd === "motor" || cmd === "motorizado") {
    if (!linhas.some((l) => l.codigo === "EST-MOTOR")) {
      const ex = ix.estores.get("EST-MOTOR");
      linhas.push(linha({
        codigo: ex.codigo, descricao: `${ex.nome} — ${qtd} vão(s)`,
        quantidade: qtd, unidade: "vão", precoUnitarioEur: ex.preco_eur_un, natureza: "materiais",
      }));
    }
  }
  if (cmd === "motor_radio" || cmd === "radio") {
    if (!linhas.some((l) => l.codigo === "EST-MOTOR")) {
      const ex = ix.estores.get("EST-MOTOR");
      linhas.push(linha({
        codigo: ex.codigo, descricao: `${ex.nome} — ${qtd} vão(s)`,
        quantidade: qtd, unidade: "vão", precoUnitarioEur: ex.preco_eur_un, natureza: "materiais",
      }));
    }
    if (!linhas.some((l) => l.codigo === "EST-COMANDO")) {
      const ex = ix.estores.get("EST-COMANDO");
      linhas.push(linha({
        codigo: ex.codigo, descricao: `${ex.nome} — ${qtd} vão(s)`,
        quantidade: qtd, unidade: "vão", precoUnitarioEur: ex.preco_eur_un, natureza: "materiais",
      }));
    }
  }
  if (cmd === "motor_wifi" || cmd === "wifi") {
    if (!linhas.some((l) => l.codigo === "EST-MOTOR")) {
      const ex = ix.estores.get("EST-MOTOR");
      linhas.push(linha({
        codigo: ex.codigo, descricao: `${ex.nome} — ${qtd} vão(s)`,
        quantidade: qtd, unidade: "vão", precoUnitarioEur: ex.preco_eur_un, natureza: "materiais",
      }));
    }
    if (!linhas.some((l) => l.codigo === "EST-WIFI")) {
      const ex = ix.estores.get("EST-WIFI");
      linhas.push(linha({
        codigo: ex.codigo, descricao: `${ex.nome} — ${qtd} vão(s)`,
        quantidade: qtd, unidade: "vão", precoUnitarioEur: ex.preco_eur_un, natureza: "materiais",
      }));
    }
  }
  return linhas;
}

function calcMotorizarExistente(item, idx, ix) {
  const qtd = item.quantidade == null ? 1 : item.quantidade;
  if (!(qtd > 0) || !Number.isInteger(qtd)) {
    throw new Error(`Item ${idx + 1}: quantidade tem de ser um inteiro positivo`);
  }
  const ex = ix.estores.get("EST-MOTORIZAR-EXISTENTE");
  return [
    linha({
      codigo: ex.codigo,
      descricao: `${ex.nome} — ${qtd} vão(s)`,
      quantidade: qtd,
      unidade: "vão",
      precoUnitarioEur: ex.preco_eur_un,
      natureza: "mao_obra",
    }),
  ];
}

function calcMosquiteiro(item, idx, ix) {
  return calcAreaItem(item, ix, idx, ix.mosquiteiros, "mosquiteiro").linhas;
}

function calcServicoAvulso(item, idx, ix) {
  const qtd = item.quantidade == null ? 1 : item.quantidade;
  if (!(qtd > 0)) throw new Error(`Item ${idx + 1}: quantidade inválida`);
  const svc = ix.servicos.get(item.codigo || item.serie);
  if (!svc) throw new Error(`Item ${idx + 1}: serviço desconhecido '${item.codigo || item.serie}'`);
  return [
    linha({
      codigo: svc.codigo,
      descricao: svc.nome,
      quantidade: qtd,
      unidade: svc.unidade === "vao" ? "vão" : svc.unidade,
      precoUnitarioEur: svc.preco_eur,
      natureza: svc.natureza,
    }),
  ];
}

function calcDeslocacao(pedido, ix) {
  const d = pedido.deslocacao || { zona: "A" };
  const zona = String(d.zona || "A").toUpperCase();
  if (zona === "A" || zona === "B" || zona === "C" || zona === "D") {
    const z = ix.deslocacao.get(zona);
    const linhas = [];
    if (z.preco_eur > 0) {
      linhas.push(
        linha({
          codigo: `DESL-${z.codigo}`,
          descricao: `Deslocação — ${z.nome}`,
          quantidade: 1,
          unidade: "visita",
          precoUnitarioEur: z.preco_eur,
          natureza: "mao_obra",
        })
      );
    }
    const kmExtra = d.km_extra || 0;
    if (kmExtra && zona === "D") {
      const k = ix.deslocacao.get("KM-EXTRA");
      linhas.push(
        linha({
          codigo: "KM-EXTRA",
          descricao: k.nome,
          quantidade: kmExtra,
          unidade: "km",
          precoUnitarioEur: k.preco_eur,
          natureza: "mao_obra",
        })
      );
    } else if (kmExtra && zona !== "D") {
      throw new Error("km_extra só se aplica à zona D (além de 80 km)");
    }
    return linhas;
  }
  throw new Error(`Zona de deslocação desconhecida '${d.zona}'`);
}

function aplicarIva(linhas, pedido, avisos) {
  const iva = pedido.iva || { regime: "normal_23" };
  const regime = iva.regime || "normal_23";
  const discriminar = iva.discriminar_materiais_e_mao_obra !== false;
  const matCents = linhas.filter((l) => l.natureza === "materiais").reduce((s, l) => s + l._cents, 0);
  const moCents = linhas.filter((l) => l.natureza === "mao_obra").reduce((s, l) => s + l._cents, 0);
  const subtotalCents = matCents + moCents;
  const temMaoObra = moCents > 0;

  const taxaN = 0.23;
  const taxaR = 0.06;

  let ivaMatCents = 0;
  let ivaMoCents = 0;
  let taxaMat = taxaN;
  let taxaMo = taxaN;
  let enquadramento = "";
  let verba = null;

  if (regime === "normal_23") {
    taxaMat = taxaN;
    taxaMo = taxaN;
    enquadramento = "Taxa normal de 23% (construção nova, comércio, imóvel não afeto à habitação, ou regime não invocado).";
  } else if (regime === "aru_2_23") {
    verba = "2.23";
    if (!temMaoObra) {
      taxaMat = taxaN;
      taxaMo = taxaN;
      enquadramento =
        "Regime aru_2_23 pedido, mas não há mão de obra de empreitada (só fornecimento). A mera transmissão de bens vai a 23%.";
      avisos.push(enquadramento);
    } else {
      taxaMat = taxaR;
      taxaMo = taxaR;
      enquadramento =
        "Taxa reduzida de 6% ao abrigo da verba 2.23 da Lista I anexa ao CIVA, na pressuposição de empreitada de reabilitação de edifício situado em Área de Reabilitação Urbana delimitada. Confirmar com o contabilista e com certidão/comprovativo municipal da ARU.";
    }
  } else if (regime === "habitacao_2_27") {
    verba = "2.27";
    if (!temMaoObra) {
      taxaMat = taxaN;
      taxaMo = taxaN;
      enquadramento =
        "Regime habitacao_2_27 pedido, mas não há instalação/remoção (só fornecimento). A mera venda de materiais é sempre tributada a 23%.";
      avisos.push(enquadramento);
    } else if (iva.imovel_afeto_habitacao === false) {
      taxaMat = taxaN;
      taxaMo = taxaN;
      enquadramento = "O pedido indica que o imóvel não está afeto à habitação: aplica-se a taxa normal de 23%.";
      avisos.push(enquadramento);
    } else {
      const pesoMat = subtotalCents === 0 ? 0 : matCents / subtotalCents;
      if (pesoMat <= 0.20) {
        taxaMat = taxaR;
        taxaMo = taxaR;
        enquadramento =
          "Taxa reduzida de 6% sobre toda a empreitada ao abrigo da verba 2.27 da Lista I anexa ao CIVA: os materiais não excedem 20% do valor global. Confirmar afetação habitacional e demais requisitos com o contabilista.";
      } else if (!discriminar) {
        taxaMat = taxaN;
        taxaMo = taxaN;
        enquadramento =
          "Os materiais excedem 20% do valor global e o pedido não discrimina mão de obra e materiais. Nos termos do Ofício-Circulado n.º 30135, a verba 2.27 não se aplica a um preço global: tudo é tributado a 23%.";
        avisos.push(enquadramento);
      } else {
        taxaMat = taxaN;
        taxaMo = taxaR;
        enquadramento =
          "Verba 2.27 da Lista I anexa ao CIVA: os materiais excedem 20% do valor global da empreitada, pelo que, com fatura discriminada, a mão de obra é tributada a 6% e os materiais a 23%. Confirmar afetação habitacional (imóvel habitado antes e depois das obras) com o contabilista. Indicar na fatura: «Taxa reduzida ao abrigo da verba 2.27 da Lista I anexa ao CIVA».";
      }
    }
  } else {
    throw new Error(`Regime de IVA desconhecido '${regime}'. Use normal_23, habitacao_2_27 ou aru_2_23.`);
  }

  ivaMatCents = Math.round(matCents * taxaMat);
  ivaMoCents = Math.round(moCents * taxaMo);

  // Anotar taxa por linha
  for (const l of linhas) {
    const taxa = l.natureza === "mao_obra" ? taxaMo : taxaMat;
    l.taxa_iva = taxa;
    l.iva = money(Math.round(l._cents * taxa));
    l.total_c_iva = money(l._cents + Math.round(l._cents * taxa));
  }

  return {
    regime,
    verba,
    enquadramento,
    discriminar_materiais_e_mao_obra: discriminar,
    materiais_s_iva: money(matCents),
    mao_obra_s_iva: money(moCents),
    peso_materiais: subtotalCents === 0 ? 0 : Number((matCents / subtotalCents).toFixed(4)),
    taxa_iva_materiais: taxaMat,
    taxa_iva_mao_obra: taxaMo,
    iva_materiais: money(ivaMatCents),
    iva_mao_obra: money(ivaMoCents),
    iva_total: money(ivaMatCents + ivaMoCents),
    subtotal_s_iva: money(subtotalCents),
    total_c_iva: money(subtotalCents + ivaMatCents + ivaMoCents),
    _subtotalCents: subtotalCents,
    _ivaCents: ivaMatCents + ivaMoCents,
  };
}

function calcular(pedido, catalogo) {
  if (!pedido || typeof pedido !== "object") throw new Error("Pedido em falta");
  if (!Array.isArray(pedido.itens) || pedido.itens.length === 0) {
    throw new Error("O pedido não tem itens");
  }
  if (!catalogo) throw new Error("Catálogo em falta");
  const cat = catalogo;
  const ix = indexCatalogo(cat);
  const avisos = [];
  const linhas = [];

  pedido.itens.forEach((item, idx) => {
    const tipo = item.tipo || "janela";
    if (tipo === "janela" || tipo === "porta") {
      linhas.push(...calcJanela(item, idx, ix));
    } else if (tipo === "estore") {
      const cod = item.serie || item.codigo || item.modelo;
      if (cod === "EST-MOTORIZAR-EXISTENTE") linhas.push(...calcMotorizarExistente(item, idx, ix));
      else linhas.push(...calcEstore(item, idx, ix));
    } else if (tipo === "mosquiteiro") {
      linhas.push(...calcMosquiteiro(item, idx, ix));
    } else if (tipo === "servico") {
      linhas.push(...calcServicoAvulso(item, idx, ix));
    } else {
      throw new Error(`Item ${idx + 1}: tipo desconhecido '${tipo}'`);
    }
  });

  linhas.push(...calcDeslocacao(pedido, ix));

  let somaCents = linhas.reduce((s, l) => s + l._cents, 0);
  const minCents = toCents(ix.minEncomenda);
  if (somaCents < minCents) {
    const diff = minCents - somaCents;
    const jaTemMaoObra = linhas.some((l) => l.natureza === "mao_obra");
    const naturezaMin = jaTemMaoObra ? "mao_obra" : "materiais";
    linhas.push({
      codigo: "MIN-ENCOMENDA",
      descricao: `Regularização até à encomenda mínima de ${ix.minEncomenda.toFixed(2)} € s/IVA`,
      quantidade: 1,
      unidade: "un",
      preco_unitario_s_iva: money(diff),
      total_s_iva: money(diff),
      natureza: naturezaMin,
      detalhe: { encomenda_minima_eur: ix.minEncomenda },
      _cents: diff,
    });
    avisos.push(`Foi aplicada a encomenda mínima de ${ix.minEncomenda.toFixed(2)} € s/IVA.`);
    somaCents = minCents;
  }

  const iva = aplicarIva(linhas, pedido, avisos);
  const validade = pedido.validade_dias || cat.regras.validade_dias_default;

  const linhasPublicas = linhas.map((l) => {
    const { _cents, ...rest } = l;
    return rest;
  });

  return {
    orcamento_id: pedido.orcamento_id || null,
    data: pedido.data || null,
    validade_dias: validade,
    cliente: pedido.cliente || null,
    empresa: pedido.empresa || {
      nome: "Caixilharia Exemplo, Lda.",
      email: "orcamentos@caixilharia-exemplo.pt",
      website: "https://www.caixilharia-exemplo.pt",
      area_servico: "Porto e Norte de Portugal",
    },
    avisos,
    linhas: linhasPublicas,
    totais: {
      materiais_s_iva: iva.materiais_s_iva,
      mao_obra_s_iva: iva.mao_obra_s_iva,
      subtotal_s_iva: iva.subtotal_s_iva,
      peso_materiais: iva.peso_materiais,
      iva_materiais: iva.iva_materiais,
      iva_mao_obra: iva.iva_mao_obra,
      iva_total: iva.iva_total,
      total_c_iva: iva.total_c_iva,
    },
    iva: {
      regime: iva.regime,
      verba: iva.verba,
      discriminar_materiais_e_mao_obra: iva.discriminar_materiais_e_mao_obra,
      taxa_iva_materiais: iva.taxa_iva_materiais,
      taxa_iva_mao_obra: iva.taxa_iva_mao_obra,
      enquadramento: iva.enquadramento,
    },
    observacoes: pedido.observacoes || "",
    catalogo_aviso: cat.meta.aviso,
  };
}

  return { calcular, toCents, euros, money, areaM2, areaFaturavel, indexCatalogo };
});
