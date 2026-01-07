const { useState, useEffect, useRef } = React;

const Dashboard = () => {
    const [rawData, setRawData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('home');
    const [filters, setFilters] = useState({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas' });
    const [geoJson, setGeoJson] = useState(null);
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('gdiaps_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [topics, setTopics] = useState(() => {
        const saved = localStorage.getItem('gdiaps_topics');
        return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
    });

    useEffect(() => { localStorage.setItem('gdiaps_topics', JSON.stringify(topics)); }, [topics]);
    useEffect(() => { user ? localStorage.setItem('gdiaps_user', JSON.stringify(user)) : localStorage.removeItem('gdiaps_user'); }, [user]);

    useEffect(() => {
        loadData();
        fetch(ACRE_GEOJSON).then(r => r.json()).then(setGeoJson).catch(console.error);
    }, []);

    const loadData = () => {
        setLoading(true);
        fetch('./Gestantes.csv')
            .then(r => r.arrayBuffer())
            .then(buf => {
                const text = new TextDecoder('windows-1252').decode(buf);
                return Papa.parse(text, { header: false, skipEmptyLines: true });
            })
            .then(results => {
                const rows = results.data.slice(1).filter(r => r[0]?.trim());
                const data = rows.map(r => {
                    const parseNum = v => {
                        if (!v) return 0;
                        let c = String(v).replace(/"/g, '').trim();
                        if (c.includes(',')) c = c.replace(/\./g, '').replace(',', '.');
                        return Math.round(parseFloat(c)) || 0;
                    };
                    let regiao = r[7] || '';
                    if (regiao === 'Baxo Acre') regiao = 'Baixo Acre';
                    return {
                        cnes: r[0], estabelecimento: r[1], municipio: r[6], regiao, competencia: r[8],
                        ine: r[3],
                        ind1: parseNum(r[10]), ind2: parseNum(r[11]), ind3: parseNum(r[12]),
                        ind4: parseNum(r[13]), ind5: parseNum(r[14]), ind6: parseNum(r[15]),
                        ind7: parseNum(r[16]), ind8: parseNum(r[17]), ind9: parseNum(r[18]),
                        ind10: parseNum(r[19]), ind11: parseNum(r[20]),
                        somatorio: parseNum(r[21]), totalGestantes: parseNum(r[22])
                    };
                });
                setRawData(data);
                setFilteredData(data);
                setLoading(false);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    };

    useEffect(() => {
        if (!rawData.length) return;
        let f = [...rawData];
        if (filters.regiao !== 'Todas') f = f.filter(r => r.regiao === filters.regiao);
        if (filters.municipio !== 'Todos') f = f.filter(r => r.municipio === filters.municipio);
        if (filters.competencia !== 'Todas') f = f.filter(r => r.competencia === filters.competencia);
        setFilteredData(f);
    }, [filters, rawData]);

    const getUnique = (field, data = rawData) => {
        let vals = [...new Set(data.map(r => r[field]).filter(Boolean))];
        if (field === 'competencia') {
            return vals.sort((a,b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
        }
        return vals.sort();
    };

    const getEstabelecimentos = (data = filteredData) => {
        const estabs = [...new Set(data.map(r => r.estabelecimento))].filter(Boolean);
        return estabs.map(e => {
            const d = data.filter(r => r.estabelecimento === e);
            const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
            const sm = d.reduce((s,r) => s + r.somatorio, 0);
            const mun = d[0]?.municipio || '';
            return { estabelecimento: e, municipio: mun, taxa: tg ? sm/tg : 0, tg, sm };
        }).sort((a,b) => b.taxa - a.taxa);
    };

    const calcMetrics = (data = filteredData) => {
        if (!data.length) return { somatorio: 0, totalGestantes: 0, taxa: 0, equipes: 0 };
        const somatorio = data.reduce((s, r) => s + r.somatorio, 0);
        const totalGestantes = data.reduce((s, r) => s + r.totalGestantes, 0);
        return { somatorio, totalGestantes, taxa: totalGestantes ? somatorio / totalGestantes : 0, equipes: new Set(data.map(r => r.ine)).size };
    };

    const calcIndicators = (data = filteredData) => {
        if (!data.length) return [];
        const total = data.reduce((s, r) => s + r.totalGestantes, 0);
        return Array.from({length: 11}, (_, i) => {
            const sum = data.reduce((s, r) => s + r[`ind${i+1}`], 0);
            return { index: i+1, name: INDICATOR_SHORT[i], fullName: INDICATOR_FULL_NAMES[i], total: sum, pct: total ? (sum/total)*100 : 0 };
        });
    };

    const getHeatmap = (data = filteredData) => {
        const muns = [...new Set(data.map(r => r.municipio))].sort();
        return muns.map(m => {
            const d = data.filter(r => r.municipio === m);
            const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
            const sm = d.reduce((s,r) => s + r.somatorio, 0);
            const comps = Array.from({length:11}, (_,i) => {
                const t = d.reduce((s,r) => s + r[`ind${i+1}`], 0);
                return tg ? (t/tg)*100 : 0;
            });
            return { municipio: m, taxa: tg ? sm/tg : 0, tg, sm, comps };
        }).sort((a,b) => b.taxa - a.taxa);
    };

    const getTrend = () => {
        // Filtra por região e município, mas mostra todos os meses
        let data = [...rawData];
        if (filters.regiao !== 'Todas') data = data.filter(r => r.regiao === filters.regiao);
        if (filters.municipio !== 'Todos') data = data.filter(r => r.municipio === filters.municipio);
        return MONTH_ORDER.map(m => {
            const d = data.filter(r => r.competencia === m);
            if (!d.length) return null;
            const sm = d.reduce((s,r) => s + r.somatorio, 0);
            const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
            return { month: m, taxa: tg ? sm/tg : 0, sm, tg };
        }).filter(Boolean);
    };

    const Sidebar = () => (
        <div className="sidebar">
            <div className="pt-6 pb-4">
                <div className="w-12 h-12 mx-auto bg-blue-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-heartbeat text-white text-xl"></i>
                </div>
            </div>
            <div className="mt-4">
                {[['home','fa-home','Painel'],['indicators','fa-chart-pie','Análises'],['map','fa-map-marked-alt','Mapa'],['data','fa-table','Dados'],['predictions','fa-brain','Predições'],['forum','fa-comments','Fórum'],['profile','fa-user','Perfil']].map(([v,i,t]) => (
                    <div key={v} className={`sidebar-icon ${activeView===v?'active':''}`} onClick={() => setActiveView(v)} title={t}>
                        <i className={`fas ${i} text-lg`}></i>
                    </div>
                ))}
            </div>
        </div>
    );

    const FilterBar = () => (
        <div className="card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-gray-700"><i className="fas fa-filter text-blue-500 mr-2"></i>Filtros:</span>
                <select className="filter-select" value={filters.regiao} onChange={e => setFilters({...filters, regiao: e.target.value, municipio: 'Todos'})}>
                    <option value="Todas">Todas as Regiões</option>
                    {getUnique('regiao').map(v => <option key={v}>{v}</option>)}
                </select>
                <select className="filter-select" value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value})}>
                    <option value="Todos">Todos os Municípios</option>
                    {getUnique('municipio', filters.regiao !== 'Todas' ? rawData.filter(r => r.regiao === filters.regiao) : rawData).map(v => <option key={v}>{v}</option>)}
                </select>
                <select className="filter-select" value={filters.competencia} onChange={e => setFilters({...filters, competencia: e.target.value})}>
                    <option value="Todas">Todas as Competências</option>
                    {getUnique('competencia').map(v => <option key={v}>{v}</option>)}
                </select>
                <button onClick={() => setFilters({regiao:'Todas',municipio:'Todos',competencia:'Todas'})} className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">Limpar</button>
            </div>
        </div>
    );

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
        const ref = useRef(null), chart = useRef(null);
        useEffect(() => {
            if (!ref.current || !data?.length) return;
            if (chart.current) chart.current.destroy();
            chart.current = new Chart(ref.current, {
                type: 'line',
                data: { labels: data.map(d => d.month.slice(0,3)), datasets: [{ data: data.map(d => d.taxa), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 5 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
            });
            return () => chart.current?.destroy();
        }, [data]);
        return <canvas ref={ref}></canvas>;
    };

    const EstabChart = ({ data }) => {
        const ref = useRef(null), chart = useRef(null);
        useEffect(() => {
            if (!ref.current || !data?.length) return;
            if (chart.current) chart.current.destroy();
            const labels = data.map(d => d.estabelecimento.length > 30 ? d.estabelecimento.slice(0,30) + '...' : d.estabelecimento);
            chart.current = new Chart(ref.current, {
                type: 'bar',
                data: { labels, datasets: [{ data: data.map(d => d.taxa), backgroundColor: data.map(d => getTaxaColor(d.taxa)), borderRadius: 6 }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { title: (ctx) => data[ctx[0].dataIndex].estabelecimento, afterTitle: (ctx) => data[ctx[0].dataIndex].municipio } } }, scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 10 } } } } }
            });
            return () => chart.current?.destroy();
        }, [data]);
        return <canvas ref={ref}></canvas>;
    };

    const Heatmap = ({ data }) => {
        if (!data?.length) return null;
        return (
            <div className="overflow-x-auto">
                <div className="min-w-max">
                    <div className="flex mb-2">
                        <div style={{minWidth:'140px'}}></div>
                        <div className="heatmap-cell font-bold text-xs" style={{minWidth:'75px'}}>Boas Práticas</div>
                        {[1,2,3,4,5,6,7,8,9,10,11].map(i => <div key={i} className="heatmap-cell font-bold text-xs" style={{minWidth:'65px'}}>C{i}</div>)}
                    </div>
                    {data.map((r,i) => (
                        <div key={i} className="flex mb-1">
                            <div className="heatmap-row-label" style={{minWidth:'140px'}}>{r.municipio}</div>
                            <div className="heatmap-cell rounded text-white" style={{backgroundColor: getTaxaColor(r.taxa), minWidth:'75px'}}>{r.taxa.toFixed(2)}</div>
                            {r.comps.map((v,j) => <div key={j} className="heatmap-cell rounded text-white" style={{backgroundColor: getColor(v), minWidth:'65px'}}>{v.toFixed(0)}%</div>)}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-4 gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#ef4444'}}></span>0-24%</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#fbbf24'}}></span>25-49%</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#84cc16'}}></span>50-74%</span>
                    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#22c55e'}}></span>75-100%</span>
                </div>
            </div>
        );
    };

    const HomeView = () => {
        const [selectedIndicator, setSelectedIndicator] = useState(null);
        const [selectedMetric, setSelectedMetric] = useState(null);
        const [selectedEstab, setSelectedEstab] = useState(null);
        const m = calcMetrics(), ind = calcIndicators(), trend = getTrend(), hm = getHeatmap();
        const estabs = getEstabelecimentos();

        const MetricPopup = ({ metric, onClose }) => (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">{metric.title}</h3>
                        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" onClick={onClose}>
                            <i className="fas fa-times text-gray-500"></i>
                        </button>
                    </div>
                    <div className="text-center py-6">
                        <div className={`w-20 h-20 ${metric.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                            <i className={`${metric.icon} text-white text-3xl`}></i>
                        </div>
                        <p className="text-5xl font-bold text-gray-900 mb-2">{metric.value}</p>
                        <p className="text-gray-500">{metric.sub}</p>
                    </div>
                    {metric.details && <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">{metric.details}</p>
                    </div>}
                </div>
            </div>
        );

        const IndicatorPopup = ({ indicator, onClose }) => {
            const muns = [...new Set(filteredData.map(r => r.municipio))];
            const ranking = muns.map(mun => {
                const d = filteredData.filter(r => r.municipio === mun);
                const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
                const t = d.reduce((s,r) => s + r[`ind${indicator.index}`], 0);
                return { mun, pct: tg ? (t/tg)*100 : 0, total: t, tg };
            }).sort((a,b) => b.pct - a.pct);

            return (
                <div className="modal-overlay" onClick={onClose}>
                    <div className="modal-content p-6 max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">C{indicator.index}</span>
                                <h3 className="text-xl font-bold">Componente {indicator.index}</h3>
                            </div>
                            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" onClick={onClose}>
                                <i className="fas fa-times text-gray-500"></i>
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">{indicator.fullName}</p>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                                <p className="text-3xl font-bold text-blue-600">{indicator.pct.toFixed(1)}%</p>
                                <p className="text-sm text-gray-500">Percentual</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <p className="text-3xl font-bold text-green-600">{indicator.total.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Total Realizados</p>
                            </div>
                            <div className="text-center p-4 rounded-xl" style={{backgroundColor: getColor(indicator.pct) + '20'}}>
                                <p className="text-3xl font-bold" style={{color: getColor(indicator.pct)}}>{getStatusText(indicator.pct)}</p>
                                <p className="text-sm text-gray-500">Status</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-3">Ranking por Município</h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {ranking.slice(0, 10).map((r, i) => (
                                <div key={r.mun} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200'}`}>{i+1}</span>
                                    <div className="flex-1">
                                        <p className="font-medium">{r.mun}</p>
                                        <p className="text-xs text-gray-500">{r.tg} gestantes</p>
                                    </div>
                                    <span className={`status-badge ${getStatusClass(r.pct)}`}>{r.pct.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        const EstabPopup = ({ estab, onClose }) => (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Detalhes do Estabelecimento</h3>
                        <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center" onClick={onClose}>
                            <i className="fas fa-times text-gray-500"></i>
                        </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl mb-4">
                        <p className="font-bold text-gray-900">{estab.estabelecimento}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <i className="fas fa-map-marker-alt"></i> {estab.municipio}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-3xl font-bold text-blue-600">{estab.taxa.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Taxa de Boas Práticas</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <p className="text-3xl font-bold text-green-600">{estab.tg}</p>
                            <p className="text-sm text-gray-500">Total Gestantes</p>
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="animate-fadeIn">
                {selectedMetric && <MetricPopup metric={selectedMetric} onClose={() => setSelectedMetric(null)} />}
                {selectedIndicator && <IndicatorPopup indicator={selectedIndicator} onClose={() => setSelectedIndicator(null)} />}
                {selectedEstab && <EstabPopup estab={selectedEstab} onClose={() => setSelectedEstab(null)} />}
                
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Painel de Indicadores</h1>
                        <p className="text-gray-500">Cuidado com Gestantes e Puérperas</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                        <i className="fas fa-clock"></i>
                        <span>Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                <FilterBar />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { title: "Taxa de Boas Práticas", value: m.taxa.toFixed(2), sub: "Somatório / Total Gestantes", icon: "fas fa-chart-line", color: "bg-blue-600", details: "A taxa representa a média de boas práticas realizadas por gestante." },
                        { title: "Somatório", value: m.somatorio.toLocaleString(), sub: "Práticas realizadas", icon: "fas fa-check-circle", color: "bg-green-600", details: "Total de práticas de saúde realizadas no período selecionado." },
                        { title: "Total Gestantes", value: m.totalGestantes.toLocaleString(), sub: "Vinculadas às equipes", icon: "fas fa-users", color: "bg-cyan-600", details: "Número total de gestantes e puérperas acompanhadas pelas equipes." },
                        { title: "Equipes Ativas", value: m.equipes.toLocaleString(), sub: "Com registros", icon: "fas fa-user-md", color: "bg-purple-600", details: "Equipes de saúde com registros no período." }
                    ].map((metric, i) => (
                        <div key={i} className={`card metric-card cursor-pointer animate-fadeInUp stagger-${i+1}`} onClick={() => setSelectedMetric(metric)}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{metric.title}</p>
                                    <p className="metric-value">{metric.value}</p>
                                    <p className="text-xs text-gray-500 mt-1">{metric.sub}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metric.color}`}>
                                    <i className={`${metric.icon} text-white text-xl`}></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card p-6 animate-fadeInUp">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Evolução Mensal</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{trend.length} meses</span>
                        </div>
                        <div style={{height:'280px'}}><LineChart data={trend} /></div>
                    </div>
                    <div className="card p-6 animate-fadeInUp">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold">Melhores Estabelecimentos</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Top 10</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Clique para ver detalhes</p>
                        <div style={{height:'260px'}}><EstabChart data={estabs.slice(0,10)} /></div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {estabs.slice(0,5).map((e, i) => (
                                <button key={i} onClick={() => setSelectedEstab(e)} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-all">
                                    {i+1}. {e.estabelecimento.slice(0,20)}...
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card p-6 mb-6 animate-fadeInUp">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Indicadores Detalhados</h3>
                        <span className="text-xs text-gray-500">Clique para ver ranking</span>
                    </div>
                    {ind.map((i, idx) => (
                        <div key={i.index} className="py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-all" onClick={() => setSelectedIndicator(i)}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm flex items-center justify-center font-bold">{i.index}</span>
                                    <span className="text-sm font-medium">{i.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`status-badge ${getStatusClass(i.pct)}`}>{i.pct.toFixed(1)}% - {getStatusText(i.pct)}</span>
                                    <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
                                </div>
                            </div>
                            <div className="indicator-bar ml-11"><div className="indicator-fill" style={{width:`${Math.min(i.pct,100)}%`, backgroundColor: getColor(i.pct)}}></div></div>
                        </div>
                    ))}
                </div>
                <div className="card p-6 animate-fadeInUp">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">Heatmap — Gestantes</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{hm.length} municípios</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Municípios × Componentes (dinâmico com filtros)</p>
                    <Heatmap data={hm} />
                </div>
            </div>
        );
    };

    const IndicatorsView = () => {
        const [by, setBy] = useState('regiao');
        const ref = useRef(null), chart = useRef(null);
        const ind = calcIndicators();
        const critical = [...ind].sort((a,b) => a.pct - b.pct).slice(0,4);
        const best = [...ind].sort((a,b) => b.pct - a.pct).slice(0,3);

        const getData = () => {
            const groups = [...new Set(filteredData.map(r => r[by]))].filter(Boolean).sort();
            return groups.map(g => {
                const d = filteredData.filter(r => r[by] === g);
                const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
                const sm = d.reduce((s,r) => s + r.somatorio, 0);
                return { name: g, taxa: tg ? sm/tg : 0, tg, sm };
            });
        };
        const data = getData();

        const getComparison = (idx) => {
            const muns = [...new Set(filteredData.map(r => r.municipio))];
            const arr = muns.map(m => {
                const d = filteredData.filter(r => r.municipio === m);
                const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
                const t = d.reduce((s,r) => s + r[`ind${idx}`], 0);
                return { m, pct: tg ? (t/tg)*100 : 0 };
            }).sort((a,b) => b.pct - a.pct);
            return { best: arr[0], worst: arr[arr.length-1] };
        };

        useEffect(() => {
            if (!ref.current || !data.length) return;
            if (chart.current) chart.current.destroy();
            chart.current = new Chart(ref.current, {
                type: 'bar',
                data: { labels: data.map(d => d.name), datasets: [{ data: data.map(d => d.taxa), backgroundColor: data.map(d => getTaxaColor(d.taxa)), borderRadius: 8 }] },
                options: { responsive: true, maintainAspectRatio: false, indexAxis: by === 'municipio' ? 'y' : 'x', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true }, y: {} } }
            });
            return () => chart.current?.destroy();
        }, [data, by]);

        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Análises Estratégicas</h1>
                <p className="text-gray-500 mb-6">Visão gerencial para tomada de decisão</p>
                <FilterBar />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="card strategic-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><i className="fas fa-trophy text-yellow-300 text-xl"></i></div>
                            <div><h3 className="font-bold">Melhor Desempenho</h3><p className="text-blue-200 text-sm">Componente destaque</p></div>
                        </div>
                        {best[0] && <><p className="text-3xl font-bold">{best[0].pct.toFixed(1)}%</p><p className="text-sm text-blue-100">{best[0].name}</p></>}
                    </div>
                    <div className="card p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center"><i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i></div>
                            <div><h3 className="font-bold text-gray-800">Atenção Necessária</h3><p className="text-gray-500 text-sm">Componente crítico</p></div>
                        </div>
                        {critical[0] && <><p className="text-3xl font-bold text-yellow-600">{critical[0].pct.toFixed(1)}%</p><p className="text-sm text-gray-600">{critical[0].name}</p></>}
                    </div>
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-800 mb-2">Resumo de Status</h3>
                        <div className="space-y-2">
                            {[['Ótimo','#22c55e',ind.filter(i=>i.pct>=75).length],['Bom','#84cc16',ind.filter(i=>i.pct>=50&&i.pct<75).length],['Suficiente','#fbbf24',ind.filter(i=>i.pct>=25&&i.pct<50).length],['Regular','#ef4444',ind.filter(i=>i.pct<25).length]].map(([l,c,n]) => (
                                <div key={l} className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor:c}}></span><span className="text-sm">{l}: {n}</span></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div><h3 className="text-xl font-bold">Comparativo de Desempenho</h3><p className="text-gray-500 text-sm">Por {by === 'regiao' ? 'região' : 'município'}</p></div>
                        <div className="flex gap-2">
                            {['regiao','municipio'].map(b => (
                                <button key={b} onClick={() => setBy(b)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${by===b ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                                    {b === 'regiao' ? 'Região' : 'Município'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{height: by === 'municipio' ? '500px' : '300px'}}><canvas ref={ref}></canvas></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-sort-amount-up text-blue-600 mr-2"></i>Ranking</h3>
                        <div className="space-y-2">
                            {data.sort((a,b) => b.taxa - a.taxa).slice(0,10).map((d,i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i<3 ? 'bg-yellow-400 text-white' : 'bg-gray-200'}`}>{i+1}</span>
                                    <div className="flex-1"><p className="font-semibold">{d.name}</p><p className="text-xs text-gray-500">{d.tg.toLocaleString()} gestantes</p></div>
                                    <span className="font-bold">{d.taxa.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-800 mb-4"><i className="fas fa-lightbulb text-yellow-500 mr-2"></i>Fatores Críticos e Reflexões</h3>
                        <div className="space-y-4">
                            {critical.map((f,i) => {
                                const cmp = getComparison(f.index);
                                return (
                                    <div key={i} className={`insight-card ${f.pct < 25 ? 'border-red-500' : f.pct < 50 ? 'border-yellow-500' : 'border-green-500'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">Componente {f.index}</span>
                                            <span className={`status-badge ${getStatusClass(f.pct)}`}>{f.pct.toFixed(1)}%</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{f.name}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-green-50 p-2 rounded"><p className="text-green-700 font-semibold">Melhor: {cmp.best?.m}</p><p className="text-green-600">{cmp.best?.pct.toFixed(1)}%</p></div>
                                            <div className="bg-red-50 p-2 rounded"><p className="text-red-700 font-semibold">Pior: {cmp.worst?.m}</p><p className="text-red-600">{cmp.worst?.pct.toFixed(1)}%</p></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 italic"><i className="fas fa-info-circle mr-1"></i>Gap de {(cmp.best?.pct - cmp.worst?.pct).toFixed(1)} p.p. entre municípios</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const MapView = () => {
        const mapRef = useRef(null), mapInst = useRef(null), layerRef = useRef(null);
        const [ind, setInd] = useState('taxa');
        const [mf, setMf] = useState({ regiao: 'Todas', competencia: 'Todas' });

        const getMapData = () => {
            let d = [...rawData];
            if (mf.regiao !== 'Todas') d = d.filter(r => r.regiao === mf.regiao);
            if (mf.competencia !== 'Todas') d = d.filter(r => r.competencia === mf.competencia);
            const muns = [...new Set(d.map(r => r.municipio))];
            return muns.map(m => {
                const md = d.filter(r => r.municipio === m);
                const tg = md.reduce((s,r) => s + r.totalGestantes, 0);
                const sm = md.reduce((s,r) => s + r.somatorio, 0);
                const comps = {};
                for (let i = 1; i <= 11; i++) {
                    const t = md.reduce((s,r) => s + r[`ind${i}`], 0);
                    comps[`ind${i}`] = tg ? (t/tg)*100 : 0;
                }
                return { municipio: m, taxa: tg ? sm/tg : 0, tg, sm, ...comps };
            });
        };
        const mapData = getMapData();
        const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const findMun = n => mapData.find(m => norm(m.municipio) === norm(n));

        useEffect(() => {
            if (!mapRef.current || mapInst.current) return;
            mapInst.current = L.map(mapRef.current).setView([-9.0, -70.0], 7);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { attribution: '© CARTO' }).addTo(mapInst.current);
            return () => { mapInst.current?.remove(); mapInst.current = null; };
        }, []);

        useEffect(() => {
            if (!mapInst.current || !geoJson) return;
            if (layerRef.current) mapInst.current.removeLayer(layerRef.current);
            layerRef.current = L.geoJSON(geoJson, {
                style: f => {
                    const d = findMun(f.properties.name);
                    const v = d ? (ind === 'taxa' ? d.taxa : d[ind]) : 0;
                    const c = ind === 'taxa' ? getTaxaColor(v) : getColor(v);
                    return { fillColor: c, weight: 2, color: '#fff', fillOpacity: 0.85 };
                },
                onEachFeature: (f, l) => {
                    const d = findMun(f.properties.name);
                    const v = d ? (ind === 'taxa' ? d.taxa.toFixed(2) : d[ind].toFixed(1) + '%') : 'N/A';
                    l.bindPopup(`<b>${f.properties.name}</b><br>${ind === 'taxa' ? 'Taxa' : INDICATOR_SHORT[parseInt(ind.replace('ind',''))-1]}: ${v}<br>Gestantes: ${d?.tg?.toLocaleString() || 0}`);
                    l.on('mouseover', () => l.setStyle({ weight: 3, color: '#1e3a5f' }));
                    l.on('mouseout', () => layerRef.current.resetStyle(l));
                }
            }).addTo(mapInst.current);
        }, [geoJson, ind, mapData]);

        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa Geográfico</h1>
                <p className="text-gray-500 mb-6">Distribuição espacial dos indicadores</p>
                <div className="card p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-semibold"><i className="fas fa-filter text-blue-500 mr-2"></i>Filtros do Mapa:</span>
                        <select className="filter-select" value={mf.regiao} onChange={e => setMf({...mf, regiao: e.target.value})}>
                            <option value="Todas">Todas as Regiões</option>
                            {getUnique('regiao').map(v => <option key={v}>{v}</option>)}
                        </select>
                        <select className="filter-select" value={mf.competencia} onChange={e => setMf({...mf, competencia: e.target.value})}>
                            <option value="Todas">Todas as Competências</option>
                            {getUnique('competencia').map(v => <option key={v}>{v}</option>)}
                        </select>
                        <select className="filter-select" value={ind} onChange={e => setInd(e.target.value)}>
                            <option value="taxa">Taxa de Boas Práticas</option>
                            {INDICATOR_SHORT.map((n,i) => <option key={i} value={`ind${i+1}`}>C{i+1} - {n}</option>)}
                        </select>
                    </div>
                </div>
                <div className="card p-6 mb-6">
                    <div ref={mapRef} id="map"></div>
                    <div className="flex justify-center mt-4 gap-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#ef4444'}}></span>Regular</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#fbbf24'}}></span>Suficiente</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#84cc16'}}></span>Bom</span>
                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#22c55e'}}></span>Ótimo</span>
                    </div>
                </div>
                <div className="card p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Ranking de Municípios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mapData.sort((a,b) => (ind === 'taxa' ? b.taxa - a.taxa : b[ind] - a[ind])).map((m,i) => {
                            const v = ind === 'taxa' ? m.taxa : m[ind];
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i<3 ? 'bg-yellow-400 text-white' : 'bg-gray-100'}`}>{i+1}</span>
                                    <div className="flex-1"><p className="font-medium">{m.municipio}</p><p className="text-xs text-gray-500">{m.tg.toLocaleString()} gestantes</p></div>
                                    <span className={`status-badge ${ind === 'taxa' ? getStatusClass(Math.min(v*2,100)) : getStatusClass(v)}`}>{ind === 'taxa' ? v.toFixed(2) : v.toFixed(1)+'%'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const DataTableView = () => {
        const [page, setPage] = useState(0);
        const [search, setSearch] = useState('');
        const [sortField, setSortField] = useState('municipio');
        const [sortDir, setSortDir] = useState('asc');
        const pageSize = 20;

        const columns = [
            { key: 'estabelecimento', label: 'Estabelecimento' },
            { key: 'municipio', label: 'Município' },
            { key: 'regiao', label: 'Região' },
            { key: 'competencia', label: 'Competência' },
            { key: 'totalGestantes', label: 'Total Gestantes' },
            { key: 'somatorio', label: 'Somatório' },
            { key: 'ind1', label: 'C1' },
            { key: 'ind2', label: 'C2' },
            { key: 'ind3', label: 'C3' },
            { key: 'ind4', label: 'C4' },
            { key: 'ind5', label: 'C5' },
            { key: 'ind6', label: 'C6' },
            { key: 'ind7', label: 'C7' },
            { key: 'ind8', label: 'C8' },
            { key: 'ind9', label: 'C9' },
            { key: 'ind10', label: 'C10' },
            { key: 'ind11', label: 'C11' }
        ];

        const searchedData = search 
            ? filteredData.filter(r => 
                r.estabelecimento?.toLowerCase().includes(search.toLowerCase()) ||
                r.municipio?.toLowerCase().includes(search.toLowerCase()) ||
                r.regiao?.toLowerCase().includes(search.toLowerCase())
            )
            : filteredData;

        const sortedData = [...searchedData].sort((a, b) => {
            const aVal = a[sortField] || '';
            const bVal = b[sortField] || '';
            if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });

        const totalPages = Math.ceil(sortedData.length / pageSize);
        const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

        const handleSort = (field) => {
            if (sortField === field) {
                setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
            } else {
                setSortField(field);
                setSortDir('asc');
            }
        };

        const exportCSV = () => {
            const headers = columns.map(c => c.label).join(';');
            const rows = sortedData.map(r => columns.map(c => r[c.key] || '').join(';'));
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `dados_gestantes_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        };

        return (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Tabela de Dados</h1>
                        <p className="text-gray-500">Visualização dos dados brutos para análise técnica</p>
                    </div>
                    <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
                        <i className="fas fa-download"></i> Exportar CSV
                    </button>
                </div>
                <FilterBar />
                <div className="card p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div className="relative flex-1 max-w-md">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Buscar por estabelecimento, município ou região..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span><i className="fas fa-database mr-2"></i>{sortedData.length.toLocaleString()} registros</span>
                            <span><i className="fas fa-file-alt mr-2"></i>Página {page + 1} de {totalPages || 1}</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    {columns.map(col => (
                                        <th key={col.key} className="px-3 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => handleSort(col.key)}>
                                            {col.label}
                                            {sortField === col.key && <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ml-1 text-blue-500`}></i>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedData.map((row, i) => (
                                    <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                                        {columns.map(col => (
                                            <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                                                {typeof row[col.key] === 'number' ? row[col.key] : row[col.key] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={page === 0} onClick={() => setPage(0)}>
                                <i className="fas fa-angle-double-left"></i>
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                                <i className="fas fa-angle-left"></i>
                            </button>
                            <span className="px-4 py-2 font-medium">{page + 1} / {totalPages}</span>
                            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                                <i className="fas fa-angle-right"></i>
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                                <i className="fas fa-angle-double-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const PredictionsView = () => {
        const ind = calcIndicators();
        const trend = getTrend();
        
        // Análise de tendência para cada indicador
        const analyzeIndicator = (indicator) => {
            const monthlyData = MONTH_ORDER.map(month => {
                let data = [...rawData];
                if (filters.regiao !== 'Todas') data = data.filter(r => r.regiao === filters.regiao);
                if (filters.municipio !== 'Todos') data = data.filter(r => r.municipio === filters.municipio);
                const d = data.filter(r => r.competencia === month);
                if (!d.length) return null;
                const tg = d.reduce((s,r) => s + r.totalGestantes, 0);
                const t = d.reduce((s,r) => s + r[`ind${indicator.index}`], 0);
                return { month, pct: tg ? (t/tg)*100 : 0 };
            }).filter(Boolean);

            if (monthlyData.length < 2) return { trend: 'stable', change: 0, prediction: indicator.pct };

            const first = monthlyData.slice(0, Math.ceil(monthlyData.length/2));
            const last = monthlyData.slice(Math.ceil(monthlyData.length/2));
            const avgFirst = first.reduce((s,d) => s + d.pct, 0) / first.length;
            const avgLast = last.reduce((s,d) => s + d.pct, 0) / last.length;
            const change = avgLast - avgFirst;
            const prediction = Math.max(0, Math.min(100, indicator.pct + change));

            return {
                trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
                change: change,
                prediction: prediction,
                monthlyData
            };
        };

        const indicatorAnalysis = ind.map(i => ({
            ...i,
            analysis: analyzeIndicator(i)
        }));

        const criticalIndicators = indicatorAnalysis.filter(i => i.pct < 50).sort((a,b) => a.pct - b.pct);
        const decliningIndicators = indicatorAnalysis.filter(i => i.analysis.trend === 'down').sort((a,b) => a.analysis.change - b.analysis.change);
        const improvingIndicators = indicatorAnalysis.filter(i => i.analysis.trend === 'up').sort((a,b) => b.analysis.change - a.analysis.change);

        const getRiskLevel = (pct, trend) => {
            if (pct < 25) return { level: 'Crítico', color: 'red', icon: 'fa-exclamation-triangle' };
            if (pct < 50 || trend === 'down') return { level: 'Atenção', color: 'yellow', icon: 'fa-exclamation-circle' };
            if (pct >= 75 && trend !== 'down') return { level: 'Bom', color: 'green', icon: 'fa-check-circle' };
            return { level: 'Regular', color: 'blue', icon: 'fa-info-circle' };
        };

        const getBarriers = (indicator) => {
            const barriers = [];
            if (indicator.pct < 30) barriers.push('Baixa adesão das equipes ao protocolo');
            if (indicator.pct < 50) barriers.push('Possível falta de insumos ou recursos');
            if (indicator.analysis.trend === 'down') barriers.push('Tendência de queda requer ação imediata');
            if (indicator.index <= 3) barriers.push('Captação precoce de gestantes pode estar comprometida');
            if (indicator.index >= 9) barriers.push('Acompanhamento puerperal precisa de reforço');
            return barriers.length ? barriers : ['Manter monitoramento contínuo'];
        };

        const getRecommendations = (indicator) => {
            const recs = [];
            if (indicator.pct < 50) {
                recs.push('Realizar capacitação das equipes');
                recs.push('Revisar fluxo de atendimento');
            }
            if (indicator.analysis.trend === 'down') {
                recs.push('Investigar causas da queda');
                recs.push('Implementar busca ativa');
            }
            if (indicator.pct >= 75) {
                recs.push('Manter boas práticas');
                recs.push('Compartilhar experiências com outras equipes');
            }
            return recs.length ? recs : ['Continuar monitoramento regular'];
        };

        return (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Predições e Tendências</h1>
                        <p className="text-gray-500">Análise preditiva para ação estratégica do gestor</p>
                    </div>
                </div>
                <FilterBar />

                {/* Resumo Executivo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card p-5 border-l-4 border-red-500">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{criticalIndicators.length}</p>
                                <p className="text-sm text-gray-500">Indicadores Críticos</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-arrow-down text-yellow-600 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{decliningIndicators.length}</p>
                                <p className="text-sm text-gray-500">Em Declínio</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5 border-l-4 border-green-500">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-arrow-up text-green-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{improvingIndicators.length}</p>
                                <p className="text-sm text-gray-500">Em Melhoria</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <i className="fas fa-chart-line text-blue-500 text-xl"></i>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{(ind.reduce((s,i) => s + i.pct, 0) / ind.length).toFixed(1)}%</p>
                                <p className="text-sm text-gray-500">Média Geral</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas Prioritários */}
                {criticalIndicators.length > 0 && (
                    <div className="card p-6 mb-6 border-l-4 border-red-500">
                        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                            <i className="fas fa-exclamation-triangle"></i> Alertas Prioritários
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {criticalIndicators.slice(0, 4).map(i => (
                                <div key={i.index} className="p-4 bg-red-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-red-800">Componente {i.index}</span>
                                        <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-bold">{i.pct.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-sm text-red-700 mb-2">{i.fullName}</p>
                                    <p className="text-xs text-red-600">
                                        <i className="fas fa-arrow-right mr-1"></i>
                                        Previsão: {i.analysis.prediction.toFixed(1)}% 
                                        ({i.analysis.trend === 'up' ? '↑' : i.analysis.trend === 'down' ? '↓' : '→'})
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Análise Detalhada por Indicador */}
                <div className="card p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-microscope text-blue-500"></i> Análise Detalhada por Indicador
                    </h3>
                    <div className="space-y-4">
                        {indicatorAnalysis.map(i => {
                            const risk = getRiskLevel(i.pct, i.analysis.trend);
                            const barriers = getBarriers(i);
                            const recs = getRecommendations(i);
                            return (
                                <div key={i.index} className="p-4 border rounded-xl hover:shadow-md transition-all">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        <div className="flex items-center gap-3 lg:w-1/3">
                                            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">C{i.index}</span>
                                            <div>
                                                <p className="font-semibold text-gray-800">{i.fullName.slice(0, 50)}...</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${risk.color}-100 text-${risk.color}-700`}>
                                                        <i className={`fas ${risk.icon} mr-1`}></i>{risk.level}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {i.analysis.trend === 'up' && <span className="text-green-600"><i className="fas fa-arrow-up mr-1"></i>Subindo</span>}
                                                        {i.analysis.trend === 'down' && <span className="text-red-600"><i className="fas fa-arrow-down mr-1"></i>Caindo</span>}
                                                        {i.analysis.trend === 'stable' && <span className="text-gray-600"><i className="fas fa-minus mr-1"></i>Estável</span>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:w-1/6 text-center">
                                            <p className="text-2xl font-bold" style={{color: getColor(i.pct)}}>{i.pct.toFixed(1)}%</p>
                                            <p className="text-xs text-gray-500">Atual</p>
                                        </div>
                                        <div className="lg:w-1/6 text-center">
                                            <p className="text-2xl font-bold text-blue-600">{i.analysis.prediction.toFixed(1)}%</p>
                                            <p className="text-xs text-gray-500">Previsão</p>
                                        </div>
                                        <div className="lg:w-1/3">
                                            <div className="indicator-bar"><div className="indicator-fill" style={{width:`${Math.min(i.pct,100)}%`, backgroundColor: getColor(i.pct)}}></div></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                        <div>
                                            <p className="text-sm font-semibold text-red-700 mb-2"><i className="fas fa-exclamation-circle mr-1"></i>Barreiras Identificadas</p>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {barriers.map((b, idx) => <li key={idx} className="flex items-start gap-2"><i className="fas fa-times text-red-400 mt-0.5"></i>{b}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-green-700 mb-2"><i className="fas fa-lightbulb mr-1"></i>Recomendações</p>
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {recs.map((r, idx) => <li key={idx} className="flex items-start gap-2"><i className="fas fa-check text-green-400 mt-0.5"></i>{r}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Matriz de Risco */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-th text-purple-500"></i> Matriz de Risco e Priorização
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                            <h4 className="font-bold text-red-700 mb-3"><i className="fas fa-fire mr-2"></i>Alta Prioridade</h4>
                            <p className="text-xs text-red-600 mb-2">Baixo desempenho + Tendência de queda</p>
                            <div className="space-y-2">
                                {indicatorAnalysis.filter(i => i.pct < 50 && i.analysis.trend === 'down').map(i => (
                                    <div key={i.index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <span className="text-sm font-medium">C{i.index}</span>
                                        <span className="text-sm text-red-600 font-bold">{i.pct.toFixed(1)}%</span>
                                    </div>
                                ))}
                                {indicatorAnalysis.filter(i => i.pct < 50 && i.analysis.trend === 'down').length === 0 && 
                                    <p className="text-sm text-gray-500 italic">Nenhum indicador nesta categoria</p>
                                }
                            </div>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                            <h4 className="font-bold text-yellow-700 mb-3"><i className="fas fa-exclamation mr-2"></i>Média Prioridade</h4>
                            <p className="text-xs text-yellow-600 mb-2">Desempenho moderado ou em declínio</p>
                            <div className="space-y-2">
                                {indicatorAnalysis.filter(i => (i.pct >= 50 && i.pct < 75) || (i.pct >= 50 && i.analysis.trend === 'down')).slice(0, 4).map(i => (
                                    <div key={i.index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <span className="text-sm font-medium">C{i.index}</span>
                                        <span className="text-sm text-yellow-600 font-bold">{i.pct.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <h4 className="font-bold text-blue-700 mb-3"><i className="fas fa-eye mr-2"></i>Monitorar</h4>
                            <p className="text-xs text-blue-600 mb-2">Desempenho estável</p>
                            <div className="space-y-2">
                                {indicatorAnalysis.filter(i => i.pct >= 50 && i.pct < 75 && i.analysis.trend === 'stable').slice(0, 4).map(i => (
                                    <div key={i.index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <span className="text-sm font-medium">C{i.index}</span>
                                        <span className="text-sm text-blue-600 font-bold">{i.pct.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                            <h4 className="font-bold text-green-700 mb-3"><i className="fas fa-star mr-2"></i>Boas Práticas</h4>
                            <p className="text-xs text-green-600 mb-2">Alto desempenho + Tendência positiva</p>
                            <div className="space-y-2">
                                {indicatorAnalysis.filter(i => i.pct >= 75 && i.analysis.trend !== 'down').slice(0, 4).map(i => (
                                    <div key={i.index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                        <span className="text-sm font-medium">C{i.index}</span>
                                        <span className="text-sm text-green-600 font-bold">{i.pct.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleLogin = (userData) => {
        setUser(userData);
        const saved = localStorage.getItem('gdiaps_users');
        const users = saved ? JSON.parse(saved) : [];
        if (!users.find(u => u.id === userData.id)) {
            users.push(userData);
            localStorage.setItem('gdiaps_users', JSON.stringify(users));
        }
        setActiveView('home');
    };

    const handleLogout = () => {
        setUser(null);
        setActiveView('home');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    if (activeView === 'profile' && !user) {
        return <LoginView onLogin={handleLogin} onBack={() => setActiveView('home')} />;
    }

    return (
        <div className="min-h-screen">
            <Sidebar />
            <div className="main-content">
                {activeView === 'home' && <HomeView />}
                {activeView === 'indicators' && <IndicatorsView />}
                {activeView === 'map' && <MapView />}
                {activeView === 'data' && <DataTableView />}
                {activeView === 'predictions' && <PredictionsView />}
                {activeView === 'forum' && <ForumView user={user} topics={topics} setTopics={setTopics} onLoginRequired={() => setActiveView('profile')} />}
                {activeView === 'profile' && user && <ProfileView user={user} setUser={setUser} onLogout={handleLogout} topics={topics} />}
            </div>
        </div>
    );
};

ReactDOM.render(<Dashboard />, document.getElementById('root'));
