const { useState, useEffect, useRef, useMemo } = React;

// ==================== CONFIGURAÇÕES ====================
const STATE_CONFIG = {
    acre: { name: 'Acre', geojson: 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/acre.geojson', center: [-9, -70], zoom: 6 },
    rn: { name: 'Rio Grande do Norte', geojson: 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/rio-grande-do-norte.geojson', center: [-5.8, -36.5], zoom: 7 }
};

const INDICATOR_CONFIG = {
    gestantes: {
        title: 'Gestantes e Puérperas', icon: 'fa-baby', color: '#ec4899', bgColor: 'bg-pink-500', indicatorCount: 11,
        shortNames: ['Captação', 'Sífilis', 'HIV', 'Atend 6+', 'Odonto', 'Exames', 'DT/dTpa', 'Pré-natal', 'Parto', 'Puerpério', 'RN'],
        fullNames: ['Captação precoce', 'Teste de sífilis', 'Teste de HIV', '6+ atendimentos', 'Atendimento odontológico', 'Exames laboratoriais', 'Vacina DT/dTpa', 'Pré-natal completo', 'Registro de parto', 'Consulta puerpério', 'Consulta RN'],
        csvFiles: { acre: { file: 'Gestantes_utf8.csv', delimiter: ';', encoding: 'utf-8' }, rn: { file: 'RN_GESTANTES.csv', delimiter: ';', encoding: 'utf-8' } }
    },
    has: {
        title: 'Hipertensão Arterial', icon: 'fa-heart-pulse', color: '#ef4444', bgColor: 'bg-red-500', indicatorCount: 4,
        shortNames: ['PA Aferida', 'Consulta', 'Creatinina', 'Risco CV'],
        fullNames: ['PA aferida no semestre', 'Consulta médica', 'Creatinina sérica', 'Risco cardiovascular'],
        csvFiles: { rn: { file: 'RN_HAS.csv', delimiter: ';', encoding: 'utf-8' } }
    },
    dm: {
        title: 'Diabetes Mellitus', icon: 'fa-droplet', color: '#3b82f6', bgColor: 'bg-blue-500', indicatorCount: 6,
        shortNames: ['Glicemia', 'HbA1c', 'Consulta', 'Creatinina', 'Pé Diabético', 'Fundo Olho'],
        fullNames: ['Glicemia de jejum', 'Hemoglobina glicada', 'Consulta médica', 'Creatinina sérica', 'Exame do pé diabético', 'Exame de fundo de olho'],
        csvFiles: { rn: { file: 'RN_DM.csv', delimiter: ';', encoding: 'utf-8' } }
    }
};

const MONTH_ORDER = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const normalizeMonth = m => { if (!m) return m; const map = { 'Marco': 'Março', 'MarÃ§o': 'Março' }; return map[m] || m; };
const fixMunicipioDisplay = (name) => { if (!name) return name; const fixes = { 'Acrelandia': 'Acrelândia', 'Brasileia': 'Brasiléia', 'Epitaciolandia': 'Epitaciolândia', 'Feijo': 'Feijó', 'Jordao': 'Jordão', 'Mancio Lima': 'Mâncio Lima', 'Placido de Castro': 'Plácido de Castro', 'Tarauaca': 'Tarauacá', 'Santa Rosa': 'Santa Rosa do Purus' }; return fixes[name] || name; };
const normalizeMunicipioForGeoJSON = (name) => name ? name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

const getCategoriaTaxa = (taxa) => { if (taxa >= 0.75) return { label: 'Ótimo', color: '#059669' }; if (taxa >= 0.50) return { label: 'Bom', color: '#84cc16' }; if (taxa >= 0.25) return { label: 'Suficiente', color: '#f59e0b' }; return { label: 'Regular', color: '#dc2626' }; };
const getCategoriaComponente = (pct) => { if (pct >= 75) return { label: 'Ótimo', color: '#059669' }; if (pct >= 50) return { label: 'Bom', color: '#84cc16' }; if (pct >= 25) return { label: 'Suficiente', color: '#f59e0b' }; return { label: 'Regular', color: '#dc2626' }; };
const getCategoria = (val) => val > 1 ? getCategoriaComponente(val) : getCategoriaTaxa(val);
const getTaxaColor = (taxa) => getCategoriaTaxa(taxa).color;
const COLORS = ['#003366', '#00a86b', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

// ==================== COMPONENTES GRÁFICOS ====================
const LineChart = ({ data, label = 'Taxa', color = '#003366' }) => {
    const ref = useRef(null), chart = useRef(null);
    useEffect(() => {
        if (!ref.current || !data?.length) return;
        chart.current?.destroy();
        chart.current = new Chart(ref.current, {
            type: 'line',
            data: { labels: data.map(d => d.month?.slice(0, 3) || d.label), datasets: [{ label, data: data.map(d => d.taxa ?? d.value), borderColor: color, backgroundColor: `${color}20`, fill: true, borderWidth: 3, tension: 0.4, pointRadius: 4, pointBackgroundColor: color }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
        });
        return () => chart.current?.destroy();
    }, [data, label, color]);
    return <canvas ref={ref}></canvas>;
};

const BarChart = ({ data, horizontal = false }) => {
    const ref = useRef(null), chart = useRef(null);
    useEffect(() => {
        if (!ref.current || !data?.length) return;
        chart.current?.destroy();
        chart.current = new Chart(ref.current, {
            type: 'bar',
            data: { labels: data.map(d => d.label), datasets: [{ data: data.map(d => d.value), backgroundColor: data.map(d => getTaxaColor(d.value > 1 ? d.value/100 : d.value)), borderRadius: 6 }] },
            options: { indexAxis: horizontal ? 'y' : 'x', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
        });
        return () => chart.current?.destroy();
    }, [data, horizontal]);
    return <canvas ref={ref}></canvas>;
};

const DoughnutChart = ({ data, centerText }) => {
    const ref = useRef(null), chart = useRef(null);
    useEffect(() => {
        if (!ref.current || !data?.length) return;
        chart.current?.destroy();
        chart.current = new Chart(ref.current, { type: 'doughnut', data: { labels: data.map(d => d.label), datasets: [{ data: data.map(d => d.value), backgroundColor: data.map(d => d.color), borderWidth: 0, cutout: '70%' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } } });
        return () => chart.current?.destroy();
    }, [data]);
    return (<div className="relative"><canvas ref={ref}></canvas>{centerText && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-center"><p className="text-3xl font-bold text-gray-800">{centerText.value}</p><p className="text-sm text-gray-500">{centerText.label}</p></div></div>}</div>);
};

// ==================== HEATMAP ====================
const CorporateHeatmap = ({ data, indicatorCount, shortNames }) => {
    if (!data?.length) return <p className="text-gray-400 text-center py-8">Sem dados</p>;
    const getCellColor = (val) => { if (val >= 75) return '#059669'; if (val >= 50) return '#84cc16'; if (val >= 25) return '#f59e0b'; return '#dc2626'; };
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead><tr><th className="text-left p-3 text-xs font-bold text-gray-600 uppercase">Município</th><th className="text-center p-3 text-xs font-bold text-gray-600 uppercase">Taxa</th>{shortNames?.slice(0, indicatorCount).map((_, i) => <th key={i} className="text-center p-2 text-xs font-bold text-gray-600">C{i + 1}</th>)}</tr></thead>
                <tbody>{data.slice(0, 12).map((row, idx) => (<tr key={idx} className="hover:bg-gray-50"><td className="p-3 font-medium text-gray-700">{row.municipio}</td><td className="p-2 text-center"><span className="inline-flex items-center justify-center w-16 h-8 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: getTaxaColor(row.taxa) }}>{row.taxa.toFixed(2)}</span></td>{row.comps?.slice(0, indicatorCount).map((val, i) => <td key={i} className="p-1 text-center"><div className="heatmap-cell mx-auto" style={{ backgroundColor: getCellColor(val), color: 'white' }}>{val.toFixed(0)}%</div></td>)}</tr>))}</tbody>
            </table>
        </div>
    );
};

// ==================== LANDING PAGE ====================
const CorporateLanding = ({ onSelectIndicator, user, onOpenAuth }) => {
    const indicators = [
        { key: 'gestantes', title: 'Gestantes e Puérperas', icon: 'fa-baby', color: '#ec4899', desc: 'Acompanhamento pré-natal e puerpério', states: ['acre', 'rn'], stats: '11 componentes' },
        { key: 'has', title: 'Hipertensão Arterial', icon: 'fa-heart-pulse', color: '#ef4444', desc: 'Monitoramento de hipertensos', states: ['rn'], stats: '4 componentes' },
        { key: 'dm', title: 'Diabetes Mellitus', icon: 'fa-droplet', color: '#3b82f6', desc: 'Controle de diabéticos', states: ['rn'], stats: '6 componentes' }
    ];
    const [sel, setSel] = useState(null);
    
    return (
        <div className="landing-bg"><div className="landing-pattern"></div>
            <header className="relative z-10 px-8 py-6"><div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center"><i className="fas fa-heartbeat text-white text-xl"></i></div><div><h1 className="text-xl font-bold text-white">GDI-APS Brasil</h1><p className="text-xs text-white/60 uppercase tracking-wider">Gestão de Desempenho</p></div></div>
                <button onClick={onOpenAuth} className="flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-3 rounded-xl hover:bg-white/20 transition-all"><div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><i className="fas fa-user text-white"></i></div><div className="text-left"><p className="text-sm font-semibold text-white">{user?.name || 'Acessar'}</p><p className="text-xs text-white/60">{user?.cargo || 'Entre ou cadastre-se'}</p></div></button>
            </div></header>
            
            <section className="relative z-10 px-8 py-16"><div className="max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-8"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span><span className="text-sm text-white/80">Plataforma Nacional de Indicadores da APS</span></div>
                <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">Transformando dados em<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">decisões estratégicas</span></h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">Monitore, analise e otimize os indicadores de saúde da Atenção Primária com visualizações avançadas.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">{[{ icon: 'fa-chart-line', title: 'Análise Real-Time', desc: 'Dados atualizados' }, { icon: 'fa-map-marked-alt', title: 'Mapas Interativos', desc: 'Visualização espacial' }, { icon: 'fa-brain', title: 'Insights IA', desc: 'Análises preditivas' }, { icon: 'fa-file-export', title: 'Relatórios', desc: 'Exportação executiva' }].map((f, i) => <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 text-left animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}><div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3"><i className={`fas ${f.icon} text-white`}></i></div><h4 className="text-white font-semibold mb-1">{f.title}</h4><p className="text-white/50 text-sm">{f.desc}</p></div>)}</div>
            </div></section>
            
            <section className="relative z-10 px-8 pb-20"><div className="max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-white text-center mb-8">Selecione o Indicador</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{indicators.map((ind, idx) => <div key={ind.key} onClick={() => setSel(ind)} className="landing-card cursor-pointer group animate-fadeInUp" style={{ animationDelay: `${idx * 0.15}s` }}><div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: ind.color }}><i className={`fas ${ind.icon} text-white text-3xl`}></i></div><h4 className="text-xl font-bold text-white text-center mb-2">{ind.title}</h4><p className="text-white/60 text-center mb-4">{ind.desc}</p><div className="flex items-center justify-center gap-2 text-white/40 text-sm"><i className="fas fa-layer-group"></i><span>{ind.stats}</span></div><div className="mt-6 pt-4 border-t border-white/10 text-center"><span className="text-white/60 text-sm group-hover:text-white transition-colors flex items-center justify-center gap-2">Acessar <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i></span></div></div>)}</div>
            </div></section>
            
            {sel && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSel(null)}><div className="bg-white rounded-2xl p-8 max-w-md w-full animate-fadeInUp" onClick={e => e.stopPropagation()}><div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: sel.color }}><i className={`fas ${sel.icon} text-white text-2xl`}></i></div><h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{sel.title}</h3><p className="text-gray-500 text-center mb-6">Selecione o estado</p><div className="space-y-3">{sel.states.map(s => <button key={s} onClick={() => onSelectIndicator(sel.key, s)} className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-between group"><span className="flex items-center gap-3"><i className="fas fa-map-marker-alt"></i>{STATE_CONFIG[s].name}</span><i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i></button>)}</div></div></div>}
            
            <footer className="relative z-10 px-8 py-8 border-t border-white/10"><div className="max-w-7xl mx-auto text-center"><p className="text-white/40 text-sm">© 2025 GDI-APS Brasil</p></div></footer>
        </div>
    );
};

// ==================== AUTH MODAL ====================
const AuthModal = ({ isOpen, onClose, mode, setMode, onLogin }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', cargo: '' });
    const [loading, setLoading] = useState(false);
    if (!isOpen) return null;
    const handleSubmit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { onLogin({ name: mode === 'login' ? formData.email.split('@')[0] : formData.name, email: formData.email, cargo: formData.cargo || 'Profissional de Saúde' }); setLoading(false); onClose(); }, 1000); };
    return (
        <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #003366 0%, #004d99 100%)' }}><div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4"><i className={`fas ${mode === 'login' ? 'fa-user-shield' : 'fa-user-plus'} text-white text-2xl`}></i></div><h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Bem-vindo!' : 'Cadastre-se'}</h2></div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                {mode === 'register' && <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label><input type="text" className="filter-select w-full" placeholder="Seu nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>}
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">E-mail</label><input type="email" className="filter-select w-full" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label><input type="password" className="filter-select w-full" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                {mode === 'register' && <div><label className="block text-sm font-semibold text-gray-700 mb-2">Cargo</label><select className="filter-select w-full" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})}><option value="">Selecione</option><option>Enfermeiro(a)</option><option>Médico(a)</option><option>Gestor(a) de Saúde</option><option>Coordenador(a) APS</option></select></div>}
                <button type="submit" disabled={loading} className="w-full btn btn-primary py-4">{loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Processando...</> : mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
                <div className="text-center pt-4 border-t"><p className="text-gray-600">{mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}<button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="ml-2 text-blue-600 font-semibold hover:underline">{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</button></p></div>
            </form>
        </div></div>
    );
};

// ==================== DASHBOARD PRINCIPAL ====================
const CorporateDashboard = () => {
    const [indicatorType, setIndicatorType] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('overview');
    const [filters, setFilters] = useState({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas' });
    const [geoJson, setGeoJson] = useState(null);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('gdiaps_user')) || null);
    const [authModal, setAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const config = indicatorType ? INDICATOR_CONFIG[indicatorType] : null;

    useEffect(() => { user ? localStorage.setItem('gdiaps_user', JSON.stringify(user)) : localStorage.removeItem('gdiaps_user'); }, [user]);
    useEffect(() => { if (selectedState) fetch(STATE_CONFIG[selectedState].geojson).then(r => r.json()).then(setGeoJson).catch(console.error); }, [selectedState]);
    useEffect(() => { if (indicatorType && selectedState) loadData(indicatorType, selectedState); }, [indicatorType, selectedState]);

    const loadData = (type, state) => {
        const cfg = INDICATOR_CONFIG[type]; if (!cfg?.csvFiles[state]) return;
        setLoading(true);
        fetch(cfg.csvFiles[state].file).then(r => r.arrayBuffer()).then(buf => Papa.parse(new TextDecoder(cfg.csvFiles[state].encoding || 'utf-8').decode(buf), { header: false, skipEmptyLines: true, delimiter: cfg.csvFiles[state].delimiter })).then(results => {
            const parseNum = v => { if (!v) return 0; let c = String(v).replace(/"/g, '').trim(); if (state === 'acre') c = c.replace(/,/g, ''); else { if (c.includes('.') && c.includes(',')) c = c.replace(/\./g, '').replace(',', '.'); else if (c.includes(',')) c = c.replace(',', '.'); } return Math.round(parseFloat(c)) || 0; };
            const data = results.data.slice(1).filter(r => r[0]?.trim()).map(r => {
                let regiao = r[7] || ''; if (regiao === 'Baxo Acre') regiao = 'Baixo Acre';
                const base = { cnes: r[0], estabelecimento: r[1], municipio: fixMunicipioDisplay(r[6]), regiao, competencia: normalizeMonth(r[8]), ine: r[3] };
                if (type === 'gestantes') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), ind5: parseNum(r[14]), ind6: parseNum(r[15]), ind7: parseNum(r[16]), ind8: parseNum(r[17]), ind9: parseNum(r[18]), ind10: parseNum(r[19]), ind11: parseNum(r[20]), somatorio: parseNum(r[21]), totalPacientes: parseNum(r[22]) };
                if (type === 'has') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), somatorio: parseNum(r[14]), totalPacientes: parseNum(r[15]) };
                if (type === 'dm') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), ind5: parseNum(r[14]), ind6: parseNum(r[15]), somatorio: parseNum(r[16]), totalPacientes: parseNum(r[17]) };
                return base;
            });
            setRawData(data); setFilteredData(data); setFilters({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas' }); setLoading(false);
        }).catch(e => { console.error(e); setLoading(false); });
    };

    useEffect(() => { if (!rawData.length) return; let f = [...rawData]; if (filters.regiao !== 'Todas') f = f.filter(r => r.regiao === filters.regiao); if (filters.municipio !== 'Todos') f = f.filter(r => r.municipio === filters.municipio); if (filters.competencia !== 'Todas') f = f.filter(r => r.competencia === filters.competencia); setFilteredData(f); }, [filters, rawData]);

    const getUnique = (field, data = rawData) => { let vals = [...new Set(data.map(r => r[field]).filter(Boolean))]; return field === 'competencia' ? vals.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)) : vals.sort(); };
    const calcMetrics = (data = filteredData) => { if (!data.length) return { somatorio: 0, totalPacientes: 0, taxa: 0, equipes: 0, municipios: 0 }; const s = data.reduce((a, r) => a + r.somatorio, 0), t = data.reduce((a, r) => a + (r.totalPacientes || 0), 0); return { somatorio: s, totalPacientes: t, taxa: t ? s / t : 0, equipes: new Set(data.map(r => r.ine)).size, municipios: new Set(data.map(r => r.municipio)).size }; };
    const calcIndicators = (data = filteredData) => { if (!data.length || !config) return []; const total = data.reduce((s, r) => s + (r.totalPacientes || 0), 0); return Array.from({ length: config.indicatorCount }, (_, i) => { const sum = data.reduce((s, r) => s + (r['ind' + (i + 1)] || 0), 0); return { index: i + 1, name: config.shortNames[i], fullName: config.fullNames[i], total: sum, pct: total ? (sum / total) * 100 : 0 }; }); };
    const getHeatmap = (data = filteredData) => { if (!config) return []; return [...new Set(data.map(r => r.municipio))].filter(Boolean).map(m => { const d = data.filter(r => r.municipio === m), tg = d.reduce((s, r) => s + (r.totalPacientes || 0), 0), sm = d.reduce((s, r) => s + r.somatorio, 0); return { municipio: m, taxa: tg ? sm / tg : 0, tg, sm, comps: Array.from({ length: config.indicatorCount }, (_, i) => { const t = d.reduce((s, r) => s + (r['ind' + (i + 1)] || 0), 0); return tg ? (t / tg) * 100 : 0; }) }; }).sort((a, b) => b.taxa - a.taxa); };
    const getTrend = (data = rawData) => { const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const sm = d.reduce((s, r) => s + r.somatorio, 0), tg = d.reduce((s, r) => s + (r.totalPacientes || 0), 0); return { month: m, taxa: tg ? sm / tg : 0 }; }).filter(Boolean); };
    const getComponentTrend = (idx, regiao = null) => { let data = regiao ? rawData.filter(r => r.regiao === regiao) : rawData; const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const tg = d.reduce((s, r) => s + (r.totalPacientes || 0), 0), val = d.reduce((s, r) => s + (r['ind' + idx] || 0), 0); return { month: m, pct: tg ? (val / tg) * 100 : 0 }; }).filter(Boolean); };
    const getRegioes = () => getUnique('regiao');

    const handleSelectIndicator = (type, state) => { setIndicatorType(type); setSelectedState(state); setActiveView('overview'); };
    const handleBackToLanding = () => { setIndicatorType(null); setSelectedState(null); setRawData([]); setFilteredData([]); };

    if (!indicatorType) return (<><CorporateLanding onSelectIndicator={handleSelectIndicator} user={user} onOpenAuth={() => { setAuthMode('login'); setAuthModal(true); }} /><AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} mode={authMode} setMode={setAuthMode} onLogin={setUser} /></>);

    const metrics = calcMetrics(), indicators = calcIndicators(), trend = getTrend(filters.regiao !== 'Todas' ? rawData.filter(r => r.regiao === filters.regiao) : rawData), heatmap = getHeatmap();
    const variation = trend.length >= 2 ? trend[trend.length - 1].taxa - trend[0].taxa : 0;
    const cat = getCategoria(metrics.taxa);
    const navItems = [{ key: 'overview', label: 'Visão Geral', icon: 'fa-home' }, { key: 'analysis', label: 'Análise', icon: 'fa-chart-pie' }, { key: 'components', label: 'Componentes', icon: 'fa-layer-group' }, { key: 'strategic', label: 'Estratégico', icon: 'fa-brain' }, { key: 'map', label: 'Mapa', icon: 'fa-map-marked-alt' }, { key: 'reports', label: 'Relatórios', icon: 'fa-file-alt' }];

    // FILTER BAR
    const FilterBar = () => (<div className="corp-card mb-6"><div className="corp-card-body py-4"><div className="filter-group"><select className="filter-select" value={filters.regiao} onChange={e => setFilters({...filters, regiao: e.target.value, municipio: 'Todos'})}><option value="Todas">Todas Regiões</option>{getUnique('regiao').map(r => <option key={r}>{r}</option>)}</select><select className="filter-select" value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value})}><option value="Todos">Todos Municípios</option>{getUnique('municipio', filters.regiao !== 'Todas' ? rawData.filter(r => r.regiao === filters.regiao) : rawData).map(m => <option key={m}>{m}</option>)}</select><select className="filter-select" value={filters.competencia} onChange={e => setFilters({...filters, competencia: e.target.value})}><option value="Todas">Todas Competências</option>{getUnique('competencia').map(c => <option key={c}>{c}</option>)}</select></div></div></div>);

    // OVERVIEW VIEW
    const OverviewView = () => (<div className="animate-fadeIn">
        <div className="exec-summary mb-8"><div className="relative z-10"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-white mb-1">Resumo Executivo</h2><p className="text-white/60">{config?.title} - {STATE_CONFIG[selectedState]?.name}</p></div><div className="text-right"><p className="text-white/60 text-sm">Última atualização</p><p className="text-white font-semibold">{trend[trend.length - 1]?.month || 'N/A'}</p></div></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[{ label: 'Taxa Boas Práticas', value: metrics.taxa.toFixed(2), badge: cat }, { label: 'Somatório', value: metrics.somatorio.toLocaleString() }, { label: 'Pacientes', value: metrics.totalPacientes.toLocaleString() }, { label: 'Equipes', value: metrics.equipes }, { label: 'Variação', value: (variation >= 0 ? '+' : '') + variation.toFixed(2), isVar: true }].map((m, i) => <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4"><p className="text-white/60 text-xs uppercase mb-1">{m.label}</p><p className={`text-3xl font-bold ${m.isVar ? (variation >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>{m.value}</p>{m.badge && <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: m.badge.color }}>{m.badge.label}</span>}</div>)}</div></div></div>
        <FilterBar />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-chart-line"></i>Evolução Mensal</h3></div><div className="corp-card-body"><div className="chart-container"><LineChart data={trend} /></div></div></div><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-layer-group"></i>Desempenho por Componente</h3></div><div className="corp-card-body"><div className="chart-container"><BarChart data={indicators.map(i => ({ label: i.name, value: i.pct }))} /></div></div></div></div>
        <div className="corp-card mb-6"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-tasks"></i>Progresso dos Componentes</h3></div><div className="corp-card-body"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{indicators.map(ind => { const c = getCategoriaComponente(ind.pct); return <div key={ind.index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><div className="flex items-center justify-between mb-2"><span className="font-semibold text-gray-700">C{ind.index} - {ind.name}</span><span className="font-bold" style={{ color: c.color }}>{ind.pct.toFixed(1)}%</span></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(ind.pct, 100)}%`, backgroundColor: c.color }}></div></div><p className="text-xs text-gray-500 mt-2">{ind.total.toLocaleString()} realizados</p></div>; })}</div></div></div>
        <div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-th"></i>Matriz de Desempenho</h3></div><div className="corp-card-body"><CorporateHeatmap data={heatmap} indicatorCount={config?.indicatorCount} shortNames={config?.shortNames} /></div></div>
    </div>);

    // ANALYSIS VIEW
    const AnalysisView = () => {
        const regioes = getRegioes().map(r => { const d = filteredData.filter(x => x.regiao === r), t = d.reduce((a, x) => a + (x.totalPacientes || 0), 0), s = d.reduce((a, x) => a + x.somatorio, 0); return { regiao: r, taxa: t ? s / t : 0, equipes: new Set(d.map(x => x.ine)).size }; }).sort((a, b) => b.taxa - a.taxa);
        const topMun = heatmap.slice(0, 10), bottomMun = [...heatmap].sort((a, b) => a.taxa - b.taxa).slice(0, 10);
        return (<div className="animate-fadeIn"><h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Comparativa</h2><FilterBar />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-balance-scale"></i>Comparação entre Regiões</h3></div><div className="corp-card-body"><div className="chart-container"><BarChart data={regioes.map(r => ({ label: r.regiao, value: r.taxa }))} /></div></div></div>
            <div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-chart-pie"></i>Distribuição por Categoria</h3></div><div className="corp-card-body"><div className="chart-container"><DoughnutChart data={[{ label: 'Ótimo', value: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Ótimo').length, color: '#059669' }, { label: 'Bom', value: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Bom').length, color: '#84cc16' }, { label: 'Suficiente', value: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Suficiente').length, color: '#f59e0b' }, { label: 'Regular', value: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Regular').length, color: '#dc2626' }]} centerText={{ value: heatmap.length, label: 'municípios' }} /></div></div></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[{ title: 'Top 10 Municípios', icon: 'fa-trophy', data: topMun }, { title: 'Atenção Necessária', icon: 'fa-exclamation-triangle', data: bottomMun }].map((sec, si) => <div key={si} className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className={`fas ${sec.icon}`}></i>{sec.title}</h3></div><div className="corp-card-body"><div className="space-y-2">{sec.data.map((m, i) => { const c = getCategoriaTaxa(m.taxa); return <div key={i} className="ranking-item"><div className={`ranking-position ${i === 0 && si === 0 ? 'gold' : i === 1 && si === 0 ? 'silver' : i === 2 && si === 0 ? 'bronze' : 'default'}`}>{i + 1}</div><div className="flex-1"><p className="font-semibold text-gray-800">{m.municipio}</p><span className="status-badge" style={{ backgroundColor: `${c.color}20`, color: c.color }}>{c.label}</span></div><span className="text-xl font-bold" style={{ color: c.color }}>{m.taxa.toFixed(2)}</span></div>; })}</div></div></div>)}</div>
        </div>);
    };

    // COMPONENTS VIEW
    const ComponentsView = () => {
        const [selComp, setSelComp] = useState(1), [selRegs, setSelRegs] = useState([]);
        const compTrend = getComponentTrend(selComp), selInd = indicators.find(i => i.index === selComp);
        const toggleReg = r => selRegs.includes(r) ? setSelRegs(selRegs.filter(x => x !== r)) : selRegs.length < 5 && setSelRegs([...selRegs, r]);
        const MultiChart = () => { const ref = useRef(null), chart = useRef(null); useEffect(() => { if (!ref.current) return; chart.current?.destroy(); const months = getUnique('competencia'), orderedMonths = MONTH_ORDER.filter(m => months.includes(m)); const datasets = selRegs.length ? selRegs.map((r, i) => { const t = getComponentTrend(selComp, r); return { label: r, data: orderedMonths.map(m => t.find(x => x.month === m)?.pct ?? null), borderColor: COLORS[i % COLORS.length], backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, spanGaps: true }; }) : [{ label: 'Geral', data: orderedMonths.map(m => compTrend.find(x => x.month === m)?.pct ?? null), borderColor: '#003366', backgroundColor: 'rgba(0,51,102,0.1)', fill: true, borderWidth: 3, tension: 0.4, spanGaps: true }]; chart.current = new Chart(ref.current, { type: 'line', data: { labels: orderedMonths.map(m => m.slice(0, 3)), datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } } } }); return () => chart.current?.destroy(); }, [selComp, selRegs, compTrend]); return <canvas ref={ref}></canvas>; };
        return (<div className="animate-fadeIn"><h2 className="text-2xl font-bold text-gray-800 mb-6">Análise por Componente</h2><FilterBar />
            <div className="corp-card mb-6"><div className="corp-card-body"><h3 className="font-semibold text-gray-700 mb-4">Selecione o Componente</h3><div className="flex flex-wrap gap-2">{indicators.map(ind => <button key={ind.index} onClick={() => setSelComp(ind.index)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${selComp === ind.index ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>C{ind.index} - {ind.name}</button>)}</div></div></div>
            <div className="corp-card mb-6"><div className="corp-card-body"><h3 className="font-semibold text-gray-700 mb-4">Comparar Regiões (máx. 5)</h3><div className="flex flex-wrap gap-2">{getRegioes().map((r, i) => <button key={r} onClick={() => toggleReg(r)} className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${selRegs.includes(r) ? 'text-white border-transparent' : 'bg-white border-gray-300'}`} style={selRegs.includes(r) ? { backgroundColor: COLORS[selRegs.indexOf(r) % COLORS.length] } : {}}>{r}</button>)}{selRegs.length > 0 && <button onClick={() => setSelRegs([])} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">Limpar</button>}</div></div></div>
            {selInd && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-chart-line"></i>Evolução - {selInd.name}</h3></div><div className="corp-card-body"><p className="text-sm text-gray-500 mb-4">{selInd.fullName}</p><div style={{ height: '350px' }}><MultiChart /></div></div></div><div className="space-y-4"><div className="corp-card"><div className="corp-card-body"><h3 className="font-semibold mb-4">Detalhes do Componente</h3><div className="p-4 bg-blue-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Valor Atual</p><p className="text-3xl font-bold" style={{ color: getCategoriaComponente(selInd.pct).color }}>{selInd.pct.toFixed(1)}%</p><span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: getCategoriaComponente(selInd.pct).color }}>{getCategoriaComponente(selInd.pct).label}</span></div><div className="p-4 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">Total Realizados</p><p className="text-2xl font-bold text-gray-800">{selInd.total.toLocaleString()}</p></div></div></div></div></div>}
        </div>);
    };

    // STRATEGIC VIEW
    const StrategicView = () => {
        const worstMun = [...heatmap].sort((a, b) => a.taxa - b.taxa).slice(0, 5), bestMun = heatmap.slice(0, 5);
        const pred = () => { if (trend.length < 3) return null; const n = trend.length, xM = (n - 1) / 2, yM = trend.reduce((s, t) => s + t.taxa, 0) / n; let num = 0, den = 0; trend.forEach((p, i) => { num += (i - xM) * (p.taxa - yM); den += (i - xM) * (i - xM); }); const slope = den ? num / den : 0, int = yM - slope * xM; return [1, 2, 3].map(i => ({ label: 'Mês +' + i, val: Math.max(0, int + slope * (n + i - 1)) })); };
        const prediction = pred();
        return (<div className="animate-fadeIn"><h2 className="text-2xl font-bold text-gray-800 mb-2">Análise Estratégica</h2><p className="text-gray-500 mb-6">Visão para Gestores e Diretores de Saúde</p><FilterBar />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title text-blue-600"><i className="fas fa-bullseye"></i>Resumo Executivo</h3></div><div className="corp-card-body"><div className="p-4 bg-blue-50 rounded-xl mb-4"><p className="text-sm text-gray-500">Taxa Atual</p><p className="text-4xl font-bold" style={{ color: cat.color }}>{metrics.taxa.toFixed(2)}</p><span className="text-sm px-3 py-1 rounded-full text-white" style={{ backgroundColor: cat.color }}>{cat.label}</span></div><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Municípios</p><p className="text-xl font-bold">{metrics.municipios}</p></div><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Equipes</p><p className="text-xl font-bold">{metrics.equipes}</p></div></div></div></div>
            <div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title text-purple-600"><i className="fas fa-chart-line"></i>Projeção (Regressão Linear)</h3></div><div className="corp-card-body">{prediction ? <div className="space-y-3">{prediction.map((p, i) => { const c = getCategoriaTaxa(p.val); return <div key={i} className="flex justify-between items-center p-3 bg-purple-50 rounded-xl"><span className="font-medium">{p.label}</span><div><span className="text-xl font-bold" style={{ color: c.color }}>{p.val.toFixed(2)}</span><span className="ml-2 text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: c.color }}>{c.label}</span></div></div>; })}</div> : <p className="text-gray-400 text-center py-8">Dados insuficientes para projeção</p>}</div></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[{ title: 'Municípios Críticos', icon: 'fa-exclamation-circle', color: 'text-red-600', data: worstMun }, { title: 'Municípios Destaque', icon: 'fa-star', color: 'text-green-600', data: bestMun }].map((sec, si) => <div key={si} className="corp-card"><div className="corp-card-header"><h3 className={`corp-card-title ${sec.color}`}><i className={`fas ${sec.icon}`}></i>{sec.title}</h3></div><div className="corp-card-body"><div className="space-y-3">{sec.data.map((m, i) => { const c = getCategoriaTaxa(m.taxa); return <div key={i} className="insight-card" style={{ borderColor: c.color }}><div className="flex justify-between items-center"><div><p className="font-semibold text-gray-800">{m.municipio}</p><span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: c.color }}>{c.label}</span></div><span className="text-2xl font-bold" style={{ color: c.color }}>{m.taxa.toFixed(2)}</span></div></div>; })}</div></div></div>)}</div>
        </div>);
    };

    // MAP VIEW
    const MapView = () => {
        const mapRef = useRef(null), mapInstance = useRef(null);
        const clusters = { otimo: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Ótimo').length, bom: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Bom').length, suficiente: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Suficiente').length, regular: heatmap.filter(m => getCategoriaTaxa(m.taxa).label === 'Regular').length };
        useEffect(() => { if (!mapRef.current || !geoJson) return; if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } const map = L.map(mapRef.current).setView(STATE_CONFIG[selectedState].center, STATE_CONFIG[selectedState].zoom); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map); L.geoJSON(geoJson, { style: f => { const d = heatmap.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); return { fillColor: d ? getTaxaColor(d.taxa) : '#ccc', weight: 1, color: 'white', fillOpacity: 0.75 }; }, onEachFeature: (f, l) => { const d = heatmap.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); const c = d ? getCategoriaTaxa(d.taxa) : null; l.bindPopup(`<div style="font-family:sans-serif"><b style="font-size:14px">${f.properties.name}</b><br><span style="color:${c?.color || '#666'}">Taxa: ${d ? d.taxa.toFixed(2) : 'N/A'}</span>${c ? `<br><span style="background:${c.color};color:white;padding:2px 8px;border-radius:10px;font-size:11px">${c.label}</span>` : ''}</div>`); } }).addTo(map); mapInstance.current = map; return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } }; }, [geoJson, heatmap]);
        return (<div className="animate-fadeIn"><h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Espacial</h2><FilterBar />
            <div className="grid grid-cols-4 gap-4 mb-6">{[{ label: 'Ótimo', value: clusters.otimo, color: '#059669', icon: 'fa-trophy' }, { label: 'Bom', value: clusters.bom, color: '#84cc16', icon: 'fa-thumbs-up' }, { label: 'Suficiente', value: clusters.suficiente, color: '#f59e0b', icon: 'fa-exclamation' }, { label: 'Regular', value: clusters.regular, color: '#dc2626', icon: 'fa-times' }].map((c, i) => <div key={i} className="corp-card"><div className="corp-card-body py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: c.color }}><i className={`fas ${c.icon}`}></i></div><div><p className="text-xs text-gray-500">{c.label}</p><p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p></div></div></div></div>)}</div>
            <div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-map"></i>Mapa de Desempenho</h3></div><div className="corp-card-body p-0"><div ref={mapRef} id="map" style={{ height: '500px', borderRadius: '0 0 16px 16px' }}></div></div></div>
        </div>);
    };

    // REPORTS VIEW
    const ReportsView = () => {
        const exportCSV = () => { const rows = [['Município', 'Taxa', ...config.shortNames.map((_, i) => `C${i + 1}`)], ...heatmap.map(m => [m.municipio, m.taxa.toFixed(2), ...m.comps.map(c => c.toFixed(1))])]; const csv = rows.map(r => r.join(';')).join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `relatorio_${indicatorType}_${selectedState}.csv`; link.click(); };
        return (<div className="animate-fadeIn"><h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios e Exportação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[{ title: 'Relatório Executivo', desc: 'Resumo para apresentações', icon: 'fa-file-powerpoint', color: '#dc2626' }, { title: 'Dados Completos', desc: 'Exportar para análise', icon: 'fa-file-csv', color: '#059669', action: exportCSV }, { title: 'Análise Regional', desc: 'Comparativo por região', icon: 'fa-chart-bar', color: '#3b82f6' }].map((r, i) => <div key={i} className="corp-card hover:shadow-lg cursor-pointer" onClick={r.action}><div className="corp-card-body text-center py-8"><div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${r.color}20` }}><i className={`fas ${r.icon} text-2xl`} style={{ color: r.color }}></i></div><h3 className="font-bold text-gray-800 mb-2">{r.title}</h3><p className="text-gray-500 text-sm">{r.desc}</p></div></div>)}</div>
            <div className="corp-card mt-6"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-table"></i>Prévia dos Dados</h3></div><div className="corp-card-body"><table className="data-table"><thead><tr><th>Município</th><th>Taxa</th><th>Pacientes</th><th>Status</th></tr></thead><tbody>{heatmap.slice(0, 10).map((m, i) => { const c = getCategoriaTaxa(m.taxa); return <tr key={i}><td className="font-medium">{m.municipio}</td><td><span className="font-bold" style={{ color: c.color }}>{m.taxa.toFixed(2)}</span></td><td>{m.tg.toLocaleString()}</td><td><span className="status-badge" style={{ backgroundColor: `${c.color}20`, color: c.color }}>{c.label}</span></td></tr>; })}</tbody></table></div></div>
        </div>);
    };

    const views = { overview: <OverviewView />, analysis: <AnalysisView />, components: <ComponentsView />, strategic: <StrategicView />, map: <MapView />, reports: <ReportsView /> };

    return (<div className="min-h-screen bg-gray-50">
        <header className="corp-header"><div className="corp-header-inner">
            <div className="corp-logo"><div className="corp-logo-icon"><i className={`fas ${config?.icon || 'fa-heartbeat'} text-white text-xl`}></i></div><div className="corp-logo-text"><h1>GDI-APS Brasil</h1><p>Gestão de Desempenho de Indicadores</p></div></div>
            <nav className="corp-nav">{navItems.map(item => <button key={item.key} onClick={() => setActiveView(item.key)} className={`corp-nav-item ${activeView === item.key ? 'active' : ''}`}><i className={`fas ${item.icon}`}></i><span className="hidden md:inline">{item.label}</span></button>)}</nav>
            <div className="flex items-center gap-4"><button onClick={handleBackToLanding} className="corp-nav-item text-white/70 hover:text-white"><i className="fas fa-arrow-left mr-2"></i>Voltar</button><div className="corp-user" onClick={() => { if (!user) { setAuthMode('login'); setAuthModal(true); } }}><div className="corp-user-avatar"><i className="fas fa-user text-white"></i></div><div className="corp-user-info"><p className="corp-user-name">{user?.name || 'Visitante'}</p><p className="corp-user-role">{user?.cargo || 'Clique para entrar'}</p></div></div></div>
        </div></header>
        <div className="corp-subheader"><div className="corp-breadcrumb"><a href="#" onClick={e => { e.preventDefault(); handleBackToLanding(); }}>Início</a><i className="fas fa-chevron-right text-xs"></i><span>{config?.title}</span><i className="fas fa-chevron-right text-xs"></i><span>{STATE_CONFIG[selectedState]?.name}</span></div><div className="text-sm text-gray-500"><i className="fas fa-database mr-2"></i>{filteredData.length.toLocaleString()} registros</div></div>
        <main className="corp-main">{loading ? <div className="flex items-center justify-center py-20"><i className="fas fa-circle-notch fa-spin text-4xl text-gray-400"></i></div> : views[activeView]}</main>
        <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} mode={authMode} setMode={setAuthMode} onLogin={setUser} />
    </div>);
};

ReactDOM.createRoot(document.getElementById('root')).render(<CorporateDashboard />);
