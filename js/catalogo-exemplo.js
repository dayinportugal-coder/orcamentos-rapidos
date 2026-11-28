/* Catálogo de preços de EXEMPLO (os mesmos valores de catalogo-exemplo.json). */
(function (root, data) {
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.CATALOGO_EXEMPLO = data;
})(typeof self !== "undefined" ? self : this, {
  "meta": {
    "titulo": "Catálogo de preços de EXEMPLO — caixilharia PVC/alumínio e estores",
    "aviso": "ESTES PREÇOS SÃO FICTÍCIOS E SERVEM APENAS DE EXEMPLO para testar o agente de orçamentos. Não são a tabela de nenhuma empresa real nem uma proposta comercial. Foram calibrados a partir de intervalos públicos consultados a 22/11/2026 (ver folha Fontes). Uma empresa piloto deve substituir todos os valores pelos seus preços reais, sem IVA, antes de usar o sistema.",
    "moeda": "EUR",
    "precos_incluem_iva": false,
    "data_pesquisa": "2026-11-22",
    "base_deslocacao": "Porto (exemplo; a empresa piloto altera a sede e as zonas)"
  },
  "regras": {
    "area_minima_m2_por_vao": 0.6,
    "encomenda_minima_eur_s_iva": 400.0,
    "validade_dias_default": 30,
    "arredondamento": "ao cêntimo, metade para cima (Math.round em cêntimos)"
  },
  "iva": {
    "taxa_normal": 0.23,
    "taxa_reduzida": 0.06,
    "regimes": [
      "normal_23",
      "habitacao_2_27",
      "aru_2_23"
    ],
    "nota_legal": "Em Portugal, a taxa normal de IVA é 23%. A taxa reduzida de 6% pode aplicar-se a certas empreitadas, nunca à mera venda de materiais (sempre 23%).\n\nVERBA 2.27 da Lista I anexa ao CIVA (a mais frequente na substituição de janelas em casas): empreitadas de beneficiação, remodelação, renovação, restauro, reparação ou conservação de imóveis ou frações autónomas afetos à habitação. Excluem-se limpeza, manutenção de espaços verdes e obras em piscinas, saunas, campos de ténis, golfe ou semelhantes. O imóvel tem de estar efetivamente afeto à habitação no início das obras e continuar a sê-lo depois (Ofício-Circulado n.º 30135, de 26/09/2012, Autoridade Tributária; Informação Vinculativa n.º 15421, despacho de 02/09/2019 — a AT aplicou esta verba expressamente a substituição de janelas/portas em imóveis de habitação). Beneficiários (donos da obra): proprietário, locatário ou condomínio.\n\nRegra dos 20% nos materiais (parte final da verba 2.27 e ponto 8 do Ofício-Circulado 30135): se o valor dos materiais incorporados for menor ou igual a 20% do valor global da empreitada, toda a empreitada é tributada a 6%. Se os materiais excederem 20% e a fatura discriminar mão de obra e materiais, a mão de obra vai a 6% e os materiais a 23%. Se a fatura for emitida por um preço global, sem essa discriminação, a verba 2.27 não se aplica e tudo vai a 23%. Na troca de janelas os materiais (caixilhos, vidros, estores) pesam quase sempre mais de 20% do total; o calculador parte desse cenário típico e exige a discriminação na fatura quando o regime é habitacao_2_27.\n\nConstrução nova, imóveis devolutos (para venda ou arrendamento), comércio/indústria e o fornecimento sem instalação (só venda de janelas) ficam, em regra, a 23% e não cabem na verba 2.27.\n\nVERBA 2.23: empreitadas de reabilitação de edifícios localizados em Área de Reabilitação Urbana (ARU) delimitada nos termos legais (redação atual após a Lei n.º 56/2023, de 6 de outubro). É um regime distinto da 2.27; exige prova da localização em ARU. A Lei n.º 48/2026, de 17 de agosto, fez a interpretação autêntica da redação anterior da verba 2.23 (pedidos anteriores / regime transitório).\n\nEste motor aplica regras operacionais de exemplo. O enquadramento fiscal de cada obra deve ser confirmado pelo contabilista certificado da empresa, com declaração do dono da obra e identificação do imóvel na fatura ('Taxa reduzida ao abrigo da verba 2.27 da Lista I anexa ao CIVA', quando aplicável).",
    "fontes_iva": [
      "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/instrucoes_administrativas/Documents/IVA-of%20circ%2030135.pdf",
      "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/INFORMACAO_15421.pdf",
      "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/informacoes_vinculativas/despesa/civa/Documents/PIV_28005.pdf",
      "https://norege.pt/noticias/guia-pratico-iva-obras-verbas-2-23-a-2-27/"
    ]
  },
  "series": [
    {
      "codigo": "PVC-70",
      "material": "pvc",
      "nome": "PVC 70 mm, 5 câmaras (gama económica)",
      "preco_eur_m2": 110.0,
      "notas": "Perfil ~70 mm, vidro duplo standard 4/16/4 incluído no preço base. Exemplo a meio-baixo da faixa pública de PVC."
    },
    {
      "codigo": "PVC-76",
      "material": "pvc",
      "nome": "PVC 76 mm, 6/7 câmaras (gama standard)",
      "preco_eur_m2": 135.0,
      "notas": "Série mais pedida em reabilitação de apartamentos. Vidro duplo standard incluído."
    },
    {
      "codigo": "PVC-82",
      "material": "pvc",
      "nome": "PVC 82 mm (gama premium)",
      "preco_eur_m2": 175.0,
      "notas": "Melhor isolamento; preparado para vidro triplo (o triplo é acréscimo na folha Vidros)."
    },
    {
      "codigo": "ALU-S",
      "material": "aluminio",
      "nome": "Alumínio sem rutura de ponte térmica",
      "preco_eur_m2": 100.0,
      "notas": "Gama antiga/económica; isolamento inferior. Ainda comercializada, mas não deve ser apresentada como 'janela eficiente'."
    },
    {
      "codigo": "ALU-RPT",
      "material": "aluminio",
      "nome": "Alumínio com rutura de ponte térmica (standard)",
      "preco_eur_m2": 155.0,
      "notas": "Série corrente com corte térmico, vidro duplo standard incluído."
    },
    {
      "codigo": "ALU-RPT-PREMIUM",
      "material": "aluminio",
      "nome": "Alumínio RPT folha oculta / grandes vãos",
      "preco_eur_m2": 210.0,
      "notas": "Estética mais esbelta, vãos maiores, zona de mar ou vento."
    }
  ],
  "aberturas": [
    {
      "codigo": "fixo",
      "nome": "Fixo (não abre)",
      "fator": 0.85
    },
    {
      "codigo": "batente_1_folha",
      "nome": "Batente, 1 folha",
      "fator": 1.0
    },
    {
      "codigo": "batente_2_folhas",
      "nome": "Batente, 2 folhas",
      "fator": 1.15
    },
    {
      "codigo": "oscilobatente_1_folha",
      "nome": "Oscilobatente, 1 folha",
      "fator": 1.1
    },
    {
      "codigo": "oscilobatente_2_folhas",
      "nome": "Oscilobatente, 2 folhas",
      "fator": 1.22
    },
    {
      "codigo": "correr_2_folhas",
      "nome": "Correr, 2 folhas",
      "fator": 1.12
    },
    {
      "codigo": "correr_3_folhas",
      "nome": "Correr, 3 ou mais folhas",
      "fator": 1.28
    },
    {
      "codigo": "osciloparalela",
      "nome": "Osciloparalela",
      "fator": 1.42
    },
    {
      "codigo": "basculante",
      "nome": "Basculante",
      "fator": 1.08
    },
    {
      "codigo": "guilhotina",
      "nome": "Guilhotina",
      "fator": 1.32
    },
    {
      "codigo": "porta_batente_1_folha",
      "nome": "Porta de varanda, 1 folha (batente/oscilobatente)",
      "fator": 1.18
    },
    {
      "codigo": "porta_correr_2_folhas",
      "nome": "Porta de correr, 2 folhas",
      "fator": 1.22
    }
  ],
  "vidros": [
    {
      "codigo": "duplo_standard",
      "nome": "Vidro duplo 4/16/4 standard (incluído no preço da série)",
      "acrescimo_eur_m2": 0.0,
      "notas": "Incluído no €/m² da série."
    },
    {
      "codigo": "duplo_lowe_argon",
      "nome": "Vidro duplo Low-E com árgon",
      "acrescimo_eur_m2": 28.0,
      "notas": "Melhoria térmica habitual em reabilitação."
    },
    {
      "codigo": "triplo",
      "nome": "Vidro triplo",
      "acrescimo_eur_m2": 58.0,
      "notas": "Mais indicado em séries premium (PVC-82, ALU-RPT-PREMIUM)."
    },
    {
      "codigo": "acustico",
      "nome": "Vidro acústico laminado (acréscimo sobre o vidro escolhido)",
      "acrescimo_eur_m2": 42.0,
      "notas": "Pode somar-se a Low-E ou triplo se o pedido o exigir (campo extra no item)."
    },
    {
      "codigo": "controlo_solar",
      "nome": "Vidro de controlo solar (acréscimo)",
      "acrescimo_eur_m2": 36.0,
      "notas": "Fachadas nascentes/poentes com forte exposição."
    },
    {
      "codigo": "temperado",
      "nome": "Vidro temperado de segurança (acréscimo)",
      "acrescimo_eur_m2": 22.0,
      "notas": "Portas, vãos baixos, exigência de segurança."
    }
  ],
  "cores": [
    {
      "codigo": "branco",
      "nome": "Branco (PVC) / lacagem branca standard (alumínio)",
      "tipo": "percentagem",
      "valor": 0.0,
      "aplica_a": "base_serie",
      "notas": "Sem acréscimo."
    },
    {
      "codigo": "folheado",
      "nome": "Folheado PVC (antracite, madeira, cores de catálogo)",
      "tipo": "percentagem",
      "valor": 0.16,
      "aplica_a": "base_serie",
      "notas": "16% sobre o preço base da série × fator de abertura × área (antes dos vidros extra)."
    },
    {
      "codigo": "bicolor",
      "nome": "Bicolor (cor diferente interior/exterior)",
      "tipo": "percentagem",
      "valor": 0.24,
      "aplica_a": "base_serie",
      "notas": "24% sobre a base da série."
    },
    {
      "codigo": "ral_standard",
      "nome": "Lacagem RAL standard (alumínio)",
      "tipo": "m2",
      "valor": 18.0,
      "aplica_a": "area",
      "notas": "Acréscimo €/m² no alumínio. No PVC usar folheado."
    },
    {
      "codigo": "ral_especial",
      "nome": "Lacagem especial / texturada / cores fora de catálogo",
      "tipo": "m2",
      "valor": 38.0,
      "aplica_a": "area",
      "notas": "Acréscimo €/m²."
    }
  ],
  "estores": [
    {
      "codigo": "EST-PVC-MAN",
      "nome": "Estore de enrolar em PVC, comando manual (fita/manivela)",
      "preco_eur_m2": 52.0,
      "notas": "Fornecimento s/IVA. Instalação à parte se não for com a janela."
    },
    {
      "codigo": "EST-ALU-MAN",
      "nome": "Estore de enrolar em alumínio standard, manual",
      "preco_eur_m2": 68.0,
      "notas": ""
    },
    {
      "codigo": "EST-ALU-TERM-MAN",
      "nome": "Estore de enrolar em alumínio térmico (espuma), manual",
      "preco_eur_m2": 88.0,
      "notas": "Lâmina com isolamento. Gama mais pedida em reabilitação."
    },
    {
      "codigo": "EST-MOTOR",
      "nome": "Motorização tubular + interruptor (por vão)",
      "preco_eur_un": 130.0,
      "unidade": "vao",
      "notas": "Acréscimo por vão sobre o estore escolhido."
    },
    {
      "codigo": "EST-COMANDO",
      "nome": "Comando rádio / emissor (por vão ou kit)",
      "preco_eur_un": 55.0,
      "unidade": "un",
      "notas": ""
    },
    {
      "codigo": "EST-WIFI",
      "nome": "Controlo Wi-Fi / aplicação (acréscimo por vão)",
      "preco_eur_un": 95.0,
      "unidade": "un",
      "notas": ""
    },
    {
      "codigo": "EST-MOTORIZAR-EXISTENTE",
      "nome": "Motorizar estore existente (motor + interruptor, por vão)",
      "preco_eur_un": 180.0,
      "unidade": "vao",
      "notas": "Só mão de obra+motor; não inclui lâminas novas."
    }
  ],
  "mosquiteiros": [
    {
      "codigo": "MOS-FIXO",
      "nome": "Mosquiteiro fixo",
      "preco_eur_m2": 42.0
    },
    {
      "codigo": "MOS-ENROLAR",
      "nome": "Mosquiteiro de enrolar",
      "preco_eur_m2": 82.0
    },
    {
      "codigo": "MOS-PLISSE",
      "nome": "Mosquiteiro plissado (plissé)",
      "preco_eur_m2": 94.0
    }
  ],
  "servicos": [
    {
      "codigo": "REM-VAO",
      "nome": "Remoção e encaminhamento da caixilharia antiga",
      "unidade": "vao",
      "preco_eur": 35.0,
      "natureza": "mao_obra",
      "notas": "Por vão. Inclui remoção do caixilho e do estore antigo se existir, e encaminhamento residual de obra."
    },
    {
      "codigo": "INST-STD",
      "nome": "Instalação standard (acesso normal, até ~1,5 m de peitoril)",
      "unidade": "vao",
      "preco_eur": 65.0,
      "natureza": "mao_obra",
      "notas": "Por vão. Inclui assentamento, atghamento/espuma, silicone e remates correntes. Não inclui andaime nem trabalhos de pedreiro de especialidade."
    },
    {
      "codigo": "INST-COMPLEXA",
      "nome": "Instalação complexa (piso alto, vão grande, acesso difícil)",
      "unidade": "vao",
      "preco_eur": 95.0,
      "natureza": "mao_obra",
      "notas": "Substitui a instalação standard nesse vão. Andaime, se necessário, orçamenta-se à parte."
    },
    {
      "codigo": "AND-DIA",
      "nome": "Andaime ou plataforma (por dia, se necessário)",
      "unidade": "dia",
      "preco_eur": 85.0,
      "natureza": "mao_obra",
      "notas": "Valor indicativo; confirmar com o fornecedor de andaimes."
    }
  ],
  "deslocacao": [
    {
      "codigo": "A",
      "nome": "Zona A — Porto e arredores",
      "preco_eur": 0.0,
      "km_indicativos": "0–15",
      "notas": "Incluída no orçamento."
    },
    {
      "codigo": "B",
      "nome": "Zona B — até cerca de 25 km (Matosinhos, Maia, Gaia, Gondomar, Valongo…)",
      "preco_eur": 30.0,
      "km_indicativos": "15–25",
      "notas": "Valor fixo por visita de instalação (ida e volta)."
    },
    {
      "codigo": "C",
      "nome": "Zona C — 25 a 50 km (Santo Tirso, Paredes, Penafiel, Espinho, Santa Maria da Feira…)",
      "preco_eur": 55.0,
      "km_indicativos": "25–50",
      "notas": ""
    },
    {
      "codigo": "D",
      "nome": "Zona D — 50 a 80 km",
      "preco_eur": 85.0,
      "km_indicativos": "50–80",
      "notas": ""
    },
    {
      "codigo": "KM-EXTRA",
      "nome": "Quilómetro extra além de 80 km (ida e volta, por km de percurso)",
      "preco_eur": 0.55,
      "km_indicativos": ">80",
      "notas": "Somar a Zona D: preco = 85 + 0,55 × km além de 80 (percurso total ida e volta menos 160 km, ou campo km_extra no pedido)."
    }
  ],
  "fontes_precos": [
    {
      "fonte": "Habitissimo — Janelas de PVC: Preços e Orçamentos ONLINE [2026]",
      "url": "https://www.habitissimo.pt/orcamentos/janelas-de-pvc",
      "consulta": "22/11/2026 (página referida como atualizada a 10/06/2026)",
      "o_que_mede": "Fornecimento e instalação de janelas PVC (estimativa da plataforma)",
      "valores": "Média 210 €/m²; faixa 120–300 €/m². Também 'entre 100 € e 800 € por janela'. A própria plataforma e páginas que a citam avisam que uns valores incluem montagem e outros não, e que não é claro se incluem IVA. A Energia da Casa nota que os orçamentos das empresas no Habitissimo costumam vir sem IVA."
    },
    {
      "fonte": "Habitissimo, citado por Energia da Casa — Preço de janelas por m²",
      "url": "https://energiadacasa.pt/janelas/preco/",
      "consulta": "22/11/2026 (artigo atualizado a 16/11/2026)",
      "o_que_mede": "Mudar janelas com instalação; PVC; alumínio; troca num T3",
      "valores": "Troca de janelas: média 160 €/m² (120–200). Lisboa/Porto 140–200 €/m². PVC: média 210 €/m² (120–300). Alumínio: média 175 €/m² (100–250). T3: 2.500–4.000 €. Janela de alumínio 140×110 cm: 200 € simples, 300 € com corte térmico, 400 € com vidro triplo (valores Habitissimo)."
    },
    {
      "fonte": "Cume.pt — PVC ou alumínio: qual é melhor e mais barato? (2026)",
      "url": "https://cume.pt/blog/qual-e-a-melhor-opcao-janelas-em-pvc-ou-alumnio/",
      "consulta": "22/11/2026 (artigo atualizado a 12/11/2026)",
      "o_que_mede": "Valores indicativos Grande Lisboa, fornecimento + instalação + IVA incluído",
      "valores": "PVC instalado 170–320 €/m² (premium até 450). Alumínio com rutura térmica 200–450 €/m². Janela standard ~140×110 cm, vidro duplo: PVC 250–450 €; alumínio RPT 350–650 €."
    },
    {
      "fonte": "SKLO — Janelas de PVC: guia de preços e perfis 2026",
      "url": "https://sklo.pt/blog/janelas-pvc-guia",
      "consulta": "22/11/2026",
      "o_que_mede": "Referência de mercado em Portugal, instalação incluída",
      "valores": "Básica 5 câmaras vidro duplo 180–260 €/m²; média Energeto Low-E 260–350 €/m²; premium A84 vidro triplo 350–450 €/m²."
    },
    {
      "fonte": "faztudolocal — Substituição de janelas em PVC ou alumínio em Portugal 2026",
      "url": "https://faztudolocal.com/precos/substituicao-janelas-pvc-custo-2026/",
      "consulta": "22/11/2026 (guia datado 2026-10)",
      "o_que_mede": "Ordem de grandeza nacional / Porto, instalado, sem tabela oficial do Estado",
      "valores": "Nacional: PVC 350–850 €/vão; alumínio CT 500–1.150 €/vão; 280–550 €/m² instalado. Porto: PVC 380–900 €/vão; alumínio 540–1.220 €/vão; 300–580 €/m². O site sublinha que IMPIC/DGEG/Fundo Ambiental não publicam estes euros."
    },
    {
      "fonte": "Cume.pt — Estores elétricos e preço de portas de varanda e estores",
      "url": "https://cume.pt/blog/estores-eletricos-motorizar-preco/",
      "consulta": "22/11/2026 (estores elétricos atualizado a 10/10/2026; portas/estores a 23/09/2026)",
      "o_que_mede": "Grande Lisboa, com instalação e IVA, por vão",
      "valores": "Motorizar existente 150–300 €. Estore elétrico novo PVC 250–400 €; alumínio térmico 350–600 €. Na página de portas/estores: manuais 130–200 €, térmicos/compactos 180–280 €, elétricos 220–400 € por vão."
    },
    {
      "fonte": "Habitissimo — Instalar estores elétricos [2026]",
      "url": "https://www.habitissimo.pt/orcamentos/instalar-estores-eletricos",
      "consulta": "22/11/2026 (página atualizada a 10/06/2026)",
      "o_que_mede": "Exemplos para janela 1,40 × 2,00 m",
      "valores": "Estores elétricos com proteção térmica 270 €; compactos 180 €; exteriores em PVC 250 €; instalação de estores elétricos 120 € cada."
    },
    {
      "fonte": "Fábrica de Estores — estores por medida (FAQ de preço)",
      "url": "https://www.fabricadeestores.com/estores/estores-medida/",
      "consulta": "22/11/2026",
      "o_que_mede": "Preço por m² de estore por medida (produto; a visita de medição é à parte)",
      "valores": "45–120 €/m² consoante material, comando e dimensões."
    },
    {
      "fonte": "JanelaCerta.pt — compilação de preços PVC 2026",
      "url": "https://janelacerta.pt/preco-janelas-pvc",
      "consulta": "22/11/2026 (compilação referida com consulta a 19/10/2026)",
      "o_que_mede": "Recolha de faixas Habitissimo, Zaask e loja Maxmat (produto sem montagem)",
      "valores": "Confirma as faixas Habitissimo acima. Loja (só produto, medida standard): 94,90 € (60×60 cm) a 269 € (120×120 cm) na Maxmat, citada por JanelaCerta. Sem montagem — não é comparável ao €/m² instalado."
    }
  ]
});
