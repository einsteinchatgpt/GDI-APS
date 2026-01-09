const { useState, useEffect, useRef } = React;

const fixMunicipioDisplay = (name) => {
    if (!name) return name;
    const fixes = { 'Acrelandia': 'Acrelândia', 'Brasileia': 'Brasiléia', 'Epitaciolandia': 'Epitaciolândia', 'Feijo': 'Feijó', 'Jordao': 'Jordão', 'Mancio Lima': 'Mâncio Lima', 'Placido de Castro': 'Plácido de Castro', 'Tarauaca': 'Tarauacá', 'AcrelÃ¢ndia': 'Acrelândia', 'BrasilÃ©ia': 'Brasiléia', 'Santa Rosa': 'Santa Rosa do Purus' };
    return fixes[name] || name;
};
const normalizeMunicipioForGeoJSON = (name) => name ? name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

const LandingPage = ({ onSelectIndicator }) => {
    const indicators = [
        { key: 'gestantes', title: 'Gestantes e Puérperas', icon: 'fa-baby', color: 'from-pink-500 to-rose-600', desc: 'Pré-natal e puerpério', states: ['acre', 'rn'] },
        { key: 'has', title: 'Hipertensão Arterial', icon: 'fa-heart-pulse', color: 'from-red-500 to-red-700', desc: 'Pacientes hipertensos', states: ['rn'] },
        { key: 'dm', title: 'Diabetes Mellitus', icon: 'fa-droplet', color: 'from-blue-500 to-indigo-600', desc: 'Pacientes diabéticos', states: ['rn'] }
    ];
    const [sel, setSel] = useState(null);
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #3b82f6 100%)' }}>
            {sel && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setSel(null)}><div className="bg-white rounded-2xl p-8 max-w-md" onClick={e => e.stopPropagation()}><h3 className="text-xl font-bold mb-4 text-center">Selecione o Estado</h3><div className="space-y-3">{sel.states.map(s => <button key={s} onClick={() => onSelectIndicator(sel.key, s)} className="w-full p-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">{STATE_CONFIG[s].name}</button>)}</div></div></div>}
            <h1 className="text-5xl font-bold text-white mb-4">GDI-APS</h1>
            <p className="text-xl text-blue-200 mb-12">Gestão de Desempenho de Indicadores</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                {indicators.map(ind => <button key={ind.key} onClick={() => ind.states.length === 1 ? onSelectIndicator(ind.key, ind.states[0]) : setSel(ind)} className="bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"><div className={'w-20 h-20 rounded-2xl bg-gradient-to-br ' + ind.color + ' flex items-center justify-center mx-auto mb-6'}><i className={'fas ' + ind.icon + ' text-white text-3xl'}></i></div><h3 className="text-xl font-bold text-white mb-2">{ind.title}</h3><p className="text-blue-200 text-sm">{ind.desc}</p></button>)}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [indicatorType, setIndicatorType] = useState(null), [selectedState, setSelectedState] = useState(null);
    const [rawData, setRawData] = useState([]), [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false), [error, setError] = useState(null), [activeView, setActiveView] = useState('home');
    const [filters, setFilters] = useState({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas' });
    const [geoJson, setGeoJson] = useState(null), [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('gdiaps_user')) || null);
    const [topics, setTopics] = useState(() => JSON.parse(localStorage.getItem('gdiaps_topics')) || DEFAULT_TOPICS);
    const config = indicatorType ? INDICATOR_CONFIG[indicatorType] : null;
    const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#c026d3', '#ea580c'];

    useEffect(() => { localStorage.setItem('gdiaps_topics', JSON.stringify(topics)); }, [topics]);
    useEffect(() => { user ? localStorage.setItem('gdiaps_user', JSON.stringify(user)) : localStorage.removeItem('gdiaps_user'); }, [user]);
    useEffect(() => { if (selectedState) fetch(STATE_CONFIG[selectedState].geojson).then(r => r.json()).then(setGeoJson).catch(console.error); }, [selectedState]);
    useEffect(() => { if (indicatorType && selectedState) loadData(indicatorType, selectedState); }, [indicatorType, selectedState]);

    const loadData = (type, state) => {
        const cfg = INDICATOR_CONFIG[type]; if (!cfg?.csvFiles[state]) return;
        setLoading(true);
        const encoding = cfg.csvFiles[state].encoding || 'windows-1252';
        fetch(cfg.csvFiles[state].file).then(r => r.arrayBuffer()).then(buf => Papa.parse(new TextDecoder(encoding).decode(buf), { header: false, skipEmptyLines: true, delimiter: cfg.csvFiles[state].delimiter })).then(results => {
            const parseNum = v => { if (!v) return 0; let c = String(v).replace(/"/g, '').trim(); if (c.includes(',')) c = c.replace(/\./g, '').replace(',', '.'); return Math.round(parseFloat(c)) || 0; };
            const data = results.data.slice(1).filter(r => r[0]?.trim()).map(r => {
                let regiao = r[7] || ''; if (regiao === 'Baxo Acre') regiao = 'Baixo Acre';
                const base = { cnes: r[0], estabelecimento: r[1], municipio: fixMunicipioDisplay(r[6]), regiao, competencia: normalizeMonth(r[8]), ine: r[3] };
                if (type === 'gestantes') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), ind5: parseNum(r[14]), ind6: parseNum(r[15]), ind7: parseNum(r[16]), ind8: parseNum(r[17]), ind9: parseNum(r[18]), ind10: parseNum(r[19]), ind11: parseNum(r[20]), somatorio: parseNum(r[21]), totalPacientes: parseNum(r[22]) };
                if (type === 'has') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), somatorio: parseNum(r[14]), totalPacientes: parseNum(r[15]) };
                if (type === 'dm') return { ...base, ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]), ind4: parseNum(r[13]), ind5: parseNum(r[14]), ind6: parseNum(r[15]), somatorio: parseNum(r[16]), totalPacientes: parseNum(r[17]) };
                return base;
            });
            setRawData(data); setFilteredData(data); setFilters({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas' }); setLoading(false);
        }).catch(e => { setError(e.message); setLoading(false); });
    };

    const handleSelectIndicator = (type, state) => { setIndicatorType(type); setSelectedState(state); setActiveView('home'); };
    const handleBackToLanding = () => { setIndicatorType(null); setSelectedState(null); setRawData([]); setFilteredData([]); };

    useEffect(() => {
        if (!rawData.length) return;
        let f = [...rawData];
        if (filters.regiao !== 'Todas') f = f.filter(r => r.regiao === filters.regiao);
        if (filters.municipio !== 'Todos') f = f.filter(r => r.municipio === filters.municipio);
        if (filters.competencia !== 'Todas') f = f.filter(r => r.competencia === filters.competencia);
        // Filtro de categoria removido do mapa
        setFilteredData(f);
    }, [filters, rawData]);

    const getUnique = (field, data = rawData) => { let vals = [...new Set(data.map(r => r[field]).filter(Boolean))]; return field === 'competencia' ? vals.sort((a,b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)) : vals.sort(); };
    const getRegioes = () => getUnique('regiao');
    const calcMetrics = (data = filteredData) => { if (!data.length) return { somatorio: 0, totalPacientes: 0, taxa: 0, equipes: 0, municipios: 0 }; const s = data.reduce((a,r) => a + r.somatorio, 0), t = data.reduce((a,r) => a + (r.totalPacientes||0), 0); return { somatorio: s, totalPacientes: t, taxa: t ? s/t : 0, equipes: new Set(data.map(r => r.ine)).size, municipios: new Set(data.map(r => r.municipio)).size }; };
    const calcIndicators = (data = filteredData) => { if (!data.length || !config) return []; const total = data.reduce((s,r) => s + (r.totalPacientes||0), 0); return Array.from({length: config.indicatorCount}, (_,i) => { const sum = data.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0); return { index: i+1, name: config.shortNames[i], fullName: config.fullNames[i], total: sum, pct: total ? (sum/total)*100 : 0 }; }); };
    const getHeatmap = (data = filteredData, indFilter = 'taxa') => { if (!config) return []; return [...new Set(data.map(r => r.municipio))].filter(Boolean).map(m => { const d = data.filter(r => r.municipio === m), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), sm = d.reduce((s,r) => s + r.somatorio, 0); let valor = 0; if (indFilter === 'taxa') { valor = tg ? sm/tg : 0; } else { const idx = parseInt(indFilter.replace('ind','')); const t = d.reduce((s,r) => s + (r['ind'+idx]||0), 0); valor = tg ? (t/tg)*100 : 0; } return { municipio: m, taxa: valor, tg, sm, comps: Array.from({length: config.indicatorCount}, (_,i) => { const t = d.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0); return tg ? (t/tg)*100 : 0; }) }; }).sort((a,b) => b.taxa - a.taxa); };
    const getTrend = (data = rawData) => { const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const sm = d.reduce((s,r) => s + r.somatorio, 0), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0); return { month: m, taxa: tg ? sm/tg : 0 }; }).filter(Boolean); };
    const getEstabelecimentos = (data = filteredData) => [...new Set(data.map(r => r.estabelecimento))].filter(Boolean).map(e => { const d = data.filter(r => r.estabelecimento === e), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), sm = d.reduce((s,r) => s + r.somatorio, 0); return { estabelecimento: e, municipio: d[0]?.municipio, taxa: tg ? sm/tg : 0, tg }; }).sort((a,b) => b.taxa - a.taxa);
    const getComponentTrend = (idx, regiao = null) => { let data = regiao ? rawData.filter(r => r.regiao === regiao) : rawData; const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), val = d.reduce((s,r) => s + (r['ind'+idx]||0), 0); return { month: m, pct: tg ? (val/tg)*100 : 0 }; }).filter(Boolean); };

    const ProfileDropdown = () => (<div className="absolute top-4 right-4 z-50"><button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-lg"><div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0) || 'U'}</div><div className="text-left"><p className="font-semibold text-sm">{user?.name || 'Usuário'}</p><p className="text-xs text-gray-500">{user?.cargo || 'Cargo'}</p></div></button>{showProfile && <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border p-2"><button onClick={() => { setActiveView('profile'); setShowProfile(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Editar Perfil</button><button onClick={() => { setUser(null); setShowProfile(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg">Sair</button></div>}</div>);
    const Sidebar = () => (<div className="sidebar"><div className="pt-6 pb-4"><div className={'w-12 h-12 mx-auto rounded-xl flex items-center justify-center ' + (config?.bgColor || 'bg-blue-600')}><i className={'fas ' + (config?.icon || 'fa-heartbeat') + ' text-white text-xl'}></i></div></div><div className="mt-2"><div className="sidebar-icon hover:bg-red-100" onClick={handleBackToLanding}><i className="fas fa-arrow-left text-lg text-red-500"></i></div></div><div className="mt-2">{[['home','fa-home'],['indicators','fa-chart-pie'],['components','fa-layer-group'],['strategic','fa-brain'],['map','fa-map-marked-alt'],['forum','fa-comments']].map(([v,i]) => <div key={v} className={'sidebar-icon ' + (activeView===v?'active':'')} onClick={() => setActiveView(v)}><i className={'fas ' + i + ' text-lg'}></i></div>)}</div></div>);
    const FilterBar = ({ showInd, indFilter, setIndFilter }) => (<div className="card p-4 mb-6"><div className="flex flex-wrap items-center gap-4"><select className="filter-select" value={filters.regiao} onChange={e => setFilters({...filters, regiao: e.target.value, municipio: 'Todos'})}><option value="Todas">Todas Regiões</option>{getUnique('regiao').map(r => <option key={r}>{r}</option>)}</select><select className="filter-select" value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value})}><option value="Todos">Todos Municípios</option>{getUnique('municipio', filters.regiao !== 'Todas' ? rawData.filter(r => r.regiao === filters.regiao) : rawData).map(m => <option key={m}>{m}</option>)}</select><select className="filter-select" value={filters.competencia} onChange={e => setFilters({...filters, competencia: e.target.value})}><option value="Todas">Todas Competências</option>{getUnique('competencia').map(c => <option key={c}>{c}</option>)}</select>{showInd && <select className="filter-select" value={indFilter} onChange={e => setIndFilter(e.target.value)}><option value="taxa">Taxa Boas Práticas</option>{config && Array.from({length: config.indicatorCount}, (_,i) => <option key={i} value={'ind'+(i+1)}>C{i+1}</option>)}</select>}</div></div>);

    const HomeView = () => {
        const m = calcMetrics(), ind = calcIndicators(), trend = getTrend(filters.regiao !== 'Todas' ? rawData.filter(r => r.regiao === filters.regiao) : rawData), hm = getHeatmap(), estabs = getEstabelecimentos();
        const variation = trend.length >= 2 ? { diff: trend[trend.length-1].taxa - trend[0].taxa } : null;
        const cat = getCategoria(m.taxa);
        return (<div className="animate-fadeIn"><h1 className="text-3xl font-bold text-gray-900 mb-1">Painel de Indicadores</h1><p className="text-gray-500 mb-6">{config?.title} - {STATE_CONFIG[selectedState]?.name}</p><FilterBar /><div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6"><div className="card p-4"><p className="text-sm text-gray-500">Taxa Boas Práticas</p><p className="text-2xl font-bold">{m.taxa.toFixed(2)}</p><span className="text-xs px-2 py-1 rounded-full text-white" style={{backgroundColor: cat.color}}>{cat.label}</span></div><div className="card p-4"><p className="text-sm text-gray-500">Somatório</p><p className="text-2xl font-bold">{m.somatorio.toLocaleString()}</p></div><div className="card p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{m.totalPacientes.toLocaleString()}</p></div><div className="card p-4"><p className="text-sm text-gray-500">Equipes</p><p className="text-2xl font-bold">{m.equipes}</p></div><div className="card p-4"><p className="text-sm text-gray-500">Municípios</p><p className="text-2xl font-bold">{m.municipios}</p></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4">Evolução Mensal</h3><div style={{height:'280px'}}><LineChart data={trend} /></div></div><div className="card p-6"><h3 className="font-bold mb-4">Componentes</h3><div className="space-y-2 max-h-72 overflow-y-auto">{ind.map(i => { const c = getCategoria(i.pct); return <div key={i.index} className="flex items-center gap-2"><span className="w-8 h-8 rounded text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>C{i.index}</span><div className="flex-1"><div className="flex justify-between text-sm"><span className="truncate" style={{maxWidth:'150px'}}>{i.name}</span><span className="font-bold">{i.pct.toFixed(1)}%</span></div><div className="indicator-bar"><div className="indicator-fill" style={{width: Math.min(i.pct,100)+'%', backgroundColor: c.color}}></div></div></div></div>; })}</div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4 text-blue-600"><i className="fas fa-chart-area mr-2"></i>Tendência</h3>{variation ? <div className="p-3 bg-blue-50 rounded-xl flex justify-between"><span>Variação</span><span className={'font-bold ' + (variation.diff > 0 ? 'text-green-600' : 'text-red-600')}>{variation.diff > 0 ? '+' : ''}{variation.diff.toFixed(2)}</span></div> : <p className="text-gray-400">Dados insuficientes</p>}</div><div className="card p-6"><h3 className="font-bold mb-4 text-orange-600"><i className="fas fa-exclamation-triangle mr-2"></i>Indicadores Críticos</h3><div className="space-y-2">{[...ind].sort((a,b) => a.pct - b.pct).slice(0,3).map(i => { const c = getCategoria(i.pct); return <div key={i.index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg"><span className="w-8 h-8 rounded text-white text-xs font-bold flex items-center justify-center" style={{backgroundColor: c.color}}>C{i.index}</span><div><p className="text-sm font-medium truncate">{i.name}</p><p className="text-xs font-bold" style={{color: c.color}}>{i.pct.toFixed(1)}% - {c.label}</p></div></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4 text-green-600"><i className="fas fa-trophy mr-2"></i>Top Unidades</h3><div className="space-y-2">{estabs.slice(0,5).map((e,i) => <div key={i} className="flex justify-between p-2 bg-green-50 rounded-lg"><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{e.estabelecimento}</p><p className="text-xs text-gray-500">{e.municipio}</p></div><span className="text-sm font-bold text-green-600">{e.taxa.toFixed(2)}</span></div>)}</div></div></div><div className="card p-6"><h3 className="font-bold mb-4">Heatmap</h3><Heatmap data={hm} indicatorCount={config?.indicatorCount || 11} /></div></div>);
    };

    const IndicatorsView = () => {
        const [indFilter, setIndFilter] = useState('taxa');
        const ind = calcIndicators(), hm = getHeatmap(), estabs = getEstabelecimentos();
        const regioes = getRegioes().map(r => { const d = filteredData.filter(x => x.regiao === r), s = d.reduce((a,x) => a + x.somatorio, 0), t = d.reduce((a,x) => a + (x.totalPacientes||0), 0); return { regiao: r, taxa: t ? s/t : 0, equipes: new Set(d.map(x => x.ine)).size, municipios: new Set(d.map(x => x.municipio)).size }; }).sort((a,b) => b.taxa - a.taxa);
        const RegionChart = () => { const ref = useRef(null), chart = useRef(null); useEffect(() => { if (!ref.current) return; chart.current?.destroy(); chart.current = new Chart(ref.current, { type: 'bar', data: { labels: regioes.map(r => r.regiao), datasets: [{ data: regioes.map(r => r.taxa), backgroundColor: regioes.map(r => getTaxaColor(r.taxa)), borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }); return () => chart.current?.destroy(); }, [regioes]); return <canvas ref={ref}></canvas>; };
        return (<div className="animate-fadeIn"><h1 className="text-3xl font-bold mb-6">Análise Comparativa</h1><FilterBar showInd indFilter={indFilter} setIndFilter={setIndFilter} /><div className="card p-6 mb-6"><h3 className="font-bold mb-4"><i className="fas fa-balance-scale mr-2 text-blue-500"></i>Comparação entre Regiões</h3><div style={{height:'300px'}}><RegionChart /></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="card p-6"><h3 className="font-bold mb-4">Ranking Municípios</h3><div className="space-y-2 max-h-96 overflow-y-auto">{hm.slice(0,15).map((m,i) => { const c = getCategoriaTaxa(m.taxa); return <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"><span className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>{i+1}</span><div className="flex-1"><p className="font-medium">{m.municipio}</p><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div><span className="font-bold" style={{color: c.color}}>{m.taxa.toFixed(2)}</span></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4">Ranking Unidades</h3><div className="space-y-2 max-h-96 overflow-y-auto">{estabs.slice(0,15).map((e,i) => { const c = getCategoriaTaxa(e.taxa); return <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"><span className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>{i+1}</span><div className="flex-1 min-w-0"><p className="font-medium truncate">{e.estabelecimento}</p><p className="text-xs text-gray-500">{e.municipio}</p></div><span className="font-bold" style={{color: c.color}}>{e.taxa.toFixed(2)}</span></div>; })}</div></div></div></div>);
    };

    const ComponentsView = () => {
        const [selComp, setSelComp] = useState(1), [selRegioes, setSelRegioes] = useState([]);
        const ind = calcIndicators(), regioes = getRegioes(), selInd = ind.find(i => i.index === selComp);
        const toggleReg = r => selRegioes.includes(r) ? setSelRegioes(selRegioes.filter(x => x !== r)) : selRegioes.length < 5 && setSelRegioes([...selRegioes, r]);
        const compTrend = getComponentTrend(selComp);
        const lastPct = compTrend.length > 0 ? compTrend[compTrend.length - 1].pct : 0;
        const lastMonth = compTrend.length > 0 ? compTrend[compTrend.length - 1].month : '';
        const lastCat = getCategoria(lastPct);
        const MultiChart = () => { const ref = useRef(null), chart = useRef(null); useEffect(() => { if (!ref.current) return; chart.current?.destroy(); const months = getUnique('competencia'); const orderedMonths = MONTH_ORDER.filter(m => months.includes(m)); const datasets = selRegioes.length ? selRegioes.map((r,i) => { const t = getComponentTrend(selComp, r); return { label: r, data: orderedMonths.map(m => t.find(x => x.month === m)?.pct ?? null), borderColor: COLORS[i%COLORS.length], backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, spanGaps: true }; }) : [{ label: 'Geral', data: orderedMonths.map(m => compTrend.find(x => x.month === m)?.pct ?? null), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, borderWidth: 3, tension: 0.4, spanGaps: true }]; chart.current = new Chart(ref.current, { type: 'line', data: { labels: orderedMonths.map(m => m.slice(0,3)), datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v+'%' } } } } }); return () => chart.current?.destroy(); }, [selComp, selRegioes, compTrend]); return <canvas ref={ref}></canvas>; };
        const pred = () => { const t = compTrend; if (t.length < 3) return null; const n = t.length, xM = (n-1)/2, yM = t.reduce((s,x) => s+x.pct, 0)/n; let num=0, den=0; t.forEach((p,i) => { num += (i-xM)*(p.pct-yM); den += (i-xM)*(i-xM); }); const slope = den ? num/den : 0, int = yM - slope*xM; return { next: Math.min(100, Math.max(0, int + slope*n)), trend: slope > 0.5 ? 'crescente' : slope < -0.5 ? 'decrescente' : 'estável', slope: slope.toFixed(2) }; };
        const prediction = pred();
        return (<div className="animate-fadeIn"><h1 className="text-3xl font-bold mb-6">Análise por Componente</h1><FilterBar /><div className="card p-6 mb-6"><h3 className="font-bold mb-4">Selecione o Componente</h3><div className="flex flex-wrap gap-2">{ind.map(i => <button key={i.index} onClick={() => setSelComp(i.index)} className={'px-4 py-2 rounded-lg font-semibold ' + (selComp === i.index ? 'bg-blue-600 text-white' : 'bg-gray-100')}>{i.name}</button>)}</div></div><div className="card p-6 mb-6"><h3 className="font-bold mb-4">Filtrar por Regiões (máx 5)</h3><div className="flex flex-wrap gap-2">{regioes.map((r,i) => <button key={r} onClick={() => toggleReg(r)} className={'px-3 py-1 rounded-full text-sm font-medium border-2 ' + (selRegioes.includes(r) ? 'text-white border-transparent' : 'bg-white border-gray-300')} style={selRegioes.includes(r) ? {backgroundColor: COLORS[selRegioes.indexOf(r)%COLORS.length]} : {}}>{r}</button>)}{selRegioes.length > 0 && <button onClick={() => setSelRegioes([])} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">Limpar</button>}</div></div>{selInd && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 card p-6"><h3 className="font-bold mb-2">Evolução - {selInd.name}</h3><p className="text-sm text-gray-500 mb-4">{selInd.fullName}</p><div style={{height:'350px'}}><MultiChart /></div></div><div className="space-y-4"><div className="card p-6"><h3 className="font-bold mb-4">Detalhes</h3><div className="p-3 bg-blue-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Valor Atual ({lastMonth})</p><p className="text-2xl font-bold" style={{color: lastCat.color}}>{lastPct.toFixed(1)}%</p><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: lastCat.color}}>{lastCat.label}</span></div><div className="p-3 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">Total Realizados</p><p className="text-xl font-bold">{selInd.total.toLocaleString()}</p></div></div>{prediction && <div className="card p-6"><h3 className="font-bold mb-4 text-purple-600"><i className="fas fa-chart-line mr-2"></i>Predição</h3><div className="p-3 bg-purple-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Próximo Mês</p><p className="text-xl font-bold text-purple-600">{prediction.next.toFixed(1)}%</p></div><p className="text-sm mb-2">Tendência: <span className="font-bold">{prediction.trend}</span></p><p className="text-xs text-gray-500">Método: Regressão linear ({compTrend.length} meses). Coef: {prediction.slope}%/mês</p></div>}</div></div>}</div>);
    };

    const StrategicView = () => {
        const m = calcMetrics(), ind = calcIndicators(), trend = getTrend(filteredData), hm = getHeatmap();
        const worstMun = [...hm].sort((a,b) => a.taxa - b.taxa).slice(0,5), bestMun = hm.slice(0,5);
        const pred = () => { if (trend.length < 3) return null; const n = trend.length, xM = (n-1)/2, yM = trend.reduce((s,t) => s+t.taxa, 0)/n; let num=0, den=0; trend.forEach((p,i) => { num += (i-xM)*(p.taxa-yM); den += (i-xM)*(i-xM); }); const slope = den ? num/den : 0, int = yM - slope*xM; return [1,2,3].map(i => ({ label: 'Mês +'+i, val: Math.max(0, int + slope*(n+i-1)) })); };
        const prediction = pred(); const cat = getCategoria(m.taxa);
        return (<div className="animate-fadeIn"><h1 className="text-3xl font-bold mb-2">Análise Estratégica</h1><p className="text-gray-500 mb-6">Visão para Diretores e Gerentes de Saúde</p><FilterBar /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4 text-blue-600"><i className="fas fa-bullseye mr-2"></i>Resumo Executivo</h3><div className="p-4 bg-blue-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Taxa Atual</p><p className="text-3xl font-bold" style={{color: cat.color}}>{m.taxa.toFixed(2)}</p><span className="text-sm px-3 py-1 rounded-full text-white" style={{backgroundColor: cat.color}}>{cat.label}</span></div><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Municípios</p><p className="text-lg font-bold">{m.municipios}</p></div><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Equipes</p><p className="text-lg font-bold">{m.equipes}</p></div></div></div><div className="card p-6"><h3 className="font-bold mb-4 text-purple-600"><i className="fas fa-chart-line mr-2"></i>Projeção</h3>{prediction ? <div className="space-y-3">{prediction.map((p,i) => { const c = getCategoriaTaxa(p.val); return <div key={i} className="flex justify-between items-center p-3 bg-purple-50 rounded-xl"><span>{p.label}</span><div><span className="text-xl font-bold" style={{color: c.color}}>{p.val.toFixed(2)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div> : <p className="text-gray-400">Dados insuficientes</p>}</div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4 text-red-600"><i className="fas fa-exclamation-circle mr-2"></i>Municípios Críticos</h3><div className="space-y-2">{worstMun.map((m,i) => { const c = getCategoriaTaxa(m.taxa); return <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl"><span className="font-medium">{m.municipio}</span><div><span className="font-bold" style={{color: c.color}}>{m.taxa.toFixed(2)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4 text-green-600"><i className="fas fa-star mr-2"></i>Municípios Referência</h3><div className="space-y-2">{bestMun.map((m,i) => { const c = getCategoriaTaxa(m.taxa); return <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-xl"><span className="font-medium">{m.municipio}</span><div><span className="font-bold" style={{color: c.color}}>{m.taxa.toFixed(2)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div></div></div><div className="card p-6"><h3 className="font-bold mb-4"><i className="fas fa-tasks mr-2 text-orange-500"></i>Recomendações</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...ind].sort((a,b) => a.pct - b.pct).slice(0,4).map(i => { const c = getCategoria(i.pct); return <div key={i.index} className="p-4 border rounded-xl"><div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 rounded text-white text-xs font-bold flex items-center justify-center" style={{backgroundColor: c.color}}>C{i.index}</span><span className="font-bold">{i.name}</span></div><p className="text-sm">Atual: <span className="font-bold" style={{color: c.color}}>{i.pct.toFixed(1)}% - {c.label}</span></p></div>; })}</div></div></div>);
    };

    const MiniMap = ({ monthData, indFilter }) => {
    const mapRef = useRef(null), mapInstance = useRef(null);
    const hm = getHeatmap(monthData, indFilter);
    
    useEffect(() => {
        if (!mapRef.current || !geoJson) return;
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
        const map = L.map(mapRef.current, { 
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
            dragging: false,
            doubleClickZoom: false
        }).setView(selectedState === 'acre' ? [-9.5, -70.5] : [-5.8, -36.5], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.geoJSON(geoJson, {
            style: f => {
                const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name));
                return { 
                    fillColor: d ? getTaxaColor(d.taxa) : '#ccc', 
                    weight: 0.5, 
                    color: 'white', 
                    fillOpacity: 0.8 
                };
            }
        }).addTo(map);
        mapInstance.current = map;
        return () => { 
            if (mapInstance.current) { 
                mapInstance.current.remove(); 
                mapInstance.current = null; 
            } 
        };
    
    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">Análise Espacial</h1>
            <FilterBar showInd indFilter={indFilter} setIndFilter={setIndFilter} />
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card p-4 text-center" style={{borderLeft: '4px solid #22c55e'}}>
                    <p className="text-sm text-gray-500">Ótimo</p>
                    <p className="text-2xl font-bold text-green-600">{clusters.otimo}</p>
                </div>
                <div className="card p-4 text-center" style={{borderLeft: '4px solid #84cc16'}}>
                    <p className="text-sm text-gray-500">Bom</p>
                    <p className="text-2xl font-bold text-lime-600">{clusters.bom}</p>
                </div>
                <div className="card p-4 text-center" style={{borderLeft: '4px solid #fbbf24'}}>
                    <p className="text-sm text-gray-500">Suficiente</p>
                    <p className="text-2xl font-bold text-amber-600">{clusters.suficiente}</p>
                </div>
                <div className="card p-4 text-center" style={{borderLeft: '4px solid #ef4444'}}>
                    <p className="text-sm text-gray-500">Regular</p>
                    <p className="text-2xl font-bold text-red-600">{clusters.regular}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6">
                    <h3 className="font-bold mb-4">Mapa de Desempenho</h3>
                    <div ref={mapRef} style={{height:'450px',borderRadius:'16px'}}></div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#ef4444'}}></span>Regular</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#fbbf24'}}></span>Suficiente</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#84cc16'}}></span>Bom</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#22c55e'}}></span>Ótimo</span>
                    </div>
                    {indFilter !== 'taxa' && config && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Componente selecionado:</p>
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">C{parseInt(indFilter.replace('ind',''))}:</span> {config.fullNames[parseInt(indFilter.replace('ind',''))-1]}
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="card p-6">
                        <h3 className="font-bold mb-4"><i className="fas fa-layer-group mr-2 text-blue-500"></i>Clusters por Região</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {regiaoStats.map(r => {
                                const cat = (indFilter === 'taxa' ? getCategoriaTaxa(r.taxa) : getCategoriaComponente(r.taxa));
                                return (
                                    <div key={r.regiao} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{r.regiao}</p>
                                            <p className="text-xs text-gray-500">{r.municipios} mun.</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold" style={{color: cat.color}}>{r.taxa.toFixed(2)}</p>
                                            <span className="text-xs px-2 py-1 rounded-full text-white" style={{backgroundColor: cat.color}}>{cat.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-bold mb-4"><i className="fas fa-trophy mr-2 text-yellow-500"></i>Ranking Municípios</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {hm.slice(0,10).map((m,i) => {
                                const c = (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa));
                                return (
                                    <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>{i+1}</span>
                                        <div className="flex-1">
                                            <p className="font-medium">{m.municipio}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold" style={{color: c.color}}>{m.taxa.toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card p-6 mt-6">
                <h3 className="font-bold mb-4"><i className="fas fa-th mr-2 text-blue-500"></i>Mosaico de Mapas Mensais</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getUnique('competencia').slice(0, 12).map(month => { 
                        const monthData = rawData.filter(r => r.competencia === month); 
                        return (
                            <div key={month} className="text-center">
                                <div className="text-xs font-semibold text-gray-600 mb-1">{month}</div>
                                <div className="relative bg-gray-100 rounded-lg p-1" style={{height:'120px'}}>
                                    <MiniMap monthData={monthData} indFilter={indFilter} />
                                </div>
                            </div>
                        ); 
                    })}
                </div>
            </div>
        </div>
    );
};

    const handleLogin = (userData) => { setUser(userData); setActiveView('home'); };

    if (!indicatorType) return <LandingPage onSelectIndicator={handleSelectIndicator} />;
    if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (activeView === 'profile' && !user) return <LoginView onLogin={handleLogin} onBack={() => setActiveView('home')} />;

    return (<div className="min-h-screen"><Sidebar /><ProfileDropdown /><div className="main-content">{activeView === 'home' && <HomeView />}{activeView === 'indicators' && <IndicatorsView />}{activeView === 'components' && <ComponentsView />}{activeView === 'strategic' && <StrategicView />}{activeView === 'map' && <MapView />}{activeView === 'forum' && <ForumView user={user} topics={topics} setTopics={setTopics} onLoginRequired={() => setActiveView('profile')} />}{activeView === 'profile' && user && <ProfileView user={user} setUser={setUser} onLogout={() => setUser(null)} topics={topics} />}</div></div>);

ReactDOM.render(<Dashboard />, document.getElementById('root'));
