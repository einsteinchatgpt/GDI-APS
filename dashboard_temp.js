const MapView = () => {
    const [indFilter, setIndFilter] = useState('taxa');
    const mapRef = useRef(null), mapInstance = useRef(null);
    const hm = getHeatmap(filteredData, indFilter);
    const regiaoStats = getRegioes().map(r => { 
        const d = filteredData.filter(x => x.regiao === r); 
        let valor = 0; 
        if (indFilter === 'taxa') { 
            const s = d.reduce((a,x) => a + x.somatorio, 0), t = d.reduce((a,x) => a + (x.totalPacientes||0), 0); 
            valor = t ? s/t : 0; 
        } else { 
            const idx = parseInt(indFilter.replace('ind','')); 
            const t = d.reduce((a,x) => a + (x.totalPacientes||0), 0), val = d.reduce((a,x) => a + (x['ind'+idx]||0), 0); 
            valor = t ? (val/t)*100 : 0; 
        } 
        return { regiao: r, taxa: valor, municipios: new Set(d.map(x => x.municipio)).size }; 
    }).sort((a,b) => b.taxa - a.taxa);
    const clusters = { 
        otimo: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Ótimo').length, 
        bom: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Bom').length, 
        suficiente: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Suficiente').length, 
        regular: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Regular').length 
    };
    
    useEffect(() => { 
        if (!mapRef.current || !geoJson) return; 
        if (mapInstance.current) { 
            mapInstance.current.remove(); 
            mapInstance.current = null; 
        } 
        const map = L.map(mapRef.current).setView(selectedState === 'acre' ? [-9,-70] : [-5.8,-36.5], 7); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); 
        L.geoJSON(geoJson, { 
            style: f => { 
                const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); 
                return { fillColor: d ? getTaxaColor(d.taxa) : '#ccc', weight: 1, color: 'white', fillOpacity: 0.7 }; 
            }, 
            onEachFeature: (f, l) => { 
                const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); 
                const c = d ? (indFilter === 'taxa' ? getCategoriaTaxa(d.taxa) : getCategoriaComponente(d.taxa)) : null; 
                const label = indFilter === 'taxa' ? 'Taxa' : (config?.shortNames[parseInt(indFilter.replace('ind',''))-1] || 'Componente'); 
                l.bindPopup('<b>'+f.properties.name+'</b><br>'+label+': '+(d ? d.taxa.toFixed(2)+(indFilter === 'taxa' ? '' : '%') : 'N/A')+(c ? '<br>'+c.label : '')); 
            } 
        }).addTo(map); 
        mapInstance.current = map; 
        return () => { 
            if (mapInstance.current) { 
                mapInstance.current.remove(); 
                mapInstance.current = null; 
            } 
        }; 
    }, [geoJson, filteredData, filters, indFilter]);
    
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
