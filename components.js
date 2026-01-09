// Configuração de estados
const STATE_CONFIG = {
    acre: { name: 'Acre', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-12-mun.json' },
    rn: { name: 'Rio Grande do Norte', geojson: 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-24-mun.json' }
};

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
            rn: { file: './RN_GESTANTES.csv', delimiter: ';', encoding: 'windows-1252' }
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
    'janeiro': 'Janeiro', 'fevereiro': 'Fevereiro', 'março': 'Março', 'marco': 'Março',
    'abril': 'Abril', 'maio': 'Maio', 'junho': 'Junho', 'julho': 'Julho',
    'agosto': 'Agosto', 'setembro': 'Setembro', 'outubro': 'Outubro',
    'novembro': 'Novembro', 'dezembro': 'Dezembro'
};

const normalizeMonth = (m) => {
    if (!m) return m;
    const trimmed = m.trim();
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
    if (taxa >= 75) return { label: 'Ótimo', color: '#22c55e', bg: 'bg-green-500' };
    if (taxa >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (taxa >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getCategoriaTaxa = (taxa) => {
    // Para taxa de boas práticas (valores como 19.40)
    if (taxa >= 75) return { label: 'Ótimo', color: '#22c55e', bg: 'bg-green-500' };
    if (taxa >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (taxa >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    if (taxa >= 0) return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getCategoriaComponente = (pct) => {
    // Para componentes (percentuais de 0-100)
    if (pct >= 75) return { label: 'Ótimo', color: '#22c55e', bg: 'bg-green-500' };
    if (pct >= 50) return { label: 'Bom', color: '#84cc16', bg: 'bg-lime-500' };
    if (pct >= 25) return { label: 'Suficiente', color: '#fbbf24', bg: 'bg-amber-500' };
    return { label: 'Regular', color: '#ef4444', bg: 'bg-red-500' };
};

const getStatusClass = v => v >= 75 ? 'status-otimo' : v >= 50 ? 'status-bom' : v >= 25 ? 'status-suficiente' : 'status-regular';
const getStatusText = v => v >= 75 ? 'Ótimo' : v >= 50 ? 'Bom' : v >= 25 ? 'Suficiente' : 'Regular';
const getColor = v => v >= 75 ? '#22c55e' : v >= 50 ? '#84cc16' : v >= 25 ? '#fbbf24' : '#ef4444';
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

const Heatmap = ({ data, indicatorCount = 11 }) => {
    if (!data?.length) return null;
    const indicators = Array.from({length: indicatorCount}, (_, i) => i + 1);
    return React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('div', { className: 'min-w-max' },
            React.createElement('div', { className: 'flex mb-2' },
                React.createElement('div', { style: { minWidth: '140px' } }),
                React.createElement('div', { className: 'heatmap-cell font-bold text-xs', style: { minWidth: '75px' } }, 'Boas Práticas'),
                indicators.map(i => React.createElement('div', { key: i, className: 'heatmap-cell font-bold text-xs', style: { minWidth: '65px' } }, 'C' + i))
            ),
            data.map((r, i) => React.createElement('div', { key: i, className: 'flex mb-1' },
                React.createElement('div', { className: 'heatmap-row-label', style: { minWidth: '140px' } }, r.municipio),
                React.createElement('div', { className: 'heatmap-cell rounded text-white', style: { backgroundColor: getTaxaColor(r.taxa), minWidth: '75px' } }, r.taxa.toFixed(2)),
                r.comps.slice(0, indicatorCount).map((v, j) => React.createElement('div', { key: j, className: 'heatmap-cell rounded text-white', style: { backgroundColor: getColor(v), minWidth: '65px' } }, v.toFixed(0) + '%'))
            ))
        ),
        React.createElement('div', { className: 'flex justify-end mt-4 gap-4 text-xs' },
            [['#ef4444','Regular (0-24%)'],['#fbbf24','Suficiente (25-49%)'],['#84cc16','Bom (50-74%)'],['#22c55e','Ótimo (75-100%)']].map(function(arr) {
                return React.createElement('span', { key: arr[1], className: 'flex items-center gap-1' },
                    React.createElement('span', { className: 'w-4 h-4 rounded', style: { backgroundColor: arr[0] } }),
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
