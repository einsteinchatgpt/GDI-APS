const INDICATOR_FULL_NAMES = [
    'TER REALIZADO A PRIMEIRA CONSULTA DE PRÉ-NATAL ATÉ 12 SEMANAS DE GESTAÇÃO',
    'TER REALIZADO PELO MENOS 07 CONSULTAS DURANTE O PERÍODO DE GESTAÇÃO',
    'TER REALIZADO PELO MENOS 07 REGISTROS DE PRESSÃO ARTERIAL',
    'TER REALIZADO PELO MENOS 07 REGISTROS DE PESO E ALTURA',
    'TER REGISTRO DE PELO MENOS 03 VISITAS DOMICILIARES DO ACS/TACS',
    'TER REGISTRO DE UMA DOSE DE DTPA A PARTIR DA 20ª SEMANA',
    'TER REGISTRO DOS TESTES DO PRIMEIRO TRIMESTRE (SÍFILIS, HIV, HEPATITES)',
    'TER REGISTRO DOS TESTES DO TERCEIRO TRIMESTRE (SÍFILIS, HIV)',
    'TER REGISTRO DE CONSULTA DURANTE O PUERPÉRIO',
    'TER REGISTRO DE VISITA DOMICILIAR DURANTE O PUERPÉRIO',
    'TER REGISTRO DE AVALIAÇÃO ODONTOLÓGICA DURANTE A GESTAÇÃO'
];

const INDICATOR_SHORT = [
    'Consulta pré-natal até 12 sem', '07 consultas gestação', '07 registros PA',
    '07 registros peso/altura', '03 visitas ACS/TACS', 'Dose DTPA 20ª sem',
    'Testes 1º trim', 'Testes 3º trim', 'Consulta puerpério',
    'Visita puerpério', 'Avaliação odontológica'
];

const MONTH_ORDER = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ACRE_GEOJSON = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-12-mun.json';

const getStatusClass = v => v >= 75 ? 'status-otimo' : v >= 50 ? 'status-bom' : v >= 25 ? 'status-suficiente' : 'status-regular';
const getStatusText = v => v >= 75 ? 'Ótimo' : v >= 50 ? 'Bom' : v >= 25 ? 'Suficiente' : 'Regular';
const getColor = v => v >= 75 ? '#22c55e' : v >= 50 ? '#84cc16' : v >= 25 ? '#fbbf24' : '#ef4444';
const getTaxaColor = v => getColor(Math.min(v * 2, 100));
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

const Heatmap = ({ data }) => {
    if (!data?.length) return null;
    return React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('div', { className: 'min-w-max' },
            React.createElement('div', { className: 'flex mb-2' },
                React.createElement('div', { style: { minWidth: '140px' } }),
                React.createElement('div', { className: 'heatmap-cell font-bold text-xs', style: { minWidth: '75px' } }, 'Boas Práticas'),
                [1,2,3,4,5,6,7,8,9,10,11].map(i => React.createElement('div', { key: i, className: 'heatmap-cell font-bold text-xs', style: { minWidth: '65px' } }, `C${i}`))
            ),
            data.map((r, i) => React.createElement('div', { key: i, className: 'flex mb-1' },
                React.createElement('div', { className: 'heatmap-row-label', style: { minWidth: '140px' } }, r.municipio),
                React.createElement('div', { className: 'heatmap-cell rounded text-white', style: { backgroundColor: getTaxaColor(r.taxa), minWidth: '75px' } }, r.taxa.toFixed(2)),
                r.comps.map((v, j) => React.createElement('div', { key: j, className: 'heatmap-cell rounded text-white', style: { backgroundColor: getColor(v), minWidth: '65px' } }, `${v.toFixed(0)}%`))
            ))
        ),
        React.createElement('div', { className: 'flex justify-end mt-4 gap-4 text-xs' },
            [['#ef4444','0-24%'],['#fbbf24','25-49%'],['#84cc16','50-74%'],['#22c55e','75-100%']].map(([c,l]) =>
                React.createElement('span', { key: l, className: 'flex items-center gap-1' },
                    React.createElement('span', { className: 'w-4 h-4 rounded', style: { backgroundColor: c } }),
                    l
                )
            )
        )
    );
};

const Avatar = ({ name, size = 'md', className = '' }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?';
    const colors = ['bg-blue-500','bg-green-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
    const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
    return React.createElement('div', { className: `${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold ${className}` }, initials);
};
