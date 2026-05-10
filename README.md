<div align="center">

```
  ⬡  EPIDEMIC CALCULATOR
     SIR Model Simulator
```

[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=github&logoColor=white)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4db8ff?style=flat-square)](LICENSE)

**Modelo epidemiológico interativo para simulação da propagação de doenças infecciosas.**  
Comparação em tempo real entre cenários com e sem vacinação, exportação de dados e interface científica responsiva.

[🚀 Ver Demo](#-hospedagem) · [📖 Documentação](#-como-usar) · [🧮 Modelo Matemático](#-modelo-epidemiológico) · [⬇ Exportar](#-exportação-de-resultados)

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Capturas de Tela](#-capturas-de-tela)
- [Modelo Epidemiológico](#-modelo-epidemiológico)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Usar](#-como-usar)
- [Parâmetros da Simulação](#-parâmetros-da-simulação)
- [Exportação de Resultados](#-exportação-de-resultados)
- [Hospedagem](#-hospedagem)
- [Limitações](#-limitações)
- [Referências](#-referências)
- [Licença](#-licença)

---

## 🔬 Visão Geral

O **Epidemic Calculator** é uma aplicação web científica que simula a propagação de doenças infecciosas usando o clássico **modelo compartimental SIR**, estendido com compartimentos de vacinação (V) e óbitos (D), resultando em um modelo **SVIRD**.

A ferramenta foi projetada para fins **educacionais e de pesquisa exploratória**, permitindo que estudantes, pesquisadores e profissionais de saúde pública visualizem e compreendam intuitivamente como parâmetros epidemiológicos — taxa de transmissão, taxa de recuperação, cobertura vacinal — moldam as curvas de uma epidemia.

> **Contexto acadêmico:** Este projeto foi desenvolvido como instrumento didático vinculado à disciplina de Sustentabilidade, com o objetivo de integrar modelagem matemática, desenvolvimento web e reflexão crítica sobre o uso de inteligência artificial generativa no processo criativo.

---

## ✨ Funcionalidades

### Simulação
- ⚡ **Tempo real** — recálculo instantâneo a cada ajuste de parâmetro
- 🔀 **Dois cenários simultâneos** — Cenário A (sem vacinação) vs. Cenário B (com vacinação)
- 🧮 **Modelo SVIRD** — Suscetíveis, Vacinados, Infectados, Recuperados, Óbitos
- 📐 **Indicadores derivados** — R₀, período infeccioso e limiar de imunidade coletiva

### Interface
- 🌙 **Tema escuro por padrão** com alternância para tema claro
- 📱 **Layout responsivo** — funciona em desktop, tablet e smartphone
- 💡 **Tooltips explicativos** em cada parâmetro
- 🎨 **Dashboard científico** com tipografia e paleta cromática cuidadosamente escolhidas

### Visualização
- 📊 **3 gráficos Chart.js** — comparação de cenários e detalhe de compartimentos
- 🎯 **Métricas resumidas** — pico de infectados, dia do pico, total de óbitos, vacinados
- 🔴 **R₀ codificado por cor** — azul (controlado), amarelo (moderado), vermelho (crítico)

### Exportação
- 📥 **CSV completo** — série temporal dia a dia de todos os compartimentos
- 📄 **Resumo em texto** — parâmetros, métricas e impacto da vacinação

---

## 📸 Capturas de Tela

```
┌─────────────────────────────────────────────────────────────────┐
│  ⬡ Epidemic Calculator          SIR Model Simulator       ☀ Light│
├──────────────────┬──────────────────────────────────────────────┤
│                  │  R₀: 3.00   │  Período: 10d  │  Limiar: 67%  │
│  PARÂMETROS      ├──────────────────────────────────────────────┤
│                  │  [A] Sem Vacina    │  [B] Com Vacina         │
│  População       │  Pico: 298k D.85  │  Pico: 89k  D.102       │
│  ──────── 1M     │  Total: 940k      │  Total: 312k            │
│                  │  Óbitos: 9.400    │  Óbitos: 3.120          │
│  Beta β  0.30    ├──────────────────────────────────────────────┤
│  Gamma γ 0.10    │                                              │
│  Mort. μ 1.0%    │   ████ Gráfico de Comparação                 │
│                  │   — — Cenário A (sem vacina)                 │
│  Vacinação       │   - - Cenário B (com vacina)                 │
│  Rate  0.5%/dia  │                                              │
│  Efic. 90%       ├──────────────────────────────────────────────┤
│                  │  Detalhe A  │  Detalhe B (+ compartimento V) │
│  Dias: 365       │             │                                │
│                  │  S I R D    │  S I R V D                     │
│  ⬇ CSV  ⬇ Sumário└────────────┴────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Modelo Epidemiológico

### O Modelo SIR e suas extensões

O simulador implementa o modelo **SVIRD** — uma extensão do clássico SIR de Kermack & McKendrick (1927) — usando integração numérica pelo **método de Euler** com passo temporal de **1 dia**.

#### Compartimentos

| Símbolo | Nome | Descrição |
|---------|------|-----------|
| **S** | Suscetíveis | Indivíduos que podem contrair a doença |
| **V** | Vacinados | Imunizados por campanha vacinal (Cenário B) |
| **I** | Infectados | Doentes e transmissores ativos |
| **R** | Recuperados | Imunes após infecção |
| **D** | Óbitos | Casos fatais acumulados |

#### Equações Diferenciais

**Cenário A — SIRD (sem vacinação):**

```
dS/dt = −β · S · I / N
dI/dt =  β · S · I / N  −  γ · I  −  μ · I
dR/dt =  γ · I
dD/dt =  μ · I
```

**Cenário B — SVIRD (com vacinação):**

```
dS/dt = −β · S · I / N  −  v · ε · S
dV/dt =  v · ε · S
dI/dt =  β · S · I / N  −  γ · I  −  μ · I
dR/dt =  γ · I
dD/dt =  μ · I
```

onde `v` é a taxa diária de vacinação e `ε` é a eficácia da vacina.

#### Indicadores Derivados

| Indicador | Fórmula | Interpretação |
|-----------|---------|---------------|
| **R₀** | `β / γ` | Número médio de infecções secundárias por caso em população totalmente suscetível |
| **Período infeccioso** | `1 / γ` | Duração média (em dias) do estado infeccioso |
| **Limiar de imunidade coletiva** | `1 − 1/R₀` | Fração mínima imune para suprimir a epidemia |

> **Interpretação do R₀:**  
> 🔵 R₀ < 1 → epidemia se extingue naturalmente  
> 🟡 1 ≤ R₀ < 2 → crescimento moderado  
> 🔴 R₀ ≥ 2 → crescimento rápido, risco elevado

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| **HTML5** | — | Estrutura semântica da interface |
| **CSS3** | — | Layout responsivo, variáveis de tema, animações |
| **JavaScript ES2022** | — | Lógica de simulação, DOM, exportação |
| **Chart.js** | 4.4.0 | Gráficos interativos via CDN |
| **Google Fonts** | — | Syne (títulos) + DM Sans (corpo) + DM Mono (dados) |

**Sem frameworks, sem build tools, sem backend.** Abre diretamente no navegador.

---

## 📁 Estrutura do Projeto

```
epidemic-calculator/
│
├── index.html          # Estrutura HTML e layout da interface
├── style.css           # Estilos, variáveis de tema e responsividade
├── script.js           # Simulação SIR, gráficos e exportação
└── README.md           # Este arquivo
```

### Organização do `script.js`

```
script.js
├── DEFAULTS            → Valores padrão de todos os parâmetros
├── simulateSIRD()      → Motor do Cenário A (sem vacinação)
├── simulateSVIRD()     → Motor do Cenário B (com vacinação)
├── computeMetrics()    → Cálculo de métricas resumidas
├── updateComparisonChart() → Gráfico de curvas sobrepostas
├── updateChartA/B()    → Gráficos de detalhe por cenário
├── updateMetrics()     → Atualização do painel de indicadores
├── exportCSV()         → Download da série temporal em CSV
├── exportSummary()     → Download do resumo em texto
└── init()              → Inicialização e registro de eventos
```

---

## 🚀 Como Usar

### Execução local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/epidemic-calculator.git

# Entre na pasta
cd epidemic-calculator

# Abra no navegador — sem servidor necessário
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Ou simplesmente **arraste o arquivo `index.html` para qualquer aba do navegador**.

### Fluxo de uso

1. **Ajuste os parâmetros** na barra lateral usando os controles deslizantes
2. **Observe em tempo real** a atualização dos gráficos e métricas
3. **Compare os cenários** — Cenário A (linha sólida) vs. Cenário B (linha tracejada)
4. **Passe o cursor** sobre os ícones `?` para explicações de cada parâmetro
5. **Exporte os resultados** em CSV ou resumo de texto
6. **Alterne o tema** com o botão no cabeçalho (☀ / ☾)
7. Use **↺ Reset** para restaurar os valores padrão

---

## ⚙️ Parâmetros da Simulação

### Parâmetros de População

| Parâmetro | Padrão | Intervalo | Descrição |
|-----------|--------|-----------|-----------|
| **População total (N)** | 1.000.000 | 1.000 – 10.000.000 | Total de indivíduos no modelo |
| **Infectados iniciais (I₀)** | 100 | 1 – 10.000 | Casos ativos no Dia 0 |
| **Imunes iniciais (R₀)** | 0 | 0 – 500.000 | Indivíduos já imunes no Dia 0 |

### Parâmetros de Transmissão

| Parâmetro | Padrão | Intervalo | Descrição |
|-----------|--------|-----------|-----------|
| **Taxa de transmissão (β)** | 0,30 | 0,01 – 1,00 | Probabilidade de infecção por contato/dia |
| **Taxa de recuperação (γ)** | 0,10 | 0,01 – 0,50 | Fração de infectados que recuperam por dia |
| **Taxa de mortalidade (μ)** | 1,0% | 0 – 5% | Fração de infectados que evoluem para óbito |

### Parâmetros de Vacinação (Cenário B)

| Parâmetro | Padrão | Intervalo | Descrição |
|-----------|--------|-----------|-----------|
| **Taxa diária de vacinação** | 0,5%/dia | 0 – 5%/dia | Fração de S vacinados a cada dia |
| **Eficácia da vacina** | 90% | 0 – 100% | Proporção de vacinados que adquirem imunidade |

### Parâmetro de Simulação

| Parâmetro | Padrão | Intervalo | Descrição |
|-----------|--------|-----------|-----------|
| **Duração (dias)** | 365 | 30 – 730 | Horizonte temporal da simulação |

### Referências de valores reais

| Doença | R₀ estimado | β típico | γ típico |
|--------|------------|---------|---------|
| Influenza sazonal | 1,2 – 1,4 | 0,20 | 0,14 |
| COVID-19 (Wuhan) | 2,0 – 3,5 | 0,25 | 0,10 |
| Sarampo | 12 – 18 | 1,50 | 0,10 |
| Ebola | 1,5 – 2,5 | 0,20 | 0,10 |

---

## 📥 Exportação de Resultados

### CSV — Série Temporal Completa

Clique em **⬇ CSV Data** para baixar `epidemic_simulation.csv` com o formato:

```csv
Day,A_Susceptible,A_Infected,A_Recovered,A_Deceased,B_Susceptible,B_Infected,B_Recovered,B_Vaccinated,B_Deceased
0,999900,100,0,0,999900,100,0,0,0
1,999870,128,2,0,999820,127,2,51,0
2,999837,163,4,1,999738,161,4,104,1
...
365,60432,18,929146,9404,421032,11,287743,581203,3012
```

> Compatível com Excel, R, Python (pandas), Google Sheets e qualquer ferramenta de análise de dados.

### Resumo em Texto

Clique em **⬇ Summary** para baixar `epidemic_summary.txt` com:

- Todos os parâmetros utilizados
- Métricas de ambos os cenários (pico, total, óbitos)
- Impacto da vacinação (redução percentual do pico, óbitos evitados)
- Indicadores derivados (R₀, período infeccioso, limiar de imunidade coletiva)

---

## 🌐 Hospedagem

### GitHub Pages (recomendado — gratuito)

```bash
# 1. Crie um repositório no GitHub
# 2. Envie os arquivos
git init
git add .
git commit -m "feat: epidemic calculator initial release"
git remote add origin https://github.com/seu-usuario/epidemic-calculator.git
git push -u origin main

# 3. Ative o GitHub Pages
# Settings → Pages → Source: Deploy from branch → main / root → Save

# Sua aplicação estará disponível em:
# https://seu-usuario.github.io/epidemic-calculator/
```

### Outras opções gratuitas

| Plataforma | Comando / Procedimento |
|-----------|----------------------|
| **Netlify** | Arraste a pasta para [netlify.com/drop](https://netlify.com/drop) |
| **Vercel** | `npx vercel` na pasta do projeto |
| **Surge.sh** | `npx surge epidemic-calculator/` |

---

## ⚠️ Limitações

Este simulador é uma ferramenta **educacional e exploratória**. As seguintes limitações devem ser consideradas antes de qualquer uso interpretativo:

| Limitação | Impacto | Alternativa |
|-----------|---------|-------------|
| **Mistura homogênea** | Ignora estrutura etária, geográfica e redes de contato | Modelos por faixas etárias, modelos em redes |
| **Sem estocasticidade** | Resultados determinísticos; inadequado para populações pequenas | Modelos estocásticos (Gillespie, ABM) |
| **Método de Euler** | Pode acumular erro em simulações longas | Runge-Kutta RK4, solvers adaptativos |
| **Parâmetros constantes** | Ignora variação sazonal, mutações virais, intervenções temporais | Modelos com parâmetros variáveis no tempo |
| **População fechada** | Sem nascimentos, mortes naturais ou migração | Modelos demográficos integrados |
| **Imunidade permanente** | Assume que recuperados não perdem imunidade | Modelos SIRS (perda de imunidade) |

> Para aplicações de saúde pública reais, consulte especialistas em epidemiologia e utilize modelos validados como os desenvolvidos pelo Imperial College London, CDC ou FIOCRUZ.

---

## 📚 Referências

- KERMACK, W. O.; McKENDRICK, A. G. *A contribution to the mathematical theory of epidemics.* Proceedings of the Royal Society of London. Series A, v. 115, n. 772, p. 700–721, 1927.
- HETHCOTE, H. W. *The mathematics of infectious diseases.* SIAM Review, v. 42, n. 4, p. 599–653, 2000.
- VYNNYCKY, E.; WHITE, R. G. *An Introduction to Infectious Disease Modelling.* Oxford: Oxford University Press, 2010.
- Chart.js Documentation. Disponível em: https://www.chartjs.org/docs/

---

## 📄 Licença

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

Desenvolvido com 🔬 e assistência de IA generativa para fins educacionais.

**[⬆ Voltar ao topo](#-epidemic-calculator)**

</div>
