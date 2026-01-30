// Configuração de estados
const STATE_CONFIG = {
    acre: { name: 'Acre', uf: 'AC', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-12-mun.json' },
    rn: { name: 'Rio Grande do Norte', uf: 'RN', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-24-mun.json' },
    am: { name: 'Amazonas', uf: 'AM', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-13-mun.json' },
    mt: { name: 'Mato Grosso', uf: 'MT', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-51-mun.json' },
    msp: { name: 'São Paulo (Capital)', uf: 'SP', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-35-mun.json', isMunicipio: true, municipioCode: '3550308' }
};

// Lista de UFs disponíveis para cadastro
const AVAILABLE_UFS = [
    { key: 'acre', name: 'Acre', uf: 'AC' },
    { key: 'am', name: 'Amazonas', uf: 'AM' },
    { key: 'mt', name: 'Mato Grosso', uf: 'MT' },
    { key: 'rn', name: 'Rio Grande do Norte', uf: 'RN' },
    { key: 'msp', name: 'São Paulo (Capital)', uf: 'SP' }
];

// Configurações por tipo de indicador
const INDICATOR_CONFIG = {
    gestantes: {
        title: 'Gestantes e Puérperas',
        icon: 'fa-baby',
        color: 'from-pink-500 to-rose-600',
        bgColor: 'bg-pink-500',
        totalField: 'totalGestantes',
        totalLabel: 'gestantes',
        csvFiles: {
            acre: { file: './Gestantes_clean.csv', delimiter: ',', encoding: 'utf-8' },
            rn: { file: './RN_GESTANTES.csv', delimiter: ';', encoding: 'windows-1252' },
            am: { file: './GESTANTES_AMAZONAS_fixed.csv', delimiter: ';', encoding: 'utf-8' },
            mt: { file: './GESTANTES_MT.csv', delimiter: ';', encoding: 'windows-1252' },
            msp: { file: './GESTANTES_MSP.csv', delimiter: ';', encoding: 'windows-1252' }
        },
        indicatorCount: 11,
        fullNames: [
            'Ter realizado a primeira consulta de pré-natal até 12 semanas de gestação',
            'Ter realizado pelo menos 07 consultas durante o período de gestação',
            'Ter realizado pelo menos 07 registros de pressão arterial',
            'Ter realizado pelo menos 07 registros de peso e altura',
            'Ter registro de pelo menos 03 visitas domiciliares do ACS/TACS',
            'Ter registro de uma dose de DTPA a partir da 20ª semana',
            'Ter registro dos testes do primeiro trimestre (sífilis, HIV, hepatites)',
            'Ter registro dos testes do terceiro trimestre (sífilis, HIV)',
            'Ter registro de consulta durante o puerpério',
            'Ter registro de visita domiciliar durante o puerpério',
            'Ter registro de avaliação odontológica durante a gestação'
        ],
        shortNames: [
            'Consulta pré-natal até 12 sem', '07 consultas gestação', '07 registros PA',
            '07 registros peso/altura', '03 visitas ACS/TACS', 'Dose DTPA 20ª sem',
            'Testes 1º trim', 'Testes 3º trim', 'Consulta puerpério',
            'Visita puerpério', 'Avaliação odontológica'
        ]
    },
    has: {
        title: 'Hipertensão Arterial',
        icon: 'fa-heart-pulse',
        color: 'from-red-500 to-red-700',
        bgColor: 'bg-red-500',
        totalField: 'totalPacientes',
        totalLabel: 'hipertensos',
        csvFiles: {
            rn: { file: './RN_HAS.csv', delimiter: ';', encoding: 'windows-1252' }
        },
        indicatorCount: 4,
        fullNames: [
            'Ter realizado pelo menos 01 consulta presencial ou remota nos últimos 6 meses',
            'Ter pelo menos 01 registro de medição da pressão arterial nos últimos 6 meses',
            'Ter pelo menos 02 visitas domiciliares por ACS/TACS nos últimos 12 meses',
            'Ter realizado pelo menos 01 registro de peso e altura nos últimos 12 meses'
        ],
        shortNames: [
            'Consulta 6 meses', 'Medição PA 6 meses', '02 visitas ACS 12 meses', 'Peso/altura 12 meses'
        ]
    },
    dm: {
        title: 'Diabetes Mellitus',
        icon: 'fa-droplet',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-500',
        totalField: 'totalPacientes',
        totalLabel: 'diabéticos',
        csvFiles: {
            rn: { file: './RN_DM.csv', delimiter: ';', encoding: 'windows-1252' }
        },
        indicatorCount: 6,
        fullNames: [
            'Ter realizado pelo menos 01 consulta presencial ou remota nos últimos 6 meses',
            'Ter pelo menos 01 registro de medição da pressão arterial nos últimos 6 meses',
            'Ter pelo menos 02 visitas domiciliares por ACS/TACS nos últimos 12 meses',
            'Ter realizado pelo menos 01 registro de peso e altura nos últimos 12 meses',
            'Ter pelo menos 01 registro de hemoglobina glicada nos últimos 12 meses',
            'Ter pelo menos 01 registro de avaliação dos pés nos últimos 15 meses'
        ],
        shortNames: [
            'Consulta 6 meses', 'Medição PA 6 meses', '02 visitas ACS 12 meses', 
            'Peso/altura 12 meses', 'Hemoglobina glicada', 'Avaliação dos pés'
        ]
    }
};

const MONTH_ORDER = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Mapeamento de nomes de meses (CSV pode ter variações)
const MONTH_MAP = {
    'janeiro': 'Janeiro', 'fevereiro': 'Fevereiro', 'março': 'Março', 'marco': 'Março', 'mar�o': 'Março',
    'abril': 'Abril', 'maio': 'Maio', 'junho': 'Junho', 'julho': 'Julho',
    'agosto': 'Agosto', 'setembro': 'Setembro', 'outubro': 'Outubro',
    'novembro': 'Novembro', 'dezembro': 'Dezembro'
};

const normalizeMonth = (m) => {
    if (!m) return m;
    const trimmed = m.trim();
    // Detectar variações de Março com caracteres corrompidos (Mar?o, Marï¿½o, Mar�o, etc)
    if (/^mar.{1,3}o$/i.test(trimmed)) return 'Março';
    const lower = trimmed.toLowerCase();
    if (MONTH_MAP[lower]) return MONTH_MAP[lower];
    if (MONTH_ORDER.includes(trimmed)) return trimmed;
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (MONTH_ORDER.includes(capitalized)) return capitalized;
    return trimmed;
};

const INDICATOR_FULL_NAMES = INDICATOR_CONFIG.gestantes.fullNames;
const INDICATOR_SHORT = INDICATOR_CONFIG.gestantes.shortNames;

// Categorização de boas práticas
const getCategoria = (taxa) => {
    if (taxa >= 75) return { label: 'Ótimo', color: '#1e3a5f', bg: 'bg-blue-900' };
    if (taxa >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (taxa >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getCategoriaTaxa = (taxa) => {
    // Para taxa de boas práticas (valores como 19.40)
    if (taxa >= 75) return { label: 'Ótimo', color: '#1e3a5f', bg: 'bg-blue-900' };
    if (taxa >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (taxa >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    if (taxa >= 0) return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getCategoriaComponente = (pct) => {
    // Para componentes (percentuais de 0-100)
    if (pct >= 75) return { label: 'Ótimo', color: '#1e3a5f', bg: 'bg-blue-900' };
    if (pct >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (pct >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getStatusClass = v => v >= 75 ? 'status-otimo' : v >= 50 ? 'status-bom' : v >= 25 ? 'status-suficiente' : 'status-regular';
const getStatusText = v => v >= 75 ? 'Ótimo' : v >= 50 ? 'Bom' : v >= 25 ? 'Suficiente' : 'Regular';
const getColor = v => v >= 75 ? '#1e3a5f' : v >= 50 ? '#84cc16' : v >= 25 ? '#fbbf24' : '#ef4444';
const getTaxaColor = v => getColor(v);
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatDateShort = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const MetricCard = ({ title, value, sub, icon, color }) => (
    <div className="card metric-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="metric-value">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                <i className={`${icon} text-white text-xl`}></i>
            </div>
        </div>
    </div>
);

const LineChart = ({ data }) => {
    const ref = React.useRef(null), chart = React.useRef(null);
    React.useEffect(() => {
        if (!ref.current || !data?.length) return;
        if (chart.current) chart.current.destroy();
        chart.current = new Chart(ref.current, {
            type: 'line',
            data: { labels: data.map(d => d.month.slice(0,3)), datasets: [{ data: data.map(d => d.taxa), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
        });
        return () => chart.current?.destroy();
    }, [data]);
    return React.createElement('canvas', { ref });
};

const BarChartHorizontal = ({ data, labelKey, valueKey, height }) => {
    const ref = React.useRef(null), chart = React.useRef(null);
    React.useEffect(() => {
        if (!ref.current || !data?.length) return;
        if (chart.current) chart.current.destroy();
        const labels = data.map(d => d[labelKey].length > 35 ? d[labelKey].slice(0,35) + '...' : d[labelKey]);
        chart.current = new Chart(ref.current, {
            type: 'bar',
            data: { labels, datasets: [{ data: data.map(d => d[valueKey]), backgroundColor: data.map(d => getTaxaColor(d[valueKey])), borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { title: (ctx) => data[ctx[0].dataIndex][labelKey] } } }, scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 10 } } } } }
        });
        return () => chart.current?.destroy();
    }, [data]);
    return React.createElement('canvas', { ref });
};

const HeatmapWithFilters = ({ data, indicatorCount = 11, shortNames = [], rawData = [], getHeatmapFn }) => {
    const [matrixFilters, setMatrixFilters] = React.useState({ viewMode: 'municipio', regiao: 'Todas', municipio: 'Todos', unidade: 'Todas', equipe: 'Todas' });
    
    const regiaoOptions = rawData ? [...new Set(rawData.map(r => r.regiao).filter(Boolean))].sort() : [];
    const municipioOptions = rawData ? [...new Set(rawData.filter(r => matrixFilters.regiao === 'Todas' || r.regiao === matrixFilters.regiao).map(r => r.municipio).filter(Boolean))].sort() : [];
    const unidadeOptions = rawData ? [...new Set(rawData.filter(r => (matrixFilters.regiao === 'Todas' || r.regiao === matrixFilters.regiao) && (matrixFilters.municipio === 'Todos' || r.municipio === matrixFilters.municipio)).map(r => r.estabelecimento).filter(Boolean))].sort() : [];
    const equipeOptions = rawData ? [...new Set(rawData.filter(r => (matrixFilters.regiao === 'Todas' || r.regiao === matrixFilters.regiao) && (matrixFilters.municipio === 'Todos' || r.municipio === matrixFilters.municipio) && (matrixFilters.unidade === 'Todas' || r.estabelecimento === matrixFilters.unidade)).map(r => r.nomeEquipe).filter(Boolean))].sort() : [];

    const filteredRawData = rawData ? rawData.filter(r => {
        if (matrixFilters.regiao !== 'Todas' && r.regiao !== matrixFilters.regiao) return false;
        if (matrixFilters.municipio !== 'Todos' && r.municipio !== matrixFilters.municipio) return false;
        if (matrixFilters.unidade !== 'Todas' && r.estabelecimento !== matrixFilters.unidade) return false;
        if (matrixFilters.equipe !== 'Todas' && r.nomeEquipe !== matrixFilters.equipe) return false;
        return true;
    }) : [];

    const getMatrixData = () => {
        if (!filteredRawData.length) return [];
        const groupField = matrixFilters.viewMode === 'regiao' ? 'regiao' : matrixFilters.viewMode === 'unidade' ? 'estabelecimento' : matrixFilters.viewMode === 'equipe' ? 'nomeEquipe' : 'municipio';
        const groups = [...new Set(filteredRawData.map(r => r[groupField]).filter(Boolean))];
        return groups.map(g => {
            const d = filteredRawData.filter(r => r[groupField] === g);
            const tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0);
            const sm = d.reduce((s,r) => s + r.somatorio, 0);
            const comps = Array.from({length: indicatorCount}, (_,i) => {
                const sum = d.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0);
                return tg ? (sum/tg)*100 : 0;
            });
            return { municipio: g, taxa: tg ? sm/tg : 0, tg, sm, comps };
        }).sort((a,b) => b.taxa - a.taxa);
    };

    const matrixData = getMatrixData();
    const indicators = Array.from({length: indicatorCount}, (_, i) => i + 1);
    const viewModeLabels = { municipio: 'Municípios', regiao: 'Regiões', unidade: 'Unidades', equipe: 'Equipes' };
    const hasFilters = matrixFilters.regiao !== 'Todas' || matrixFilters.municipio !== 'Todos' || matrixFilters.unidade !== 'Todas' || matrixFilters.equipe !== 'Todas';

    return React.createElement('div', null,
        // Filtros internos
        React.createElement('div', { className: 'bg-gray-50 rounded-xl p-4 mb-4' },
            React.createElement('div', { className: 'flex flex-wrap items-center gap-3' },
                React.createElement('div', { className: 'flex items-center gap-2 text-gray-500 text-sm font-medium' },
                    React.createElement('i', { className: 'fas fa-filter' }),
                    React.createElement('span', null, 'Filtros:')
                ),
                React.createElement('select', { 
                    className: 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
                    value: matrixFilters.viewMode,
                    onChange: (e) => setMatrixFilters({...matrixFilters, viewMode: e.target.value})
                },
                    React.createElement('option', { value: 'municipio' }, 'Por Município'),
                    React.createElement('option', { value: 'regiao' }, 'Por Região'),
                    React.createElement('option', { value: 'unidade' }, 'Por Unidade'),
                    React.createElement('option', { value: 'equipe' }, 'Por Equipe')
                ),
                regiaoOptions.length > 0 && React.createElement('select', { 
                    className: 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
                    value: matrixFilters.regiao,
                    onChange: (e) => setMatrixFilters({...matrixFilters, regiao: e.target.value, municipio: 'Todos', unidade: 'Todas', equipe: 'Todas'})
                },
                    React.createElement('option', { value: 'Todas' }, 'Todas Regiões'),
                    regiaoOptions.map(r => React.createElement('option', { key: r, value: r }, r))
                ),
                municipioOptions.length > 0 && React.createElement('select', { 
                    className: 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
                    value: matrixFilters.municipio,
                    onChange: (e) => setMatrixFilters({...matrixFilters, municipio: e.target.value, unidade: 'Todas', equipe: 'Todas'})
                },
                    React.createElement('option', { value: 'Todos' }, 'Todos Municípios'),
                    municipioOptions.map(m => React.createElement('option', { key: m, value: m }, m))
                ),
                unidadeOptions.length > 0 && unidadeOptions.length <= 100 && React.createElement('select', { 
                    className: 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
                    value: matrixFilters.unidade,
                    onChange: (e) => setMatrixFilters({...matrixFilters, unidade: e.target.value, equipe: 'Todas'})
                },
                    React.createElement('option', { value: 'Todas' }, 'Todas Unidades'),
                    unidadeOptions.map(u => React.createElement('option', { key: u, value: u }, u.length > 30 ? u.slice(0,30)+'...' : u))
                ),
                equipeOptions.length > 0 && equipeOptions.length <= 50 && React.createElement('select', { 
                    className: 'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm',
                    value: matrixFilters.equipe,
                    onChange: (e) => setMatrixFilters({...matrixFilters, equipe: e.target.value})
                },
                    React.createElement('option', { value: 'Todas' }, 'Todas Equipes'),
                    equipeOptions.map(eq => React.createElement('option', { key: eq, value: eq }, eq.length > 25 ? eq.slice(0,25)+'...' : eq))
                ),
                hasFilters && React.createElement('button', {
                    className: 'px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors',
                    onClick: () => setMatrixFilters({ viewMode: 'municipio', regiao: 'Todas', municipio: 'Todos', unidade: 'Todas', equipe: 'Todas' })
                },
                    React.createElement('i', { className: 'fas fa-times mr-1' }),
                    'Limpar'
                )
            )
        ),
        // Contador
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('p', { className: 'text-sm text-gray-600' }, 
                React.createElement('i', { className: 'fas fa-list-ol mr-2 text-blue-500' }),
                React.createElement('strong', null, matrixData.length),
                ' ' + viewModeLabels[matrixFilters.viewMode].toLowerCase() + ' encontrados'
            ),
            React.createElement('p', { className: 'text-xs text-gray-400' }, 'Role para ver todos')
        ),
        // Tabela
        matrixData.length > 0 ? React.createElement('div', { className: 'heatmap-scroll-container' },
            React.createElement('table', { className: 'corp-heatmap' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', { style: { minWidth: '160px', textAlign: 'left', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 } }, viewModeLabels[matrixFilters.viewMode].slice(0,-1)),
                        React.createElement('th', { style: { minWidth: '80px' } }, 'Taxa'),
                        indicators.map(i => React.createElement('th', { key: i, style: { minWidth: '60px' }, title: shortNames[i-1] || '' }, 'C' + i))
                    )
                ),
                React.createElement('tbody', null,
                    matrixData.map((r, i) => React.createElement('tr', { key: i },
                        React.createElement('td', { style: { position: 'sticky', left: 0, background: 'white', zIndex: 1 } },
                            React.createElement('div', { className: 'corp-heatmap-mun', title: r.municipio }, r.municipio)
                        ),
                        React.createElement('td', null,
                            React.createElement('div', { className: 'corp-heatmap-cell', style: { backgroundColor: getTaxaColor(r.taxa) } }, r.taxa.toFixed(2))
                        ),
                        r.comps.slice(0, indicatorCount).map((v, j) => React.createElement('td', { key: j },
                            React.createElement('div', { className: 'corp-heatmap-cell', style: { backgroundColor: getColor(v) }, title: (shortNames[j] || 'C'+(j+1)) + ': ' + v.toFixed(1) + '%' }, v.toFixed(0) + '%')
                        ))
                    ))
                )
            )
        ) : React.createElement('div', { className: 'text-center py-8 text-gray-500' },
            React.createElement('i', { className: 'fas fa-search text-3xl mb-2 text-gray-300' }),
            React.createElement('p', null, 'Nenhum dado encontrado com os filtros selecionados')
        ),
        // Legenda
        React.createElement('div', { className: 'flex justify-center mt-4 gap-6 text-xs flex-wrap' },
            [['#ef4444','Regular (0-24%)'],['#fbbf24','Suficiente (25-49%)'],['#84cc16','Bom (50-74%)'],['#1e3a5f','Ótimo (75-100%)']].map(function(arr) {
                return React.createElement('span', { key: arr[1], className: 'flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full' },
                    React.createElement('span', { className: 'w-3 h-3 rounded-full', style: { backgroundColor: arr[0] } }),
                    arr[1]
                );
            })
        )
    );
};

const Heatmap = ({ data, indicatorCount = 11, shortNames = [] }) => {
    if (!data?.length) return null;
    const indicators = Array.from({length: indicatorCount}, (_, i) => i + 1);
    
    return React.createElement('div', null,
        // Contador de municípios
        React.createElement('div', { className: 'flex items-center justify-between mb-3' },
            React.createElement('p', { className: 'text-sm text-gray-600' }, 
                React.createElement('i', { className: 'fas fa-list-ol mr-2 text-blue-500' }),
                React.createElement('strong', null, data.length),
                ' municípios encontrados'
            ),
            React.createElement('p', { className: 'text-xs text-gray-400' }, 
                'Role para ver todos'
            )
        ),
        // Container com scroll
        React.createElement('div', { className: 'heatmap-scroll-container' },
            React.createElement('table', { className: 'corp-heatmap' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', { style: { minWidth: '160px', textAlign: 'left', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 } }, 'Município'),
                        React.createElement('th', { style: { minWidth: '80px' } }, 'Taxa'),
                        indicators.map(i => React.createElement('th', { key: i, style: { minWidth: '60px' }, title: shortNames[i-1] || '' }, 'C' + i))
                    )
                ),
                React.createElement('tbody', null,
                    data.map((r, i) => React.createElement('tr', { key: i },
                        React.createElement('td', { style: { position: 'sticky', left: 0, background: 'white', zIndex: 1 } },
                            React.createElement('div', { className: 'corp-heatmap-mun', title: r.municipio }, r.municipio)
                        ),
                        React.createElement('td', null,
                            React.createElement('div', { className: 'corp-heatmap-cell', style: { backgroundColor: getTaxaColor(r.taxa) } }, r.taxa.toFixed(2))
                        ),
                        r.comps.slice(0, indicatorCount).map((v, j) => React.createElement('td', { key: j },
                            React.createElement('div', { className: 'corp-heatmap-cell', style: { backgroundColor: getColor(v) }, title: (shortNames[j] || 'C'+(j+1)) + ': ' + v.toFixed(1) + '%' }, v.toFixed(0) + '%')
                        ))
                    ))
                )
            )
        ),
        // Legenda
        React.createElement('div', { className: 'flex justify-center mt-4 gap-6 text-xs flex-wrap' },
            [['#ef4444','Regular (0-24%)'],['#fbbf24','Suficiente (25-49%)'],['#84cc16','Bom (50-74%)'],['#1e3a5f','Ótimo (75-100%)']].map(function(arr) {
                return React.createElement('span', { key: arr[1], className: 'flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full' },
                    React.createElement('span', { className: 'w-3 h-3 rounded-full', style: { backgroundColor: arr[0] } }),
                    arr[1]
                );
            })
        )
    );
};

const Avatar = ({ name, size = 'md', className = '' }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';
    const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
    const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
    return React.createElement('div', { className: sizes[size] + ' ' + color + ' rounded-full flex items-center justify-center text-white font-bold ' + className }, initials);
};
