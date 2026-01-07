# Dashboard SIAPS - Sistema de Saúde

## Descrição
Dashboard interativo para visualização de indicadores de saúde materno-infantil do sistema SIAPS, focado no cuidado com gestantes e puérperas.

## Características

### 🎨 Design
- Interface moderna com esquema de cores em tons de azul
- Layout responsivo e intuitivo
- Animações suaves e transições elegantes
- Efeito glass morphism nos cards

### 📊 Funcionalidades

#### 1. Barra Lateral
- **Home**: Visão geral do dashboard
- **Análises**: Análises detalhadas com gráficos comparativos
- **Fórum**: Área de discussões (em desenvolvimento)
- **Perfil**: Acesso às configurações do usuário

#### 2. Filtros Dinâmicos
- Região de Saúde
- Município
- Competência (mês)

#### 3. Cards Principais
- **Percentual de Boas Práticas**: Cálculo automático baseado na fórmula
- **Total de Boas Práticas**: Somatório total
- **Gestantes e Puérperas**: Número total vinculado

#### 4. Gráficos
- **Evolução Mensal**: Gráfico de linha mostrando tendência mês a mês
- **Evolução Acumulada**: Gráfico de linha com valores acumulados
- **Comparativo de Indicadores**: Gráfico de barras (na aba Análises)

#### 5. Diagrama de Indicadores
Visualização dos 11 indicadores principais:
1. Primeira consulta de pré-natal até 12 semanas
2. Mínimo de 07 consultas durante gestação
3. 07 registros de pressão arterial
4. 07 registros de peso e altura
5. 03 visitas domiciliares ACS/TACS
6. Dose DTPA a partir da 20ª semana
7. Testes rápidos 1º trimestre
8. Testes rápidos 3º trimestre
9. Consulta durante puerpério
10. Visita domiciliar durante puerpério
11. Avaliação odontológica

## Como Usar

1. Abra o arquivo `index.html` em um navegador moderno
2. O dashboard carregará automaticamente os dados do arquivo `Gestantes.csv`
3. Use os filtros para explorar diferentes regiões, municípios e períodos
4. Navegue entre as abas usando a barra lateral

## Tecnologias Utilizadas

- **React 18**: Framework JavaScript
- **Chart.js 4**: Biblioteca de gráficos
- **Tailwind CSS**: Framework CSS
- **PapaParse**: Parser de CSV
- **Font Awesome**: Ícones
- **Google Fonts (Inter)**: Tipografia moderna

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (para carregar bibliotecas CDN)
- Arquivo `Gestantes.csv` na mesma pasta

## Estrutura de Arquivos

```
DASHBOARD/
├── index.html          # Arquivo principal do dashboard
├── Gestantes.csv       # Base de dados
└── README.md          # Este arquivo
```

## Fórmulas de Cálculo

### Percentual de Boas Práticas
```
(SOMATÓRIO DE BOAS PRÁTICAS / NÚMERO TOTAL DE GESTANTES) × 100
```

### Indicadores Individuais
```
(TOTAL DO INDICADOR / NÚMERO TOTAL DE GESTANTES) × 100
```

## Suporte

Para dúvidas ou sugestões, entre em contato com a equipe SIAPS.
