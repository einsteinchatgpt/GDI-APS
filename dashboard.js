const { useState, useEffect, useRef } = React;

if (typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
    Chart.defaults.set('plugins.datalabels', { display: false });
}

const fixMunicipioDisplay = (name) => {
    if (!name) return name;
    const fixes = { 'Acrelandia': 'Acrelândia', 'Brasileia': 'Brasiléia', 'Epitaciolandia': 'Epitaciolândia', 'Feijo': 'Feijó', 'Jordao': 'Jordão', 'Mancio Lima': 'Mâncio Lima', 'Placido de Castro': 'Plácido de Castro', 'Tarauaca': 'Tarauacá', 'AcrelÃ¢ndia': 'Acrelândia', 'BrasilÃ©ia': 'Brasiléia', 'Santa Rosa': 'Santa Rosa do Purus', 'Mau�s': 'Maués', 'Nhamund�': 'Nhamundá', 'S�o Sebasti�o do Uatum�': 'São Sebastião do Uatumã', 'Urucar�': 'Urucará', 'Maues': 'Maués', 'Nhamunda': 'Nhamundá', 'Sao Sebastiao do Uatuma': 'São Sebastião do Uatumã', 'Urucara': 'Urucará', 'S�O PAULO': 'São Paulo', 'SAO PAULO': 'São Paulo', 'SÃO PAULO': 'São Paulo', 'Sï¿½O PAULO': 'São Paulo' };
    return fixes[name] || name;
};
const normalizeMunicipioForGeoJSON = (name) => name ? name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 15 + 5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 3
    }));
    return (
        <div className="floating-shapes">
            {particles.map(p => (
                <div key={p.id} className="floating-shape" style={{
                    left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size}px`,
                    animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`
                }} />
            ))}
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, mode, setMode, onLogin }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', cargo: '', municipio: '', unidade: '', ufKey: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (mode === 'register' && !formData.ufKey) {
            setError('Selecione a UF que você terá acesso');
            return;
        }
        
        setLoading(true);
        setTimeout(() => {
            if (mode === 'login') {
                const saved = localStorage.getItem('gdiaps_users');
                const users = saved ? JSON.parse(saved) : [];
                const found = users.find(u => u.email === formData.email);
                if (found) {
                    onLogin(found);
                    onClose();
                } else {
                    setError('Usuário não encontrado. Cadastre-se primeiro.');
                }
            } else {
                const userData = { 
                    id: Math.random().toString(36).substr(2, 9),
                    name: formData.name, 
                    email: formData.email, 
                    cargo: formData.cargo || 'Profissional de Saúde', 
                    municipio: formData.municipio, 
                    unidade: formData.unidade,
                    ufKey: formData.ufKey,
                    ufName: AVAILABLE_UFS.find(u => u.key === formData.ufKey)?.name || ''
                };
                const saved = localStorage.getItem('gdiaps_users');
                const users = saved ? JSON.parse(saved) : [];
                users.push(userData);
                localStorage.setItem('gdiaps_users', JSON.stringify(users));
                onLogin(userData);
                onClose();
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-indigo-900/90 to-purple-900/95 backdrop-blur-sm"></div>
            <FloatingParticles />
            <div className="relative w-full max-w-lg animate-scaleIn z-10" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-100 transition-all hover:scale-110 z-20">
                    <i className="fas fa-times text-gray-600"></i>
                </button>
                
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                                <i className={`fas ${mode === 'login' ? 'fa-user-shield' : 'fa-user-plus'} text-white text-3xl`}></i>
                            </div>
                            <h2 className="text-2xl font-bold text-white">{mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
                            <p className="text-white/80 mt-2 text-sm">{mode === 'login' ? 'Acesse o painel de indicadores' : 'Selecione a UF que você terá acesso'}</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}
                        
                        {mode === 'register' && (
                            <div className="animate-slideUp">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <i className="fas fa-user mr-2 text-indigo-500"></i>Nome Completo
                                </label>
                                <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" placeholder="Seu nome completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                        )}
                        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className="fas fa-envelope mr-2 text-indigo-500"></i>E-mail
                            </label>
                            <input type="email" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <i className="fas fa-lock mr-2 text-indigo-500"></i>Senha
                            </label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white pr-12" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors">
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        {mode === 'register' && (
                            <>
                                <div className="animate-slideUp" style={{ animationDelay: '0.25s' }}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <i className="fas fa-flag mr-2 text-indigo-500"></i>UF de Acesso <span className="text-red-500">*</span>
                                    </label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" value={formData.ufKey} onChange={e => setFormData({...formData, ufKey: e.target.value})} required>
                                        <option value="">Selecione a UF...</option>
                                        {AVAILABLE_UFS.map(uf => (
                                            <option key={uf.key} value={uf.key}>{uf.name} ({uf.uf})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Você só terá acesso aos dados desta UF</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <i className="fas fa-briefcase mr-2 text-indigo-500"></i>Cargo
                                        </label>
                                        <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})}>
                                            <option value="">Selecione...</option>
                                            <option>Enfermeiro(a)</option>
                                            <option>Médico(a)</option>
                                            <option>Gestor(a) de Saúde</option>
                                            <option>Coordenador(a) APS</option>
                                            <option>Técnico(a) de Enfermagem</option>
                                            <option>ACS</option>
                                            <option>Outro</option>
                                        </select>
                                    </div>
                                    <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i>Município
                                        </label>
                                        <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" placeholder="Seu município" value={formData.municipio} onChange={e => setFormData({...formData, municipio: e.target.value})} />
                                    </div>
                                </div>
                                <div className="animate-slideUp" style={{ animationDelay: '0.5s' }}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <i className="fas fa-hospital mr-2 text-indigo-500"></i>Unidade de Saúde (opcional)
                                    </label>
                                    <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-gray-50 focus:bg-white" placeholder="Nome da sua unidade" value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} />
                                </div>
                            </>
                        )}
                        
                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6">
                            {loading ? (
                                <><i className="fas fa-circle-notch fa-spin"></i> Processando...</>
                            ) : (
                                <><i className={`fas ${mode === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i> {mode === 'login' ? 'Entrar' : 'Criar Conta'}</>
                            )}
                        </button>
                        
                        {mode === 'login' && (
                            <div className="text-center">
                                <button type="button" className="text-sm text-indigo-600 hover:underline">Esqueceu sua senha?</button>
                            </div>
                        )}
                        
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-500">ou</span></div>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-gray-600">
                                {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                                <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="ml-2 text-indigo-600 font-bold hover:underline">
                                    {mode === 'login' ? 'Cadastre-se grátis' : 'Fazer login'}
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const LandingPage = ({ onSelectIndicator, onSelectComponent, user, onOpenAuth }) => {
    const components = [
        { key: 'equidade', title: 'I - Equidade', icon: 'fa-balance-scale', color: '#10b981', desc: 'Financiamento e distribuição de recursos', hasData: true },
        { key: 'cadastro', title: 'II - Cadastro e Acompanhamento', icon: 'fa-clipboard-list', color: '#6366f1', desc: 'Gestão de cadastros e acompanhamento territorial', hasData: false },
        { key: 'qualidade', title: 'III - Qualidade', icon: 'fa-star', color: '#f59e0b', desc: 'Boas práticas e indicadores de qualidade', hasData: true }
    ];
    
    const boasPraticas = [
        { key: 'gestantes', title: 'Gestantes e Puérperas', icon: 'fa-baby', color: '#ec4899', desc: 'Acompanhamento pré-natal e puerpério', states: ['acre', 'rn', 'am', 'mt'], municipios: ['msp'], stats: '11 Boas Práticas' },
        { key: 'has', title: 'Hipertensão Arterial', icon: 'fa-heart-pulse', color: '#ef4444', desc: 'Monitoramento de hipertensos', states: ['rn'], stats: '4 Boas Práticas' },
        { key: 'dm', title: 'Diabetes Mellitus', icon: 'fa-droplet', color: '#3b82f6', desc: 'Controle de diabéticos', states: ['rn'], stats: '6 Boas Práticas' }
    ];
    
    const [selComponent, setSelComponent] = useState(null);
    const [selBoaPratica, setSelBoaPratica] = useState(null);

    const handleComponentClick = (comp) => {
        if (comp.key === 'equidade') {
            onSelectComponent('equidade');
        } else if (comp.key === 'cadastro') {
            alert('Componente II - Cadastro e Acompanhamento: Em breve! Aguardando bases de dados.');
        } else if (comp.key === 'qualidade') {
            setSelComponent(comp);
        }
    };

    return (
        <div className="min-h-screen landing-bg relative overflow-hidden flex flex-col">
            <div className="landing-pattern"></div>
            <FloatingParticles />
            
            {/* Header Corporativo */}
            <header className="relative z-50 px-8 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                            <i className="fas fa-heartbeat text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">GDI-APS Brasil</h1>
                            <p className="text-xs text-white/60 uppercase tracking-wider">Gestão de Desempenho</p>
                        </div>
                    </div>
                    {(() => {
                        const [expanded, setExpanded] = useState(false);
                        return (
                            <div className="relative">
                                {user ? (
                                    <button 
                                        onClick={() => setExpanded(!expanded)} 
                                        className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl hover:bg-white/20 transition-all group border border-white/20"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <i className="fas fa-user-nurse text-white"></i>
                                        </div>
                                        <div className="text-left hidden sm:block">
                                            <p className="text-sm font-bold text-white">{user.name}</p>
                                            <p className="text-xs text-white/70">{user.ufName || user.cargo}</p>
                                        </div>
                                        <i className={`fas fa-chevron-down text-white/60 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}></i>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { onOpenAuth(); }}
                                            className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-white font-medium"
                                        >
                                            <i className="fas fa-sign-in-alt"></i>
                                            <span className="hidden sm:inline">Entrar</span>
                                        </button>
                                        <button 
                                            onClick={() => { onOpenAuth(); }}
                                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-white font-medium"
                                        >
                                            <i className="fas fa-user-plus"></i>
                                            <span className="hidden sm:inline">Cadastrar</span>
                                        </button>
                                    </div>
                                )}
                                
                                {expanded && user && (
                                    <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn z-50">
                                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                                                    <i className="fas fa-user-nurse text-white text-xl"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-lg">{user.name}</p>
                                                    <p className="text-sm text-white/80">{user.cargo}</p>
                                                    {user.ufName && <p className="text-xs text-white/60 mt-1"><i className="fas fa-flag mr-1"></i>{user.ufName}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-3 group">
                                                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                                    <i className="fas fa-user-circle text-indigo-600"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">Meu Perfil</p>
                                                    <p className="text-xs text-gray-500">Visualizar e editar dados</p>
                                                </div>
                                            </button>
                                            <hr className="my-2 border-gray-100" />
                                            <button onClick={() => { localStorage.removeItem('gdiaps_user'); window.location.reload(); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-3 group">
                                                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                    <i className="fas fa-sign-out-alt text-red-600"></i>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-red-600">Sair</p>
                                                    <p className="text-xs text-red-400">Encerrar sessão</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </header>
            
            {/* Hero Section */}
            <section className="relative z-10 px-8 py-6 flex-1 flex items-center">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-4">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-sm text-white/80 font-medium">Plataforma de Indicadores da APS</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                            Transformando dados em <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">decisões estratégicas</span>
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Monitore e analise os indicadores de saúde da Atenção Primária com inteligência e precisão
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Cards de Componentes */}
            <section className="relative z-10 px-8 pb-8">
                <div className="max-w-5xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Selecione o Componente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {components.map((comp, idx) => (
                            <div 
                                key={comp.key} 
                                onClick={() => handleComponentClick(comp)}
                                className={`bg-white/10 backdrop-blur border-2 border-white/20 rounded-2xl p-6 cursor-pointer group hover:bg-white/20 hover:border-white/40 transition-all duration-300 animate-slideUp hover:scale-105 ${!comp.hasData ? 'opacity-70' : ''}`}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 mx-auto mb-4" style={{ backgroundColor: comp.color }}>
                                        <i className={`fas ${comp.icon} text-white text-2xl`}></i>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">{comp.title}</h4>
                                    <p className="text-white/70 text-sm mb-3">{comp.desc}</p>
                                    {!comp.hasData && (
                                        <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full">
                                            <i className="fas fa-clock"></i> Em breve
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Modal de seleção de Boa Prática (Componente Qualidade) */}
            {selComponent && selComponent.key === 'qualidade' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelComponent(null)}>
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: selComponent.color }}>
                            <i className={`fas ${selComponent.icon} text-white text-2xl`}></i>
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{selComponent.title}</h3>
                        <p className="text-gray-500 text-center mb-6">Selecione a Boa Prática</p>
                        
                        <div className="space-y-3">
                            {boasPraticas.map(bp => (
                                <button 
                                    key={bp.key} 
                                    onClick={() => { setSelComponent(null); setSelBoaPratica(bp); }}
                                    className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl font-semibold transition-all flex items-center justify-between group border border-gray-200"
                                >
                                    <span className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bp.color }}>
                                            <i className={`fas ${bp.icon} text-white`}></i>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-gray-800">{bp.title}</p>
                                            <p className="text-xs text-gray-500">{bp.stats}</p>
                                        </div>
                                    </span>
                                    <i className="fas fa-arrow-right text-gray-400 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de seleção de estado para Boa Prática */}
            {selBoaPratica && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelBoaPratica(null)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: selBoaPratica.color }}>
                            <i className={`fas ${selBoaPratica.icon} text-white text-2xl`}></i>
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">{selBoaPratica.title}</h3>
                        
                        {user && user.ufKey ? (
                            <>
                                <p className="text-gray-500 text-center mb-4 mt-6">Você tem acesso a:</p>
                                <button 
                                    onClick={() => {
                                        const userState = user.ufKey;
                                        const hasAccess = selBoaPratica.states.includes(userState) || (selBoaPratica.municipios && selBoaPratica.municipios.includes(userState));
                                        if (hasAccess) {
                                            onSelectIndicator(selBoaPratica.key, userState);
                                        } else {
                                            alert(`Esta boa prática não possui dados para ${user.ufName}. Disponível para: ${selBoaPratica.states.map(s => STATE_CONFIG[s]?.name).join(', ')}`);
                                        }
                                    }}
                                    className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-between group"
                                >
                                    <span className="flex items-center gap-3">
                                        <i className="fas fa-flag"></i>
                                        {user.ufName}
                                    </span>
                                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-500 text-center mb-4 mt-6 flex items-center justify-center gap-2">
                                    <i className="fas fa-flag text-gray-400"></i>
                                    <span>Selecione a UF</span>
                                </p>
                                <div className="space-y-3">
                                    {selBoaPratica.states.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => onSelectIndicator(selBoaPratica.key, s)} 
                                            className="w-full p-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-between group"
                                        >
                                            <span className="flex items-center gap-3">
                                                <i className="fas fa-map-marker-alt"></i>
                                                {STATE_CONFIG[s].name}
                                            </span>
                                            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                        </button>
                                    ))}
                                </div>
                                
                                {selBoaPratica.municipios && selBoaPratica.municipios.length > 0 && (
                                    <>
                                        <div className="border-t border-gray-200 my-6"></div>
                                        <p className="text-gray-500 text-center mb-4 flex items-center justify-center gap-2">
                                            <i className="fas fa-city text-gray-400"></i>
                                            <span>Municípios</span>
                                        </p>
                                        <div className="space-y-3">
                                            {selBoaPratica.municipios.map(m => (
                                                <button 
                                                    key={m} 
                                                    onClick={() => onSelectIndicator(selBoaPratica.key, m)} 
                                                    className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-between group"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <i className="fas fa-city"></i>
                                                        {STATE_CONFIG[m].name}
                                                    </span>
                                                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {/* Footer */}
            <footer className="relative z-10 px-8 py-6 border-t border-white/10">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-white/40 text-sm">© 2025 GDI-APS Brasil - Gestão de Desempenho de Indicadores da APS</p>
                </div>
            </footer>
        </div>
    );
};

const Dashboard = () => {
    const [indicatorType, setIndicatorType] = useState(null), [selectedState, setSelectedState] = useState(null);
    const [rawData, setRawData] = useState([]), [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false), [error, setError] = useState(null), [activeView, setActiveView] = useState('home');
    const [filters, setFilters] = useState({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas', equipe: 'Todas', distrito: 'Todos', oss: 'Todas', unidade: 'Todas', sigla: 'Todas' });
    const [geoJson, setGeoJson] = useState(null), [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('gdiaps_user')) || null);
    const [topics, setTopics] = useState(() => JSON.parse(localStorage.getItem('gdiaps_topics')) || []);
    const [authModal, setAuthModal] = useState(false), [authMode, setAuthMode] = useState('login');
    const [babyTipsShown, setBabyTipsShown] = useState(() => JSON.parse(sessionStorage.getItem('gdiaps_baby_tips_shown')) || {});
    const [showNotaTecnica, setShowNotaTecnica] = useState(false);
    const [notaTecnicaMinimized, setNotaTecnicaMinimized] = useState(false);
    const [profileMinimized, setProfileMinimized] = useState(false);
    const [activeComponent, setActiveComponent] = useState(null);
    const [equidadeData, setEquidadeData] = useState({ janeiro: null, fevereiro: null });
    const [equidadeLoading, setEquidadeLoading] = useState(false);
    const [selectedEquidadeTab, setSelectedEquidadeTab] = useState('eSF');
    const [selectedEquidadeMes, setSelectedEquidadeMes] = useState('fevereiro');
    const config = indicatorType ? INDICATOR_CONFIG[indicatorType] : null;
    const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0891b2', '#c026d3', '#ea580c'];
    
    const markBabyTipShown = (view) => {
        const newTips = { ...babyTipsShown, [view]: true };
        setBabyTipsShown(newTips);
        sessionStorage.setItem('gdiaps_baby_tips_shown', JSON.stringify(newTips));
    };
    
    const babyTips = {
        home: "O painel principal, este é! Resumo de tudo, aqui você vê. Métricas importantes, os cards coloridos mostram, hmm!",
        indicators: "Comparar regiões e municípios, aqui você pode. Quem bem está e quem ajuda precisa, descobrir você deve!",
        components: "Cada boa prática, uma ação de saúde é. A evolução ao longo do tempo, observar você deve!",
        strategic: "Para gestores, esta visão é! Projeções e análises, decisões importantes tomar, ajudam elas!",
        goals: "Suas metas, definir aqui você deve! O progresso acompanhar, no caminho certo estar, verificar você pode!",
        evaluation: "Avaliar o desempenho, importante é! Gráficos e tabelas, em relação às metas, como indo está, mostram!",
        notes: "Anotar tudo importante, aqui você deve! Problemas, ideias, ações... Nada escapar, deixe não!",
        map: "Visualmente tudo, o mapa mostra! As cores, o desempenho de cada município indicam, hmm!",
        dataCollection: "Novos dados importar, aqui você pode! Arquivos Excel com informações atualizadas, trazer você deve!",
        profile: "Seu perfil, este é! Suas informações personalizar e feedbacks ver, aqui você pode!"
    };
    
    const BabyAPSTip = ({ view }) => {
        // Sempre mostrar na primeira vez que a view é carregada
        if (!view || babyTipsShown[view]) return null;
        return (
            <div className="fixed bottom-6 left-24 z-40 animate-slideUp">
                <div className="flex items-end gap-3">
                    <div className="relative">
                        {/* Túnica/Manto */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-full" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}}></div>
                        {/* Corpo do Yoda */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-2xl border-4 border-amber-500/60 animate-float overflow-visible relative">
                            {/* Orelhas grandes e pontudas */}
                            <div className="absolute -left-7 top-3 w-5 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full transform -rotate-25 shadow-lg" style={{clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)'}}></div>
                            <div className="absolute -right-7 top-3 w-5 h-10 bg-gradient-to-l from-green-600 to-green-700 rounded-full transform rotate-25 shadow-lg" style={{clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)'}}></div>
                            
                            <div className="relative z-10">
                                {/* Pelos/Cabelo branco */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                    <div className="w-1 h-3 bg-gray-100 rounded-full opacity-90"></div>
                                    <div className="w-1 h-4 bg-white rounded-full"></div>
                                    <div className="w-1 h-3.5 bg-gray-100 rounded-full opacity-90"></div>
                                    <div className="w-1 h-3 bg-white rounded-full opacity-80"></div>
                                </div>
                                
                                {/* Rosto verde enrugado */}
                                <div className="w-12 h-12 bg-gradient-to-b from-green-500 to-green-600 rounded-full flex flex-col items-center justify-center relative">
                                    {/* Rugas na testa */}
                                    <div className="absolute top-2 left-2 right-2 flex flex-col gap-0.5">
                                        <div className="w-full h-0.5 bg-green-800/40 rounded-full"></div>
                                        <div className="w-3/4 h-0.5 bg-green-800/30 rounded-full mx-auto"></div>
                                    </div>
                                    
                                    {/* Olhos grandes e sábios */}
                                    <div className="flex gap-2 mb-1 mt-2">
                                        <div className="w-3 h-3 bg-amber-50 rounded-full relative border-2 border-green-800 shadow-inner">
                                            <div className="absolute top-0.5 left-1 w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                                            <div className="absolute top-0.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                                        </div>
                                        <div className="w-3 h-3 bg-amber-50 rounded-full relative border-2 border-green-800 shadow-inner">
                                            <div className="absolute top-0.5 left-1 w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                                            <div className="absolute top-0.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Nariz pequeno */}
                                    <div className="w-1.5 h-2 bg-green-700 rounded-full mb-0.5"></div>
                                    
                                    {/* Boca sábia */}
                                    <div className="w-4 h-2 border-b-2 border-green-900 rounded-b-full"></div>
                                </div>
                            </div>
                            
                            {/* Bastão/Cajado do Jedi */}
                            <div className="absolute -right-2 bottom-2 transform rotate-20">
                                <div className="w-1 h-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full shadow-lg"></div>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-2 bg-amber-600 rounded-t-full"></div>
                            </div>
                            
                            {/* Aura da Força */}
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-400/30 rounded-full border-2 border-green-400/50 animate-pulse flex items-center justify-center">
                                <i className="fas fa-star text-amber-300 text-sm drop-shadow-lg"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 rounded-2xl rounded-bl-none p-4 shadow-2xl max-w-sm relative animate-scaleIn border-2 border-amber-400/40">
                        <div className="absolute -left-2 bottom-4 w-4 h-4 bg-gradient-to-br from-amber-50 to-green-50 transform rotate-45 border-l-2 border-b-2 border-amber-400/40"></div>
                        
                        {/* Citação estilo Star Wars */}
                        <div className="flex items-start gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center flex-shrink-0 border-2 border-amber-400/50 shadow-lg">
                                <i className="fas fa-jedi text-amber-200 text-sm"></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-green-800 text-xs font-bold mb-1">Mestre Yoda</p>
                                <p className="text-gray-700 text-sm leading-relaxed italic font-medium">{babyTips[view]}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-green-200/50">
                            <div className="text-xs text-green-600 flex items-center gap-1">
                                <i className="fas fa-lightbulb"></i>
                                <span>Dica Jedi</span>
                            </div>
                            <button onClick={() => markBabyTipShown(view)} className="text-xs bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white px-4 py-1.5 rounded-full hover:from-green-700 hover:to-emerald-800 transition-all shadow-md font-semibold flex items-center gap-1">
                                <i className="fas fa-check-circle"></i>
                                Compreendi, Mestre!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const NotaTecnicaModal = () => {
        if (!showNotaTecnica) return null;
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowNotaTecnica(false)}>
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-book-open text-white text-xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Nota Técnica</h2>
                                    <p className="text-blue-200 text-sm">Metodologia de Cálculo dos Indicadores</p>
                                </div>
                            </div>
                            <button onClick={() => setShowNotaTecnica(false)} className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                <i className="fas fa-times text-white"></i>
                            </button>
                        </div>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><i className="fas fa-database"></i> Fonte dos Dados</h3>
                                <p className="text-sm text-gray-700">Os dados são extraídos do <strong>e-Gestor AB</strong> (Atenção Básica), sistema oficial do Ministério da Saúde para gestão da Atenção Primária à Saúde. O relatório utilizado é o <strong>"Relatório de Boas Práticas"</strong> disponível na visão por competência.</p>
                            </div>
                            
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><i className="fas fa-calculator"></i> Boas Práticas</h3>
                                <div className="bg-white p-3 rounded-lg mb-3">
                                    <p className="text-center font-mono text-lg text-green-700">Taxa = Somatório ÷ Total de Pacientes</p>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">A <strong>Boas Práticas</strong> representa a média de boas práticas/ações de saúde realizados por paciente. Quanto maior o valor, melhor o acompanhamento.</p>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                                    <li><strong>Somatório:</strong> Total de boas práticas realizadas para todos os pacientes</li>
                                    <li><strong>Total de Pacientes:</strong> Número de pacientes vinculados às equipes</li>
                                </ul>
                            </div>
                            
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><i className="fas fa-layer-group"></i> Boas Práticas (B1 a B{config?.indicatorCount || 11})</h3>
                                <p className="text-sm text-gray-700 mb-3">Cada boa prática representa uma ação de saúde específica que deve ser realizada. O percentual de cada boa prática é calculado:</p>
                                <div className="bg-white p-3 rounded-lg mb-3">
                                    <p className="text-center font-mono text-lg text-purple-700">% Boa Prática = (Realizados ÷ Total Pacientes) × 100</p>
                                </div>
                                {config && <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">{config.fullNames.map((name, i) => <p key={i}><strong>B{i+1}:</strong> {name}</p>)}</div>}
                            </div>
                            
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><i className="fas fa-chart-bar"></i> Classificação de Desempenho</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-blue-900 text-white p-3 rounded-lg text-center"><p className="font-bold">Ótimo</p><p className="text-sm">≥ 75</p></div>
                                    <div className="bg-lime-500 text-white p-3 rounded-lg text-center"><p className="font-bold">Bom</p><p className="text-sm">50 - 74,99</p></div>
                                    <div className="bg-amber-500 text-white p-3 rounded-lg text-center"><p className="font-bold">Suficiente</p><p className="text-sm">25 - 49,99</p></div>
                                    <div className="bg-red-500 text-white p-3 rounded-lg text-center"><p className="font-bold">Regular</p><p className="text-sm">0 - 24,99</p></div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><i className="fas fa-info-circle"></i> Observações</h3>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                                    <li>Os dados são agregados por <strong>equipe de saúde</strong> (identificadas pelo INE)</li>
                                    <li>A <strong>competência</strong> refere-se ao mês de referência dos dados</li>
                                    <li>Os filtros de região, município e competência afetam todos os cálculos exibidos</li>
                                    <li>O mapa de calor utiliza a mesma escala de cores da classificação de desempenho</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => { localStorage.setItem('gdiaps_topics', JSON.stringify(topics)); }, [topics]);
    useEffect(() => { user ? localStorage.setItem('gdiaps_user', JSON.stringify(user)) : localStorage.removeItem('gdiaps_user'); }, [user]);
    useEffect(() => { if (selectedState && STATE_CONFIG[selectedState]?.geojson) fetch(STATE_CONFIG[selectedState].geojson).then(r => r.json()).then(setGeoJson).catch(console.error); else setGeoJson(null); }, [selectedState]);
    useEffect(() => { if (indicatorType && selectedState) loadData(indicatorType, selectedState); }, [indicatorType, selectedState]);

    const loadData = (type, state) => {
        const cfg = INDICATOR_CONFIG[type]; if (!cfg?.csvFiles[state]) return;
        setLoading(true);
        const encoding = cfg.csvFiles[state].encoding || 'windows-1252';
        fetch(cfg.csvFiles[state].file).then(r => r.arrayBuffer()).then(buf => Papa.parse(new TextDecoder(encoding).decode(buf), { header: false, skipEmptyLines: true, delimiter: cfg.csvFiles[state].delimiter, quoteChar: '"' })).then(results => {
            const parseNum = v => { 
                if (!v) return 0; 
                let c = String(v).replace(/"/g, '').trim(); 
                
                // Detectar formato baseado no estado
                if (state === 'acre' || state === 'am') {
                    // Acre e Amazonas: vírgula é separador de milhar (formato americano: 1,007 = 1007)
                    c = c.replace(/,/g, '');
                } else {
                    // RN e outros: vírgula é separador decimal (formato brasileiro: 34,32 = 34.32)
                    // Se tem ponto E vírgula, ponto é milhar e vírgula é decimal
                    if (c.includes('.') && c.includes(',')) {
                        c = c.replace(/\./g, '').replace(',', '.');
                    } else if (c.includes(',')) {
                        c = c.replace(',', '.');
                    }
                }
                return Math.round(parseFloat(c)) || 0; 
            };
            // Debug: log primeira linha para verificar índices
            if (results.data.length > 1) {
                console.log('CSV Debug - Primeira linha de dados:', results.data[1]);
                console.log('CSV Debug - Número de colunas:', results.data[1]?.length);
                console.log('CSV Debug - Coluna 21 (somatorio):', results.data[1]?.[21]);
                console.log('CSV Debug - Coluna 22 (total):', results.data[1]?.[22]);
            }
            const data = results.data.slice(1).filter(r => r[0]?.trim()).map(r => {
                let regiao = r[7] || ''; if (regiao === 'Baxo Acre') regiao = 'Baixo Acre';
                // MSP tem colunas extras: Distrito (8) e OSS (9), deslocando os índices
                const isMSP = state === 'msp';
                const offset = isMSP ? 2 : 0;
                const base = { 
                    cnes: r[0], estabelecimento: r[1], municipio: fixMunicipioDisplay(r[6]), regiao, 
                    competencia: normalizeMonth(r[8 + offset]), ine: r[3], nomeEquipe: r[4] || '',
                    sigla: r[5] || '',
                    distrito: isMSP ? (r[8] || '') : '',
                    oss: isMSP ? (r[9] || '') : ''
                };
                if (type === 'gestantes') return { ...base, ind1: parseNum(r[10 + offset]), ind2: parseNum(r[11 + offset]), ind3: parseNum(r[12 + offset]), ind4: parseNum(r[13 + offset]), ind5: parseNum(r[14 + offset]), ind6: parseNum(r[15 + offset]), ind7: parseNum(r[16 + offset]), ind8: parseNum(r[17 + offset]), ind9: parseNum(r[18 + offset]), ind10: parseNum(r[19 + offset]), ind11: parseNum(r[20 + offset]), somatorio: parseNum(r[21 + offset]), totalPacientes: parseNum(r[22 + offset]) };
                if (type === 'has') return { ...base, ind1: parseNum(r[10 + offset]), ind2: parseNum(r[11 + offset]), ind3: parseNum(r[12 + offset]), ind4: parseNum(r[13 + offset]), somatorio: parseNum(r[14 + offset]), totalPacientes: parseNum(r[15 + offset]) };
                if (type === 'dm') return { ...base, ind1: parseNum(r[10 + offset]), ind2: parseNum(r[11 + offset]), ind3: parseNum(r[12 + offset]), ind4: parseNum(r[13 + offset]), ind5: parseNum(r[14 + offset]), ind6: parseNum(r[15 + offset]), somatorio: parseNum(r[16 + offset]), totalPacientes: parseNum(r[17 + offset]) };
                return base;
            });
            setRawData(data); setFilteredData(data); setFilters({ regiao: 'Todas', municipio: 'Todos', competencia: 'Todas', equipe: 'Todas', distrito: 'Todos', oss: 'Todas', unidade: 'Todas', sigla: 'Todas' }); setLoading(false);
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
        if (filters.equipe !== 'Todas') f = f.filter(r => r.nomeEquipe === filters.equipe);
        if (filters.distrito !== 'Todos') f = f.filter(r => r.distrito === filters.distrito);
        if (filters.oss !== 'Todas') f = f.filter(r => r.oss === filters.oss);
        if (filters.unidade !== 'Todas') f = f.filter(r => r.estabelecimento === filters.unidade);
        if (filters.sigla !== 'Todas') f = f.filter(r => r.sigla === filters.sigla);
        setFilteredData(f);
    }, [filters, rawData]);

    const getUnique = (field, data = rawData) => { let vals = [...new Set(data.map(r => r[field]).filter(Boolean))]; return field === 'competencia' ? vals.sort((a,b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b)) : vals.sort(); };
    const getRegioes = () => getUnique('regiao');
    const calcMetrics = (data = filteredData) => { if (!data.length) return { somatorio: 0, totalPacientes: 0, taxa: 0, equipes: 0, municipios: 0 }; const s = data.reduce((a,r) => a + r.somatorio, 0), t = data.reduce((a,r) => a + (r.totalPacientes||0), 0); return { somatorio: s, totalPacientes: t, taxa: t ? s/t : 0, equipes: new Set(data.map(r => r.ine)).size, municipios: new Set(data.map(r => r.municipio)).size }; };
    const calcIndicators = (data = filteredData) => { if (!data.length || !config) return []; const total = data.reduce((s,r) => s + (r.totalPacientes||0), 0); return Array.from({length: config.indicatorCount}, (_,i) => { const sum = data.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0); return { index: i+1, name: config.shortNames[i], fullName: config.fullNames[i], total: sum, pct: total ? (sum/total)*100 : 0 }; }); };
    const getHeatmap = (data = filteredData, indFilter = 'taxa') => { if (!config) return []; return [...new Set(data.map(r => r.municipio))].filter(Boolean).map(m => { const d = data.filter(r => r.municipio === m), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), sm = d.reduce((s,r) => s + r.somatorio, 0); let valor = 0; if (indFilter === 'taxa') { valor = tg ? sm/tg : 0; } else { const idx = parseInt(indFilter.replace('ind','')); const t = d.reduce((s,r) => s + (r['ind'+idx]||0), 0); valor = tg ? (t/tg)*100 : 0; } return { municipio: m, taxa: valor, tg, sm, comps: Array.from({length: config.indicatorCount}, (_,i) => { const t = d.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0); return tg ? (t/tg)*100 : 0; }) }; }).sort((a,b) => b.taxa - a.taxa); };
    const getTrend = (data = rawData) => { const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const sm = d.reduce((s,r) => s + r.somatorio, 0), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0); return { month: m, taxa: tg ? sm/tg : 0 }; }).filter(Boolean); };
    const getEstabelecimentos = (data = filteredData) => [...new Set(data.map(r => r.estabelecimento))].filter(Boolean).map(e => { const d = data.filter(r => r.estabelecimento === e), tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), sm = d.reduce((s,r) => s + r.somatorio, 0); return { estabelecimento: e, municipio: d[0]?.municipio, taxa: tg ? sm/tg : 0, tg }; }).sort((a,b) => b.taxa - a.taxa);
    const getComponentTrend = (idx, filterValue = null, baseData = null, filterField = 'regiao') => { let data = baseData || rawData; if (filterValue) data = data.filter(r => r[filterField] === filterValue); const months = getUnique('competencia', data); return MONTH_ORDER.filter(m => months.includes(m)).map(m => { const d = data.filter(r => r.competencia === m); if (!d.length) return null; const tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0), val = d.reduce((s,r) => s + (r['ind'+idx]||0), 0); return { month: m, pct: tg ? (val/tg)*100 : 0 }; }).filter(Boolean); };

    const [feedbacks, setFeedbacks] = useState(() => JSON.parse(localStorage.getItem('gdiaps_feedbacks')) || []);
    useEffect(() => { localStorage.setItem('gdiaps_feedbacks', JSON.stringify(feedbacks)); }, [feedbacks]);

    const ProfileDropdown = () => {
        const [dropdownOpen, setDropdownOpen] = useState(false);
        if (profileMinimized) {
            return (
                <div className="absolute top-4 right-4 z-50">
                    <button onClick={() => setProfileMinimized(false)} className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center" title="Expandir Perfil">
                        <i className="fas fa-user text-white"></i>
                    </button>
                </div>
            );
        }
        return (
            <div className="absolute top-4 right-4 z-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setProfileMinimized(true)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors shadow" title="Minimizar">
                        <i className="fas fa-minus text-gray-600 text-xs"></i>
                    </button>
                    {user ? (
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl px-4 py-2.5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 border border-white/20">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <i className="fas fa-user-nurse text-white text-lg"></i>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">{user.name}</p>
                                <p className="text-xs text-white/70">{user.cargo}</p>
                            </div>
                            <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'} text-white/70 ml-1 text-xs`}></i>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setAuthMode('login'); setAuthModal(true); }} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg text-indigo-600 font-medium text-sm">
                                <i className="fas fa-sign-in-alt"></i>
                                Entrar
                            </button>
                            <button onClick={() => { setAuthMode('register'); setAuthModal(true); }} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all text-white font-medium text-sm">
                                <i className="fas fa-user-plus"></i>
                                Cadastrar
                            </button>
                        </div>
                    )}
                </div>
                {dropdownOpen && user && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                                    <i className="fas fa-user-nurse text-white text-xl"></i>
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">{user.name}</p>
                                    <p className="text-sm text-white/80">{user.cargo}</p>
                                    {user.municipio && <p className="text-xs text-white/60 mt-1"><i className="fas fa-map-marker-alt mr-1"></i>{user.municipio}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            <button onClick={() => { setActiveView('profile'); setDropdownOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-3 group">
                                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                    <i className="fas fa-user-circle text-indigo-600"></i>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Meu Perfil</p>
                                    <p className="text-xs text-gray-500">Visualizar e editar dados</p>
                                </div>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <i className="fas fa-cog text-gray-600"></i>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Configurações</p>
                                    <p className="text-xs text-gray-500">Preferências do sistema</p>
                                </div>
                            </button>
                            <hr className="my-2 border-gray-100" />
                            <button onClick={() => { setUser(null); setDropdownOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-3 group">
                                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <i className="fas fa-sign-out-alt text-red-600"></i>
                                </div>
                                <div>
                                    <p className="font-medium text-red-600">Sair</p>
                                    <p className="text-xs text-red-400">Encerrar sessão</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const Sidebar = () => {
        const sidebarLabels = {
            home: 'Painel Principal',
            indicators: 'Análise Comparativa',
            components: 'Análise por Boa Prática',
            strategic: 'Visão Estratégica',
            goals: 'Metas e Objetivos',
            evaluation: 'Avaliação de Desempenho',
            map: 'Mapa Geográfico',
            dataCollection: 'Importar Dados',
            aiInsights: 'Insights com IA',
            profile: 'Meu Perfil'
        };
        const mainItems = [['home','fa-home'],['components','fa-layer-group'],['indicators','fa-chart-pie'],['strategic','fa-brain']];
        const planItems = [['goals','fa-bullseye'],['evaluation','fa-chart-bar']];
        const otherItems = [['map','fa-map-marked-alt'],['dataCollection','fa-database'],['profile','fa-user-circle']];
        const allItems = [...mainItems, ...planItems, ...otherItems];
        return (
            <div className="sidebar flex flex-col">
                <div className="pt-6 pb-4"><div className={'w-12 h-12 mx-auto rounded-xl flex items-center justify-center ' + (config?.bgColor || 'bg-blue-600')}><i className={'fas ' + (config?.icon || 'fa-heartbeat') + ' text-white text-xl'}></i></div></div>
                <div className="mt-2"><div className="sidebar-icon hover:bg-red-100" onClick={handleBackToLanding} title="Voltar ao Início"><i className="fas fa-arrow-left text-lg text-red-500"></i></div></div>
                <div className="mt-2 flex-1">{allItems.map(([v,i]) => <div key={v} className={'sidebar-icon ' + (activeView===v?'active':'')} onClick={() => setActiveView(v)} title={sidebarLabels[v]}><i className={'fas ' + i + ' text-lg'}></i></div>)}</div>
            </div>
        );
    };
    const FilterBar = ({ showInd, indFilter, setIndFilter }) => {
        const getFilteredBase = (exclude = []) => {
            let d = [...rawData];
            if (!exclude.includes('regiao') && filters.regiao !== 'Todas') d = d.filter(r => r.regiao === filters.regiao);
            if (!exclude.includes('municipio') && filters.municipio !== 'Todos') d = d.filter(r => r.municipio === filters.municipio);
            if (!exclude.includes('distrito') && filters.distrito !== 'Todos') d = d.filter(r => r.distrito === filters.distrito);
            if (!exclude.includes('oss') && filters.oss !== 'Todas') d = d.filter(r => r.oss === filters.oss);
            if (!exclude.includes('unidade') && filters.unidade !== 'Todas') d = d.filter(r => r.estabelecimento === filters.unidade);
            if (!exclude.includes('sigla') && filters.sigla !== 'Todas') d = d.filter(r => r.sigla === filters.sigla);
            return d;
        };
        const regiaoOpts = getUnique('regiao', getFilteredBase(['regiao']));
        const municipioOpts = getUnique('municipio', getFilteredBase(['municipio']));
        const distritoOpts = selectedState === 'msp' ? getUnique('distrito', getFilteredBase(['distrito'])) : [];
        const ossOpts = selectedState === 'msp' ? getUnique('oss', getFilteredBase(['oss'])) : [];
        const unidadeOpts = getUnique('estabelecimento', getFilteredBase(['unidade']));
        const equipeOpts = getUnique('nomeEquipe', getFilteredBase(['equipe']));
        const siglaOpts = getUnique('sigla', getFilteredBase(['sigla']));
        const selectClass = "px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer hover:border-gray-400";
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium"><i className="fas fa-filter"></i><span>Filtros:</span></div>
                    <select className={selectClass} value={filters.regiao} onChange={e => setFilters({...filters, regiao: e.target.value, municipio: 'Todos', unidade: 'Todas', equipe: 'Todas'})}><option value="Todas">Todas Regiões</option>{regiaoOpts.map(r => <option key={r}>{r}</option>)}</select>
                    <select className={selectClass} value={filters.municipio} onChange={e => setFilters({...filters, municipio: e.target.value, unidade: 'Todas', equipe: 'Todas'})}><option value="Todos">Todos Municípios</option>{municipioOpts.map(m => <option key={m}>{m}</option>)}</select>
                    {selectedState === 'msp' && <select className={selectClass} value={filters.distrito} onChange={e => setFilters({...filters, distrito: e.target.value, unidade: 'Todas', equipe: 'Todas'})}><option value="Todos">Todos Distritos</option>{distritoOpts.map(d => <option key={d}>{d}</option>)}</select>}
                    {selectedState === 'msp' && <select className={selectClass} value={filters.oss} onChange={e => setFilters({...filters, oss: e.target.value, unidade: 'Todas', equipe: 'Todas'})}><option value="Todas">Todas OSS</option>{ossOpts.map(o => <option key={o}>{o}</option>)}</select>}
                    <select className={selectClass} value={filters.unidade} onChange={e => setFilters({...filters, unidade: e.target.value, equipe: 'Todas'})}><option value="Todas">Todas Unidades</option>{unidadeOpts.map(u => <option key={u}>{u}</option>)}</select>
                    <select className={selectClass} value={filters.sigla} onChange={e => setFilters({...filters, sigla: e.target.value})}><option value="Todas">Todas Siglas</option>{siglaOpts.map(s => <option key={s}>{s}</option>)}</select>
                    <select className={selectClass} value={filters.equipe} onChange={e => setFilters({...filters, equipe: e.target.value})}><option value="Todas">Todas Equipes</option>{equipeOpts.map(eq => <option key={eq}>{eq}</option>)}</select>
                    <select className={selectClass} value={filters.competencia} onChange={e => setFilters({...filters, competencia: e.target.value})}><option value="Todas">Todas Competências</option>{getUnique('competencia').map(c => <option key={c}>{c}</option>)}</select>
                    {showInd && <select className={selectClass + " bg-indigo-50 border-indigo-300"} value={indFilter} onChange={e => setIndFilter(e.target.value)}><option value="taxa">Boas Práticas</option>{config && Array.from({length: config.indicatorCount}, (_,i) => <option key={i} value={'ind'+(i+1)}>C{i+1}</option>)}</select>}
                </div>
            </div>
        );
    };

    const HomeView = () => {
        const [chartMode, setChartMode] = useState('mensal'); // 'mensal', 'acumulado', 'quadrimestre'
        const m = calcMetrics(), ind = calcIndicators(), trend = getTrend(filteredData), hm = getHeatmap(), estabs = getEstabelecimentos();
        
        // Calcular dados acumulados
        const getAccumulatedTrend = () => {
            let accSom = 0, accTotal = 0;
            return trend.map(t => {
                const monthData = filteredData.filter(r => r.competencia === t.month);
                accSom += monthData.reduce((s,r) => s + r.somatorio, 0);
                accTotal += monthData.reduce((s,r) => s + (r.totalPacientes||0), 0);
                return { month: t.month, taxa: accTotal ? accSom/accTotal : 0 };
            });
        };
        
        // Calcular dados por quadrimestre
        const getQuadrimestreTrend = () => {
            const quadrimestres = [
                { label: '1º Quad', months: ['Janeiro', 'Fevereiro', 'Março', 'Abril'] },
                { label: '2º Quad', months: ['Maio', 'Junho', 'Julho', 'Agosto'] },
                { label: '3º Quad', months: ['Setembro', 'Outubro', 'Novembro', 'Dezembro'] }
            ];
            return quadrimestres.map(q => {
                const qData = filteredData.filter(r => q.months.includes(r.competencia));
                if (!qData.length) return null;
                const som = qData.reduce((s,r) => s + r.somatorio, 0);
                const total = qData.reduce((s,r) => s + (r.totalPacientes||0), 0);
                return { month: q.label, taxa: total ? som/total : 0 };
            }).filter(Boolean);
        };
        
        const chartData = chartMode === 'acumulado' ? getAccumulatedTrend() : chartMode === 'quadrimestre' ? getQuadrimestreTrend() : trend;
        const variation = trend.length >= 2 ? { diff: trend[trend.length-1].taxa - trend[0].taxa } : null;
        const cat = getCategoria(m.taxa);
        const accentColors = ['blue', 'green', 'purple', 'amber', 'rose'];
        
        const LineChart = ({ data }) => {
            const ref = useRef(null), chart = useRef(null);
            useEffect(() => {
                if (!ref.current || !data || data.length === 0) return;
                chart.current?.destroy();
                const ctx = ref.current.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 280);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
                const labels = data.map(d => d.month.slice(0, 3));
                const values = data.map(d => d.taxa);
                const maxVal = Math.max(...values);
                chart.current = new Chart(ref.current, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Taxa',
                            data: values,
                            borderColor: '#6366f1',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointBackgroundColor: '#6366f1',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 8,
                            pointHoverBackgroundColor: '#4f46e5',
                            pointHoverBorderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { top: 25, right: 10, bottom: 5, left: 10 } },
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 13 },
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: { label: ctx => ` Taxa: ${ctx.parsed.y.toFixed(2)}` }
                            },
                            datalabels: {
                                display: true,
                                color: '#4338ca',
                                font: { size: 11, weight: 'bold' },
                                anchor: 'end',
                                align: 'top',
                                offset: 6,
                                formatter: v => v ? v.toFixed(1) : ''
                            }
                        },
                        scales: {
                            y: { beginAtZero: true, max: maxVal * 1.15, grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false }, ticks: { font: { size: 11 }, color: '#64748b', padding: 8 } },
                            x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: '#64748b' } }
                        }
                    }
                });
                return () => chart.current?.destroy();
            }, [data]);
            return <canvas ref={ref}></canvas>;
        };
        
        const MetricCard = ({ icon, iconBg, title, value, subtitle, popupContent, accent }) => (
            <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 popup-card group overflow-hidden`}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-lg ${iconBg} text-white flex items-center justify-center shadow-md`}>
                            <i className={`fas ${icon} text-lg`}></i>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        {subtitle && <div className="mt-1">{subtitle}</div>}
                    </div>
                </div>
                {popupContent && <div className="popup-content"><div className="text-sm">{popupContent}</div></div>}
            </div>
        );
        return (<div className="animate-fadeIn"><div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl"><div className="absolute inset-0 bg-black/10"></div><div className="relative z-10"><h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3"><i className="fas fa-chart-line animate-pulse"></i>Painel de Indicadores</h1><p className="text-white/90 text-lg">{config?.title} - {STATE_CONFIG[selectedState]?.name}</p></div><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div></div><FilterBar /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <MetricCard icon="fa-chart-line" iconBg="bg-gradient-to-br from-blue-500 to-blue-600" title="Boas Práticas" value={m.taxa.toFixed(2)} accent="blue" subtitle={<span className="text-xs px-2 py-1 rounded-full text-white" style={{backgroundColor: cat.color}}>{cat.label}</span>} popupContent={<><p className="font-semibold text-blue-700 mb-1">Boas Práticas</p><p className="text-gray-600 text-xs mb-2">Média de componentes por paciente.</p><p className="text-xs bg-blue-50 p-2 rounded"><strong>Cálculo:</strong> Somatório ÷ Total Pacientes</p></>} />
            <MetricCard icon="fa-calculator" iconBg="bg-gradient-to-br from-green-500 to-green-600" title="Somatório" value={m.somatorio.toLocaleString()} accent="green" popupContent={<><p className="font-semibold text-green-700 mb-1">Somatório de Boas Práticas</p><p className="text-gray-600 text-xs mb-2">Total de boas práticas realizadas.</p><p className="text-xs bg-green-50 p-2 rounded"><strong>Fonte:</strong> e-Gestor AB</p></>} />
            <MetricCard icon="fa-users" iconBg="bg-gradient-to-br from-purple-500 to-purple-600" title="Total Pacientes" value={m.totalPacientes.toLocaleString()} accent="purple" popupContent={<><p className="font-semibold text-purple-700 mb-1">Total de Pacientes</p><p className="text-gray-600 text-xs mb-2">Pacientes vinculados às equipes.</p><p className="text-xs bg-purple-50 p-2 rounded"><strong>Fonte:</strong> e-Gestor AB</p></>} />
            <MetricCard icon="fa-user-md" iconBg="bg-gradient-to-br from-amber-500 to-amber-600" title="Equipes" value={m.equipes} accent="amber" popupContent={<><p className="font-semibold text-amber-700 mb-1">Equipes de Saúde</p><p className="text-gray-600 text-xs mb-2">Equipes (eSF, eAP) com dados.</p><p className="text-xs bg-amber-50 p-2 rounded"><strong>Cálculo:</strong> INEs únicos</p></>} />
            <MetricCard icon="fa-map-marker-alt" iconBg="bg-gradient-to-br from-rose-500 to-rose-600" title="Municípios" value={m.municipios} accent="rose" popupContent={<><p className="font-semibold text-rose-700 mb-1">Municípios Atendidos</p><p className="text-gray-600 text-xs mb-2">Municípios com dados registrados.</p><p className="text-xs bg-rose-50 p-2 rounded"><strong>Fonte:</strong> e-Gestor AB</p></>} />
        </div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="corp-card"><div className="corp-card-header flex items-center justify-between"><h3 className="corp-card-title"><i className="fas fa-chart-area"></i>{chartMode === 'mensal' ? 'Evolução Mensal' : chartMode === 'acumulado' ? 'Evolução Acumulada' : 'Por Quadrimestre'}</h3><div className="flex gap-1"><button onClick={() => setChartMode('mensal')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'mensal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Série mensal">Mensal</button><button onClick={() => setChartMode('acumulado')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'acumulado' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Valores acumulados">Acumulado</button><button onClick={() => setChartMode('quadrimestre')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'quadrimestre' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Agrupado por quadrimestre">Quadrimestre</button></div></div><div className="corp-card-body"><div style={{height:'280px'}}><LineChart data={chartData} /></div>{variation && chartMode === 'mensal' && <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between"><span className="text-sm text-gray-600">Variação no período:</span><span className={`font-bold ${variation.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>{variation.diff >= 0 ? '+' : ''}{variation.diff.toFixed(2)}</span></div>}</div></div><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-layer-group"></i>Componentes</h3></div><div className="corp-card-body"><div className="space-y-2 max-h-72 overflow-y-auto">{ind.map(i => { const c = getCategoria(i.pct); return <div key={i.index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group/item"><span className="w-8 h-8 rounded text-xs font-bold text-white flex items-center justify-center group-hover/item:scale-110 transition-transform" style={{backgroundColor: c.color}}>C{i.index}</span><div className="flex-1"><div className="flex justify-between text-sm"><span className="truncate" style={{maxWidth:'150px'}}>{i.name}</span><span className="font-bold">{i.pct.toFixed(1)}%</span></div><div className="indicator-bar"><div className="indicator-fill" style={{width: Math.min(i.pct,100)+'%', backgroundColor: c.color}}></div></div></div></div>; })}</div></div></div></div><div className="corp-card"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-th"></i>Matriz de Desempenho</h3></div><div className="corp-card-body"><HeatmapWithFilters data={hm} rawData={filteredData} indicatorCount={config?.indicatorCount || 11} shortNames={config?.shortNames || []} /></div></div><div className="corp-card mt-6"><div className="corp-card-header"><h3 className="corp-card-title"><i className="fas fa-table text-indigo-500"></i>Matriz Componentes x {selectedState === 'msp' ? 'Distritos' : 'Regiões'}</h3></div><div className="corp-card-body overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className="text-left p-2 bg-gray-100 rounded-l-lg font-semibold">{selectedState === 'msp' ? 'Distrito' : 'Região'}</th>{Array.from({length: config?.indicatorCount || 11}, (_,i) => <th key={i} className="p-2 bg-gray-100 text-center text-xs font-semibold">C{i+1}</th>)}<th className="p-2 bg-gray-100 rounded-r-lg text-center font-semibold">Taxa</th></tr></thead><tbody>{(selectedState === 'msp' ? getUnique('distrito') : getRegioes()).map(item => { const dados = rawData.filter(r => selectedState === 'msp' ? r.distrito === item : r.regiao === item); const totalPac = dados.reduce((s,r) => s + (r.totalPacientes||0), 0); const soma = dados.reduce((s,r) => s + r.somatorio, 0); const taxa = totalPac > 0 ? soma/totalPac : 0; const cat = getCategoriaTaxa(taxa); const comps = Array.from({length: config?.indicatorCount || 11}, (_,i) => { const sum = dados.reduce((s,r) => s + (r['ind'+(i+1)]||0), 0); return totalPac > 0 ? (sum/totalPac)*100 : 0; }); return <tr key={item} className="border-b border-gray-100 hover:bg-gray-50"><td className="p-2 font-medium text-gray-800">{item}</td>{comps.map((c,i) => { const catC = getCategoriaComponente(c); return <td key={i} className="p-1 text-center"><span className="inline-block px-2 py-1 rounded text-xs text-white font-semibold" style={{backgroundColor: catC.color}}>{c.toFixed(0)}%</span></td>; })}<td className="p-2 text-center font-bold" style={{color: cat.color}}>{taxa.toFixed(2)}</td></tr>; })}</tbody></table></div></div></div>);
    };

    const IndicatorsView = () => {
        const [indFilter, setIndFilter] = useState('taxa');
        const [compareMode, setCompareMode] = useState('regiao'); // 'regiao', 'municipio', 'unidade', 'equipe', 'distrito', 'oss'
        const ind = calcIndicators();
        // Usar filteredData e indFilter para calcular heatmap
        const hm = getHeatmap(filteredData, indFilter);
        
        // Função genérica para calcular valores por agrupamento
        const calcByGroup = (field, labelField) => {
            const groups = [...new Set(filteredData.map(r => r[field]).filter(Boolean))];
            return groups.map(g => {
                const d = filteredData.filter(x => x[field] === g);
                const t = d.reduce((a,x) => a + (x.totalPacientes||0), 0);
                let valor = 0;
                if (indFilter === 'taxa') {
                    const s = d.reduce((a,x) => a + x.somatorio, 0);
                    valor = t ? s/t : 0;
                } else {
                    const idx = parseInt(indFilter.replace('ind',''));
                    const sum = d.reduce((a,x) => a + (x['ind'+idx]||0), 0);
                    valor = t ? (sum/t)*100 : 0;
                }
                return { label: g, taxa: valor, total: t, equipes: new Set(d.map(x => x.ine)).size };
            }).sort((a,b) => b.taxa - a.taxa);
        };
        
        // Calcular dados para cada modo de comparação
        const regioes = calcByGroup('regiao');
        const municipios = calcByGroup('municipio');
        const unidades = calcByGroup('estabelecimento');
        const equipes = calcByGroup('nomeEquipe');
        const distritos = selectedState === 'msp' ? calcByGroup('distrito') : [];
        const ossList = selectedState === 'msp' ? calcByGroup('oss') : [];
        
        // Selecionar dados baseado no modo
        const getCompareData = () => {
            switch(compareMode) {
                case 'municipio': return municipios.slice(0, 20);
                case 'unidade': return unidades.slice(0, 20);
                case 'equipe': return equipes.slice(0, 20);
                case 'distrito': return distritos.slice(0, 20);
                case 'oss': return ossList.slice(0, 20);
                default: return regioes;
            }
        };
        const compareData = getCompareData();
        const compareModeLabels = { regiao: 'Regiões', municipio: 'Municípios', unidade: 'Unidades', equipe: 'Equipes', distrito: 'Distritos', oss: 'OSS' };
        
        // Calcular valores por estabelecimento baseado no filtro
        const estabs = [...new Set(filteredData.map(r => r.estabelecimento))].filter(Boolean).map(e => { 
            const d = filteredData.filter(r => r.estabelecimento === e);
            const tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0);
            let valor = 0;
            if (indFilter === 'taxa') {
                const sm = d.reduce((s,r) => s + r.somatorio, 0);
                valor = tg ? sm/tg : 0;
            } else {
                const idx = parseInt(indFilter.replace('ind',''));
                const sum = d.reduce((s,r) => s + (r['ind'+idx]||0), 0);
                valor = tg ? (sum/tg)*100 : 0;
            }
            return { estabelecimento: e, municipio: d[0]?.municipio, taxa: valor, tg }; 
        }).sort((a,b) => b.taxa - a.taxa);
        const getCateg = (val) => indFilter === 'taxa' ? getCategoriaTaxa(val) : getCategoriaComponente(val);
        const formatVal = (val) => indFilter === 'taxa' ? val.toFixed(2) : val.toFixed(1) + '%';
        const CompareChart = () => { const ref = useRef(null), chart = useRef(null); useEffect(() => { if (!ref.current) return; chart.current?.destroy(); const labels = compareData.map(r => r.label.length > 25 ? r.label.slice(0,25)+'...' : r.label); chart.current = new Chart(ref.current, { type: 'bar', data: { labels, datasets: [{ data: compareData.map(r => r.taxa), backgroundColor: compareData.map(r => getTaxaColor(r.taxa)), borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: compareData.length > 10 ? 'y' : 'x', plugins: { legend: { display: false }, tooltip: { callbacks: { title: (ctx) => compareData[ctx[0].dataIndex]?.label } } }, scales: { y: { ticks: { callback: v => indFilter === 'taxa' ? v.toFixed(1) : v.toFixed(0) + '%' } } } } }); return () => chart.current?.destroy(); }, [compareData, indFilter, compareMode]); return <canvas ref={ref}></canvas>; };
        return (<div className="animate-fadeIn"><div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 shadow-2xl"><div className="absolute inset-0 bg-black/10"></div><div className="relative z-10"><h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3"><i className="fas fa-balance-scale animate-pulse"></i>Análise Comparativa</h1><p className="text-white/90 text-lg">Compare regiões, municípios e unidades de saúde</p></div><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div></div><FilterBar showInd indFilter={indFilter} setIndFilter={setIndFilter} /><div className="card p-6 mb-6"><div className="flex items-center justify-between mb-4"><h3 className="font-bold"><i className="fas fa-balance-scale mr-2 text-blue-500"></i>Comparação por {compareModeLabels[compareMode]} {indFilter !== 'taxa' && <span className="text-sm font-normal text-gray-500">({config?.shortNames[parseInt(indFilter.replace('ind',''))-1]})</span>}</h3><div className="flex gap-1 flex-wrap">{['regiao', 'municipio', 'unidade', 'equipe'].map(mode => <button key={mode} onClick={() => setCompareMode(mode)} className={`px-3 py-1 text-xs rounded-lg transition-all ${compareMode === mode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{compareModeLabels[mode]}</button>)}{selectedState === 'msp' && ['distrito', 'oss'].map(mode => <button key={mode} onClick={() => setCompareMode(mode)} className={`px-3 py-1 text-xs rounded-lg transition-all ${compareMode === mode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>{compareModeLabels[mode]}</button>)}</div></div><div style={{height: compareData.length > 10 ? '500px' : '300px'}}><CompareChart /></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="card p-6"><h3 className="font-bold mb-4">Ranking Municípios</h3><div className="space-y-2 max-h-96 overflow-y-auto">{hm.slice(0,15).map((m,i) => { const c = getCateg(m.taxa); return <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"><span className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>{i+1}</span><div className="flex-1"><p className="font-medium">{m.municipio}</p><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div><span className="font-bold" style={{color: c.color}}>{formatVal(m.taxa)}</span></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4">Ranking Unidades</h3><div className="space-y-2 max-h-96 overflow-y-auto">{estabs.slice(0,15).map((e,i) => { const c = getCateg(e.taxa); return <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"><span className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{backgroundColor: c.color}}>{i+1}</span><div className="flex-1 min-w-0"><p className="font-medium truncate">{e.estabelecimento}</p><p className="text-xs text-gray-500">{e.municipio}</p></div><span className="font-bold" style={{color: c.color}}>{formatVal(e.taxa)}</span></div>; })}</div></div></div></div>);
    };

    const ComponentsView = () => {
        const [selComp, setSelComp] = useState(1), [selRegioes, setSelRegioes] = useState([]);
        const [chartMode, setChartMode] = useState('mensal'); // 'mensal', 'acumulado', 'quadrimestre'
        const [filterMode, setFilterMode] = useState(selectedState === 'msp' ? 'distrito' : 'regiao'); // 'regiao', 'distrito', 'oss'
        const ind = calcIndicators(), selInd = ind.find(i => i.index === selComp);
        const filterOptions = filterMode === 'distrito' ? getUnique('distrito') : filterMode === 'oss' ? getUnique('oss') : getRegioes();
        const toggleReg = r => selRegioes.includes(r) ? setSelRegioes(selRegioes.filter(x => x !== r)) : selRegioes.length < 5 && setSelRegioes([...selRegioes, r]);
        // Usar filteredData para respeitar os filtros de região/município/competência
        const compTrend = getComponentTrend(selComp, null, filteredData);
        const lastPct = compTrend.length > 0 ? compTrend[compTrend.length - 1].pct : 0;
        const lastMonth = compTrend.length > 0 ? compTrend[compTrend.length - 1].month : '';
        const lastCat = getCategoria(lastPct);
        
        // Calcular dados acumulados para boa prática
        const getAccumulatedCompTrend = (data = compTrend) => {
            let accVal = 0, accTotal = 0;
            return data.map(t => {
                const monthData = filteredData.filter(r => r.competencia === t.month);
                accVal += monthData.reduce((s,r) => s + (r['ind'+selComp]||0), 0);
                accTotal += monthData.reduce((s,r) => s + (r.totalPacientes||0), 0);
                return { month: t.month, pct: accTotal ? (accVal/accTotal)*100 : 0 };
            });
        };
        
        // Calcular dados por quadrimestre para boa prática
        const getQuadCompTrend = () => {
            const quadrimestres = [
                { label: '1º Quad', months: ['Janeiro', 'Fevereiro', 'Março', 'Abril'] },
                { label: '2º Quad', months: ['Maio', 'Junho', 'Julho', 'Agosto'] },
                { label: '3º Quad', months: ['Setembro', 'Outubro', 'Novembro', 'Dezembro'] }
            ];
            return quadrimestres.map(q => {
                const qData = filteredData.filter(r => q.months.includes(r.competencia));
                if (!qData.length) return null;
                const val = qData.reduce((s,r) => s + (r['ind'+selComp]||0), 0);
                const total = qData.reduce((s,r) => s + (r.totalPacientes||0), 0);
                return { month: q.label, pct: total ? (val/total)*100 : 0 };
            }).filter(Boolean);
        };
        
        const chartData = chartMode === 'acumulado' ? getAccumulatedCompTrend() : chartMode === 'quadrimestre' ? getQuadCompTrend() : compTrend;
        
        const MultiChart = () => { const ref = useRef(null), chart = useRef(null); useEffect(() => { if (!ref.current) return; chart.current?.destroy(); const ctx = ref.current.getContext('2d'); const gradient = ctx.createLinearGradient(0, 0, 0, 350); gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)'); gradient.addColorStop(1, 'rgba(37, 99, 235, 0.02)'); const labels = chartData.map(d => d.month.slice(0,3)); const mainData = chartData.map(d => d.pct); const trendLine = chartData.length >= 2 ? (() => { const n = chartData.length; const xM = (n-1)/2; const yM = mainData.reduce((s,v) => s+v, 0)/n; let num=0, den=0; mainData.forEach((v,j) => { num += (j-xM)*(v-yM); den += (j-xM)*(j-xM); }); const slope = den ? num/den : 0; const int = yM - slope*xM; return mainData.map((_, i) => int + slope*i); })() : []; const filterFieldMap = { distrito: 'distrito', oss: 'oss', regiao: 'regiao' }; const datasets = selRegioes.length && chartMode === 'mensal' ? selRegioes.map((r,i) => { const t = getComponentTrend(selComp, r, filteredData, filterFieldMap[filterMode] || 'regiao'); const clr = COLORS[i%COLORS.length]; return { label: r, data: labels.map((l,idx) => { const m = chartData[idx]?.month; return t.find(x => x.month === m)?.pct ?? null; }), borderColor: clr, backgroundColor: 'transparent', borderWidth: 2.5, tension: 0.4, spanGaps: true, pointRadius: 4, pointBackgroundColor: clr, pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 6 }; }) : [{ label: chartMode === 'mensal' ? 'Mensal' : chartMode === 'acumulado' ? 'Acumulado' : 'Quadrimestre', data: mainData, borderColor: '#2563eb', backgroundColor: gradient, fill: true, borderWidth: 3, tension: 0.4, spanGaps: true, pointRadius: 5, pointBackgroundColor: '#2563eb', pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 8, pointHoverBackgroundColor: '#1d4ed8', pointHoverBorderWidth: 3 }, { label: 'Tendência', data: trendLine, borderColor: '#ef4444', backgroundColor: 'transparent', borderWidth: 2, borderDash: [6, 4], tension: 0, pointRadius: 0, spanGaps: true }]; chart.current = new Chart(ref.current, { type: 'line', data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8, displayColors: true, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } }, datalabels: { display: ctx => ctx.datasetIndex === 0, color: '#1e40af', font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, formatter: v => v ? v.toFixed(1) + '%' : '' } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false }, ticks: { callback: v => v+'%', font: { size: 11 }, color: '#64748b', padding: 8 } }, x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: '#64748b' } } } } }); return () => chart.current?.destroy(); }, [selComp, selRegioes, chartData, chartMode]); return <canvas ref={ref}></canvas>; };
        const pred = () => { const t = compTrend; if (t.length < 3) return null; const n = t.length, xM = (n-1)/2, yM = t.reduce((s,x) => s+x.pct, 0)/n; let num=0, den=0; t.forEach((p,i) => { num += (i-xM)*(p.pct-yM); den += (i-xM)*(i-xM); }); const slope = den ? num/den : 0, int = yM - slope*xM; const currentExpected = Math.min(100, Math.max(0, int + slope*(n-1))); const nextExpected = Math.min(100, Math.max(0, int + slope*n)); return { current: currentExpected, next: nextExpected, trend: slope > 0.5 ? 'crescente' : slope < -0.5 ? 'decrescente' : 'estável', slope: slope.toFixed(2) }; };
        const prediction = pred();
        const getTrendAnalysis = () => { if (!prediction || !lastPct) return null; const currentRounded = Math.round(lastPct * 10) / 10; const expectedRounded = Math.round(prediction.current * 10) / 10; const diff = currentRounded - expectedRounded; const absDiff = Math.abs(diff).toFixed(1); if (diff === 0) return { status: 'neutro', icon: 'fa-equals', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', message: `O valor atual (${lastPct.toFixed(1)}%) é igual à predição esperada para este mês (${prediction.current.toFixed(1)}%), indicando que os resultados seguem exatamente a tendência esperada.` }; if (diff > 0) return { status: 'acima', icon: 'fa-arrow-up', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', message: `O valor atual (${lastPct.toFixed(1)}%) está ${absDiff}% acima da predição esperada para este mês (${prediction.current.toFixed(1)}%), indicando que os resultados ultrapassaram a tendência esperada. Desempenho superior ao previsto!` }; return { status: 'abaixo', icon: 'fa-arrow-down', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', message: `O valor atual (${lastPct.toFixed(1)}%) está ${absDiff}% abaixo da predição esperada para este mês (${prediction.current.toFixed(1)}%), indicando que os resultados não atingiram a tendência esperada. Atenção necessária.` }; };
        const trendAnalysis = getTrendAnalysis();
        return (<div className="animate-fadeIn"><div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 shadow-2xl"><div className="absolute inset-0 bg-black/10"></div><div className="relative z-10"><h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3"><i className="fas fa-layer-group animate-pulse"></i>Análise por Boa Prática</h1><p className="text-white/90 text-lg">Explore cada boa prática individualmente e sua evolução</p></div><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div></div><FilterBar /><div className="card p-6 mb-6"><h3 className="font-bold mb-4">Selecione a Boa Prática</h3><div className="flex flex-wrap gap-2">{ind.map(i => <button key={i.index} onClick={() => setSelComp(i.index)} className={'px-4 py-2 rounded-lg font-semibold ' + (selComp === i.index ? 'bg-blue-600 text-white' : 'bg-gray-100')}>{i.name}</button>)}</div></div><div className="card p-6 mb-6"><div className="flex items-center justify-between mb-4"><h3 className="font-bold">Filtrar por {filterMode === 'distrito' ? 'Distritos' : filterMode === 'oss' ? 'OSS' : 'Regiões'} (máx 5)</h3>{selectedState === 'msp' && <div className="flex gap-1"><button onClick={() => { setFilterMode('distrito'); setSelRegioes([]); }} className={`px-3 py-1 text-xs rounded-lg ${filterMode === 'distrito' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>Distrito</button><button onClick={() => { setFilterMode('oss'); setSelRegioes([]); }} className={`px-3 py-1 text-xs rounded-lg ${filterMode === 'oss' ? 'bg-pink-500 text-white' : 'bg-gray-100'}`}>OSS</button></div>}</div><div className="flex flex-wrap gap-2">{filterOptions.map((r,i) => <button key={r} onClick={() => toggleReg(r)} className={'px-3 py-1 rounded-full text-sm font-medium border-2 ' + (selRegioes.includes(r) ? 'text-white border-transparent' : 'bg-white border-gray-300')} style={selRegioes.includes(r) ? {backgroundColor: COLORS[selRegioes.indexOf(r)%COLORS.length]} : {}}>{r}</button>)}{selRegioes.length > 0 && <button onClick={() => setSelRegioes([])} className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-600">Limpar</button>}</div></div>{selInd && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 card p-6"><div className="flex items-center justify-between mb-2"><h3 className="font-bold">{chartMode === 'mensal' ? 'Evolução Mensal' : chartMode === 'acumulado' ? 'Evolução Acumulada' : 'Por Quadrimestre'} - {selInd.name}</h3><div className="flex gap-1"><button onClick={() => setChartMode('mensal')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'mensal' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Mensal</button><button onClick={() => setChartMode('acumulado')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'acumulado' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Acumulado</button><button onClick={() => setChartMode('quadrimestre')} className={`px-3 py-1 text-xs rounded-lg transition-all ${chartMode === 'quadrimestre' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Quadrimestre</button></div></div><p className="text-sm text-gray-500 mb-4">{selInd.fullName}</p><div style={{height:'350px'}}><MultiChart /></div>{trendAnalysis && <div className={`mt-4 p-4 rounded-xl border ${trendAnalysis.bgColor} ${trendAnalysis.borderColor}`}><div className="flex items-start gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${trendAnalysis.status === 'acima' ? 'bg-green-500' : trendAnalysis.status === 'abaixo' ? 'bg-orange-500' : 'bg-gray-500'}`}><i className={`fas ${trendAnalysis.icon} text-white`}></i></div><div><h4 className={`font-bold ${trendAnalysis.color} mb-1`}>Análise de Tendência</h4><p className="text-sm text-gray-700">{trendAnalysis.message}</p></div></div></div>}</div><div className="space-y-4"><div className="card p-6"><h3 className="font-bold mb-4">Detalhes</h3><div className="p-3 bg-blue-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Valor Atual ({lastMonth})</p><p className="text-2xl font-bold" style={{color: lastCat.color}}>{lastPct.toFixed(1)}%</p><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: lastCat.color}}>{lastCat.label}</span></div><div className="p-3 bg-gray-50 rounded-xl"><p className="text-sm text-gray-500">Total Realizados</p><p className="text-xl font-bold">{selInd.total.toLocaleString()}</p></div></div>{prediction && <div className="card p-6"><h3 className="font-bold mb-4 text-purple-600"><i className="fas fa-chart-line mr-2"></i>Predição</h3><div className="p-3 bg-blue-50 rounded-xl mb-3 border border-blue-200"><p className="text-sm text-gray-500">Esperado Mês Atual</p><p className="text-xl font-bold text-blue-600">{prediction.current.toFixed(1)}%</p></div><div className="p-3 bg-purple-50 rounded-xl mb-3"><p className="text-sm text-gray-500">Próximo Mês</p><p className="text-xl font-bold text-purple-600">{prediction.next.toFixed(1)}%</p></div><p className="text-sm mb-2">Tendência: <span className="font-bold">{prediction.trend}</span></p><p className="text-xs text-gray-500">Método: Regressão linear ({compTrend.length} meses). Coef: {prediction.slope}%/mês</p></div>}</div></div>}</div>);
    };

    const StrategicView = () => {
        const [indFilter, setIndFilter] = useState('taxa');
        const m = calcMetrics(), ind = calcIndicators(), trend = getTrend(filteredData), hm = getHeatmap(filteredData, indFilter);
        const worstMun = [...hm].sort((a,b) => a.taxa - b.taxa).slice(0,5), bestMun = hm.slice(0,5);
        const getCurrentValue = () => { if (indFilter === 'taxa') return m.taxa; const idx = parseInt(indFilter.replace('ind','')); const indData = ind.find(i => i.index === idx); return indData ? indData.pct : 0; };
        const currentValue = getCurrentValue();
        const getCateg = (val) => indFilter === 'taxa' ? getCategoriaTaxa(val) : getCategoriaComponente(val);
        const formatVal = (val) => indFilter === 'taxa' ? val.toFixed(2) : val.toFixed(1) + '%';
        const cat = getCateg(currentValue);
        const getIndicatorLabel = () => indFilter === 'taxa' ? 'Boas Práticas' : `C${indFilter.replace('ind','')}`;
        const getFilteredTrend = () => { if (indFilter === 'taxa') return trend; const idx = parseInt(indFilter.replace('ind','')); const months = getUnique('competencia', filteredData); return MONTH_ORDER.filter(mo => months.includes(mo)).map(month => { const d = filteredData.filter(r => r.competencia === month); if (!d.length) return null; const tg = d.reduce((s,r) => s + (r.totalPacientes||0), 0); const val = d.reduce((s,r) => s + (r['ind'+idx]||0), 0); return { month, taxa: tg ? (val/tg)*100 : 0 }; }).filter(Boolean); };
        const filteredTrend = getFilteredTrend();
        const pred = () => { if (filteredTrend.length < 3) return null; const n = filteredTrend.length, xM = (n-1)/2, yM = filteredTrend.reduce((s,t) => s+t.taxa, 0)/n; let num=0, den=0; filteredTrend.forEach((p,i) => { num += (i-xM)*(p.taxa-yM); den += (i-xM)*(i-xM); }); const slope = den ? num/den : 0, int = yM - slope*xM; return [1,2,3].map(i => ({ label: 'Mês +'+i, val: Math.max(0, Math.min(100, int + slope*(n+i-1))) })); };
        const prediction = pred();
        return (<div className="animate-fadeIn"><div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 shadow-2xl"><div className="absolute inset-0 bg-black/10"></div><div className="relative z-10"><h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3"><i className="fas fa-brain animate-pulse"></i>Análise Estratégica</h1><p className="text-white/90 text-lg">Visão executiva para tomada de decisões</p></div><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div></div><FilterBar showInd indFilter={indFilter} setIndFilter={setIndFilter} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4 text-blue-600"><i className="fas fa-bullseye mr-2"></i>Resumo Executivo</h3><div className="p-4 bg-blue-50 rounded-xl mb-3"><p className="text-sm text-gray-500">{getIndicatorLabel()} Atual</p><p className="text-3xl font-bold" style={{color: cat.color}}>{formatVal(currentValue)}</p><span className="text-sm px-3 py-1 rounded-full text-white" style={{backgroundColor: cat.color}}>{cat.label}</span></div><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Municípios</p><p className="text-lg font-bold">{m.municipios}</p></div><div className="p-3 bg-gray-50 rounded-xl text-center"><p className="text-xs text-gray-500">Equipes</p><p className="text-lg font-bold">{m.equipes}</p></div></div></div><div className="card p-6"><h3 className="font-bold mb-4 text-purple-600"><i className="fas fa-chart-line mr-2"></i>Projeção {getIndicatorLabel()}</h3>{prediction ? <div className="space-y-3">{prediction.map((p,i) => { const c = getCateg(p.val); return <div key={i} className="flex justify-between items-center p-3 bg-purple-50 rounded-xl"><span>{p.label}</span><div><span className="text-xl font-bold" style={{color: c.color}}>{formatVal(p.val)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div> : <p className="text-gray-400">Dados insuficientes</p>}</div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"><div className="card p-6"><h3 className="font-bold mb-4 text-red-600"><i className="fas fa-exclamation-circle mr-2"></i>Municípios Críticos ({getIndicatorLabel()})</h3><div className="space-y-2">{worstMun.map((mu,i) => { const c = getCateg(mu.taxa); return <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl"><span className="font-medium">{mu.municipio}</span><div><span className="font-bold" style={{color: c.color}}>{formatVal(mu.taxa)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4 text-green-600"><i className="fas fa-star mr-2"></i>Municípios Referência ({getIndicatorLabel()})</h3><div className="space-y-2">{bestMun.map((mu,i) => { const c = getCateg(mu.taxa); return <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-xl"><span className="font-medium">{mu.municipio}</span><div><span className="font-bold" style={{color: c.color}}>{formatVal(mu.taxa)}</span><span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div></div></div></div>);
    };

    const MiniMap = ({ monthData, indFilter }) => {
        const mapRef = useRef(null), mapInstance = useRef(null);
        const hm = getHeatmap(monthData, indFilter);
        const isMunicipio = STATE_CONFIG[selectedState]?.isMunicipio;
        const municipioCode = STATE_CONFIG[selectedState]?.municipioCode;
        useEffect(() => {
            if (!mapRef.current || !geoJson) return;
            if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
            const coords = selectedState === 'acre' ? [-9, -70] : selectedState === 'am' ? [-4, -65] : selectedState === 'mt' ? [-13, -56] : selectedState === 'msp' ? [-23.55, -46.63] : [-5.8, -36.5];
            const zoom = selectedState === 'acre' ? 5 : selectedState === 'am' ? 5 : selectedState === 'mt' ? 5 : selectedState === 'msp' ? 9 : 6;
            const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: false, doubleClickZoom: false }).setView(coords, zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.geoJSON(geoJson, { filter: f => isMunicipio ? f.properties.id === municipioCode : true, style: f => { const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); return { fillColor: d ? getTaxaColor(d.taxa) : '#ccc', weight: isMunicipio ? 2 : 0.5, color: isMunicipio ? '#4f46e5' : 'white', fillOpacity: 0.8 }; } }).addTo(map);
            mapInstance.current = map;
            return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
        }, [geoJson, hm, indFilter, isMunicipio, municipioCode]);
        return <div ref={mapRef} className="mosaic-map" style={{height:'280px', width:'100%', borderRadius:'12px'}}></div>;
    };

    const MapView = () => {
        const [indFilter, setIndFilter] = useState('taxa');
        const mapRef = useRef(null), mapInstance = useRef(null);
        const hm = getHeatmap(filteredData, indFilter);
        const isMunicipio = STATE_CONFIG[selectedState]?.isMunicipio;
        const municipioCode = STATE_CONFIG[selectedState]?.municipioCode;
        const regiaoStats = getRegioes().map(r => { const d = filteredData.filter(x => x.regiao === r); let valor = 0; if (indFilter === 'taxa') { const s = d.reduce((a,x) => a + x.somatorio, 0), t = d.reduce((a,x) => a + (x.totalPacientes||0), 0); valor = t ? s/t : 0; } else { const idx = parseInt(indFilter.replace('ind','')); const t = d.reduce((a,x) => a + (x.totalPacientes||0), 0), val = d.reduce((a,x) => a + (x['ind'+idx]||0), 0); valor = t ? (val/t)*100 : 0; } return { regiao: r, taxa: valor, municipios: new Set(d.map(x => x.municipio)).size }; }).sort((a,b) => b.taxa - a.taxa);
        const clusters = { otimo: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Ótimo').length, bom: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Bom').length, suficiente: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Suficiente').length, regular: hm.filter(m => (indFilter === 'taxa' ? getCategoriaTaxa(m.taxa) : getCategoriaComponente(m.taxa)).label === 'Regular').length };
        
        useEffect(() => { if (!mapRef.current || !geoJson) return; if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } const coords = selectedState === 'acre' ? [-9,-70] : selectedState === 'am' ? [-4,-65] : selectedState === 'mt' ? [-13,-56] : selectedState === 'msp' ? [-23.55,-46.63] : [-5.8,-36.5]; const zoom = selectedState === 'am' ? 5 : selectedState === 'mt' ? 5 : selectedState === 'msp' ? 10 : 7; const map = L.map(mapRef.current).setView(coords, zoom); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map); L.geoJSON(geoJson, { filter: f => isMunicipio ? f.properties.id === municipioCode : true, style: f => { const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); return { fillColor: d ? getTaxaColor(d.taxa) : '#ccc', weight: isMunicipio ? 3 : 1, color: isMunicipio ? '#4f46e5' : 'white', fillOpacity: 0.7 }; }, onEachFeature: (f, l) => { const d = hm.find(m => normalizeMunicipioForGeoJSON(m.municipio) === normalizeMunicipioForGeoJSON(f.properties.name)); const c = d ? (indFilter === 'taxa' ? getCategoriaTaxa(d.taxa) : getCategoriaComponente(d.taxa)) : null; const label = indFilter === 'taxa' ? 'Taxa' : (config?.shortNames[parseInt(indFilter.replace('ind',''))-1] || 'Componente'); l.bindPopup('<b>'+f.properties.name+'</b><br>'+label+': '+(d ? d.taxa.toFixed(2)+(indFilter === 'taxa' ? '' : '%') : 'N/A')+(c ? '<br>'+c.label : '')); } }).addTo(map); mapInstance.current = map; return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } }; }, [geoJson, filteredData, filters, indFilter, isMunicipio, municipioCode]);
        return (<div className="animate-fadeIn"><div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 shadow-2xl"><div className="absolute inset-0 bg-black/10"></div><div className="relative z-10"><h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3"><i className="fas fa-map-marked-alt animate-pulse"></i>Análise Espacial</h1><p className="text-white/90 text-lg">Visualização geográfica dos indicadores</p></div><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div><div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div></div><FilterBar showInd indFilter={indFilter} setIndFilter={setIndFilter} /><div className="grid grid-cols-4 gap-4 mb-6"><div className="card p-4 popup-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center"><i className="fas fa-trophy text-white"></i></div><div><p className="text-xs text-gray-500">Ótimo</p><p className="text-2xl font-bold text-blue-900">{clusters.otimo}</p></div></div><div className="popup-content"><p className="font-semibold text-blue-900 mb-1">Municípios com Desempenho Ótimo</p><p className="text-sm text-gray-600">{indFilter === 'taxa' ? 'Taxa de 75% a 100%' : 'Componente de 75% a 100%'} - Excelente cobertura</p></div></div><div className="card p-4 popup-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center"><i className="fas fa-thumbs-up text-white"></i></div><div><p className="text-xs text-gray-500">Bom</p><p className="text-2xl font-bold text-lime-600">{clusters.bom}</p></div></div><div className="popup-content"><p className="font-semibold text-lime-600 mb-1">Municípios com Desempenho Bom</p><p className="text-sm text-gray-600">{indFilter === 'taxa' ? 'Taxa de 50% a 74,99%' : 'Componente de 50% a 74,99%'} - Boa cobertura</p></div></div><div className="card p-4 popup-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center"><i className="fas fa-exclamation text-white"></i></div><div><p className="text-xs text-gray-500">Suficiente</p><p className="text-2xl font-bold text-amber-600">{clusters.suficiente}</p></div></div><div className="popup-content"><p className="font-semibold text-amber-600 mb-1">Municípios com Desempenho Suficiente</p><p className="text-sm text-gray-600">{indFilter === 'taxa' ? 'Taxa de 25% a 49,99%' : 'Componente de 25% a 49,99%'} - Necessita melhorias</p></div></div><div className="card p-4 popup-card"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center"><i className="fas fa-exclamation-triangle text-white"></i></div><div><p className="text-xs text-gray-500">Regular</p><p className="text-2xl font-bold text-red-600">{clusters.regular}</p></div></div><div className="popup-content"><p className="font-semibold text-red-600 mb-1">Municípios com Desempenho Regular</p><p className="text-sm text-gray-600">{indFilter === 'taxa' ? 'Taxa de 0% a 24,99%' : 'Componente de 0% a 24,99%'} - Atenção prioritária</p></div></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 card p-6"><h3 className="font-bold mb-4">Mapa de Desempenho</h3><div ref={mapRef} style={{height:'450px',borderRadius:'16px'}}></div><div className="flex justify-center gap-4 mt-4 text-xs"><span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#ef4444'}}></span>Regular</span><span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#fbbf24'}}></span>Suficiente</span><span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#84cc16'}}></span>Bom</span><span className="flex items-center gap-1"><span className="w-4 h-4 rounded" style={{backgroundColor:'#1e3a5f'}}></span>Ótimo</span></div>{indFilter !== 'taxa' && config && <div className="mt-4 p-3 bg-gray-50 rounded-lg"><p className="text-xs font-semibold text-gray-600 mb-2">Componente selecionado:</p><div className="text-sm text-gray-700"><span className="font-medium">C{parseInt(indFilter.replace('ind',''))}:</span> {config.fullNames[parseInt(indFilter.replace('ind',''))-1]}</div></div>}</div><div className="space-y-4"><div className="card p-6"><h3 className="font-bold mb-4"><i className="fas fa-layer-group mr-2 text-blue-500"></i>Clusters por Região</h3><div className="space-y-2">{regiaoStats.map((r,i) => { const c = getCategoriaTaxa(r.taxa); return <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div><p className="font-medium text-sm">{r.regiao}</p><p className="text-xs text-gray-500">{r.municipios} mun.</p></div><div className="text-right"><span className="font-bold" style={{color: c.color}}>{r.taxa.toFixed(2)}</span><span className="ml-1 text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.color}}>{c.label}</span></div></div>; })}</div></div><div className="card p-6"><h3 className="font-bold mb-4"><i className="fas fa-chart-pie mr-2 text-purple-500"></i>Distribuição</h3><div className="space-y-2">{[{l:'Ótimo',c:'#1e3a5f',v:clusters.otimo},{l:'Bom',c:'#84cc16',v:clusters.bom},{l:'Suficiente',c:'#fbbf24',v:clusters.suficiente},{l:'Regular',c:'#ef4444',v:clusters.regular}].map(x => { const pct = hm.length ? (x.v/hm.length*100) : 0; return <div key={x.l}><div className="flex justify-between text-sm mb-1"><span>{x.l}</span><span className="font-bold">{pct.toFixed(0)}%</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-2 rounded-full" style={{width: pct+'%', backgroundColor: x.c}}></div></div></div>; })}</div></div></div></div><div className="card p-6 mt-6"><h3 className="font-bold mb-4 flex items-center gap-2"><i className="fas fa-th text-blue-500"></i>Mosaico de Mapas Mensais<span className="ml-auto text-xs font-normal text-gray-500">Evolução temporal do território</span></h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{getUnique('competencia').slice(0, 12).map(month => { const monthData = rawData.filter(r => r.competencia === month); const monthMetrics = monthData.length ? { total: monthData.reduce((s,r) => s + (r.totalPacientes||0), 0), taxa: monthData.reduce((s,r) => s + r.somatorio, 0) / monthData.reduce((s,r) => s + (r.totalPacientes||0), 0) || 0 } : { total: 0, taxa: 0 }; const monthCat = getCategoriaTaxa(monthMetrics.taxa); return (<div key={month} className="mosaic-card bg-gray-50 rounded-xl p-3 hover:shadow-lg transition-all"><div className="flex items-center justify-between mb-2"><span className="text-sm font-bold text-gray-700">{month}</span><span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: monthCat.color}}>{monthMetrics.taxa.toFixed(2)}</span></div><div className="relative bg-white rounded-lg overflow-hidden shadow-inner" style={{height:'260px'}}><MiniMap monthData={monthData} indFilter={indFilter} /></div><div className="mt-2 text-xs text-gray-500 text-center">{monthMetrics.total.toLocaleString()} pacientes</div></div>); })}</div></div></div>);
    };

    // ========== METAS / PLANEJAMENTO ==========
    const GoalsView = () => {
        const regioes = getRegioes();
        const distritos = selectedState === 'msp' ? getUnique('distrito') : [];
        const [selectedRegiao, setSelectedRegiao] = useState(selectedState === 'msp' ? 'capital' : 'estadual');
        const goalsKey = 'gdiaps_goals_' + indicatorType + '_' + selectedRegiao;
        const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem(goalsKey) || '{}'));
        const [targetDate, setTargetDate] = useState(goals.targetDate || '');
        
        // Filtrar dados baseado na abrangência selecionada
        const dataForGoals = (selectedRegiao === 'estadual' || selectedRegiao === 'capital') ? filteredData : 
            (selectedState === 'msp' ? filteredData.filter(r => r.distrito === selectedRegiao) : filteredData.filter(r => r.regiao === selectedRegiao));
        const m = calcMetrics(dataForGoals), ind = calcIndicators(dataForGoals);
        
        // Recarregar metas quando mudar a regional
        useEffect(() => {
            const savedGoals = JSON.parse(localStorage.getItem(goalsKey) || '{}');
            setGoals(savedGoals);
            setTargetDate(savedGoals.targetDate || '');
        }, [selectedRegiao, goalsKey]);
        
        const saveGoals = (newGoals) => {
            setGoals(newGoals);
            localStorage.setItem(goalsKey, JSON.stringify(newGoals));
        };
        
        const updateGoal = (key, value) => {
            const newGoals = { ...goals, [key]: parseFloat(value) || 0, targetDate };
            saveGoals(newGoals);
        };
        
        const getProgress = (current, goal) => {
            if (!goal) return 0;
            return Math.min(100, (current / goal) * 100);
        };
        
        const getGap = (current, goal) => goal ? goal - current : 0;
        
        const isManager = user?.cargo?.toLowerCase().includes('gestor') || user?.cargo?.toLowerCase().includes('coordenador') || user?.cargo?.toLowerCase().includes('admin');
        
        return (
            <div className="animate-fadeIn">
                <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                            <i className="fas fa-bullseye animate-pulse"></i>
                            Planejamento de Metas
                        </h1>
                        <p className="text-white/90 text-lg">Defina metas estratégicas e acompanhe o progresso em tempo real</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Seleção de Regional */}
                <div className="card p-6 mb-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <i className="fas fa-map-marker-alt text-white"></i>
                        </div>
                        Selecione a Abrangência
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setSelectedRegiao(selectedState === 'msp' ? 'capital' : 'estadual')}
                            className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${(selectedRegiao === 'estadual' || selectedRegiao === 'capital') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'}`}
                        >
                            <i className="fas fa-globe-americas mr-2"></i>{selectedState === 'msp' ? 'Capital' : 'Estadual'}
                        </button>
                        {selectedState === 'msp' ? distritos.map(d => (
                            <button 
                                key={d}
                                onClick={() => setSelectedRegiao(d)}
                                className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${selectedRegiao === d ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-xl shadow-orange-300/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'}`}
                            >
                                {d}
                            </button>
                        )) : regioes.map(r => (
                            <button 
                                key={r}
                                onClick={() => setSelectedRegiao(r)}
                                className={`px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${selectedRegiao === r ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300/50' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm text-indigo-700 flex items-center gap-2">
                            <i className="fas fa-info-circle"></i>
                            <span className="font-medium">{(selectedRegiao === 'estadual' || selectedRegiao === 'capital') ? (selectedState === 'msp' ? 'Metas para toda a Capital' : 'Metas para todo o estado') : (selectedState === 'msp' ? `Metas específicas para o distrito ${selectedRegiao}` : `Metas específicas para a regional ${selectedRegiao}`)}</span>
                        </p>
                    </div>
                </div>
                
                {!isManager && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-lg animate-pulse-slow">
                        <p className="text-amber-800 font-medium flex items-center gap-2">
                            <i className="fas fa-lock text-xl"></i>
                            <span>Apenas gestores e coordenadores podem editar metas. Você está visualizando em modo leitura.</span>
                        </p>
                    </div>
                )}
                
                {/* Configuração de Data Alvo */}
                <div className="card p-6 mb-6 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-xl">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center animate-float">
                            <i className="fas fa-calendar-alt text-white"></i>
                        </div>
                        Período de Avaliação
                    </h3>
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Data Alvo para Atingir Metas</label>
                            <input 
                                type="date" 
                                className="input-field" 
                                value={targetDate}
                                onChange={e => { setTargetDate(e.target.value); saveGoals({ ...goals, targetDate: e.target.value }); }}
                                disabled={!isManager}
                            />
                        </div>
                        {targetDate && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-3 rounded-xl border-2 border-blue-200 shadow-md animate-fadeIn">
                                <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
                                    <i className="fas fa-clock text-lg"></i>
                                    <span>{Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24))} dias restantes para atingir as metas</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Meta da Boas Práticas */}
                <div className="card p-6 mb-6 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-lg relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
                            <i className="fas fa-bullseye text-white"></i>
                        </div>
                        Meta da Boas Práticas
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Meta (%)</label>
                            <input 
                                type="number" 
                                className="input-field text-2xl font-bold text-center"
                                value={goals.taxa || ''}
                                onChange={e => updateGoal('taxa', e.target.value)}
                                placeholder="Ex: 75"
                                min="0" max="100" step="0.1"
                                disabled={!isManager}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">Progresso Atual</span>
                                <span className="font-bold">{m.taxa.toFixed(2)} / {goals.taxa || '?'}</span>
                            </div>
                            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 transition-all duration-1000 flex items-center justify-end pr-3 relative overflow-hidden"
                                    style={{ width: getProgress(m.taxa, goals.taxa) + '%' }}
                                >
                                    <span className="text-white text-xs font-bold">{getProgress(m.taxa, goals.taxa).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className={getGap(m.taxa, goals.taxa) > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {getGap(m.taxa, goals.taxa) > 0 ? (
                                        <><i className="fas fa-arrow-up mr-1"></i>Faltam {getGap(m.taxa, goals.taxa).toFixed(2)} pontos</>
                                    ) : (
                                        <><i className="fas fa-check mr-1"></i>Meta atingida!</>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Metas por Boa Prática */}
                <div className="card p-6 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center animate-float">
                            <i className="fas fa-layer-group text-white"></i>
                        </div>
                        Metas por Boa Prática
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {ind.map((i, idx) => {
                            const goalKey = 'comp' + i.index;
                            const goalValue = goals[goalKey] || 0;
                            const progress = getProgress(i.pct, goalValue);
                            const gap = getGap(i.pct, goalValue);
                            return (
                                <div key={i.index} className="group relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 rounded-2xl p-5 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeIn" style={{animationDelay: `${idx * 0.05}s`}}>
                                    {/* Brilho de fundo */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-pink-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        C{i.index}
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                                                        <i className="fas fa-star text-white text-xs"></i>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 text-lg mb-1">{i.name}</p>
                                                    <p className="text-sm text-gray-500">{i.fullName}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6">
                                                {/* Valor Atual */}
                                                <div className="text-center px-4 py-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                                    <p className="text-xs text-purple-600 font-semibold mb-1">Atual</p>
                                                    <p className="text-2xl font-extrabold text-purple-700">{i.pct.toFixed(1)}<span className="text-sm">%</span></p>
                                                </div>
                                                
                                                {/* Input de Meta */}
                                                <div className="relative">
                                                    <label className="block text-xs text-gray-600 font-semibold mb-2 text-center">Meta Desejada</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            className="w-28 px-4 py-3 text-center text-xl font-bold border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all bg-white shadow-inner"
                                                            value={goalValue || ''}
                                                            onChange={e => updateGoal(goalKey, e.target.value)}
                                                            placeholder="0"
                                                            min="0" max="100"
                                                            disabled={!isManager}
                                                        />
                                                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Barra de Progresso */}
                                        {goalValue > 0 && (
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 font-medium">Progresso da Meta</span>
                                                    <span className={`font-bold ${gap > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                                                        {Math.min(progress, 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="relative h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ease-out relative overflow-hidden ${gap > 0 ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500' : 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500'}`}
                                                        style={{ width: Math.min(progress, 100) + '%' }}
                                                    >
                                                        {/* Efeito de brilho animado */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                                                        {/* Porcentagem dentro da barra */}
                                                        {progress > 15 && (
                                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold drop-shadow">
                                                                {Math.min(progress, 100).toFixed(0)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-semibold flex items-center gap-2 ${gap > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                                        {gap > 0 ? (
                                                            <>
                                                                <i className="fas fa-arrow-up"></i>
                                                                Faltam {gap.toFixed(1)}% para a meta
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-check-circle"></i>
                                                                Meta atingida! Parabéns!
                                                            </>
                                                        )}
                                                    </p>
                                                    {gap <= 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <i className="fas fa-trophy text-amber-500 animate-bounce"></i>
                                                            <i className="fas fa-star text-amber-400"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ========== AVALIAÇÃO ==========
    const EvaluationView = () => {
        const regioes = getRegioes();
        const distritos = selectedState === 'msp' ? getUnique('distrito') : [];
        const [selectedRegiao, setSelectedRegiao] = useState(selectedState === 'msp' ? 'capital' : 'estadual');
        const [viewMode, setViewMode] = useState('resumo'); // resumo, taxa, componentes, evolucao
        
        const goalsKey = 'gdiaps_goals_' + indicatorType + '_' + selectedRegiao;
        const goals = JSON.parse(localStorage.getItem(goalsKey) || '{}');
        
        // Filtrar dados baseado na abrangência selecionada
        const dataForEval = (selectedRegiao === 'estadual' || selectedRegiao === 'capital') ? filteredData : 
            (selectedState === 'msp' ? filteredData.filter(r => r.distrito === selectedRegiao) : filteredData.filter(r => r.regiao === selectedRegiao));
        const m = calcMetrics(dataForEval), ind = calcIndicators(dataForEval), trend = getTrend(dataForEval);
        
        const getProgress = (current, goal) => goal ? Math.min(100, (current / goal) * 100) : 0;
        const getGap = (current, goal) => goal ? goal - current : 0;
        const getStatus = (current, goal) => {
            if (!goal) return { label: 'Sem meta', color: 'gray', icon: 'fa-minus' };
            const pct = (current / goal) * 100;
            if (pct >= 100) return { label: 'Atingida', color: 'green', icon: 'fa-check-circle' };
            if (pct >= 80) return { label: 'Próximo', color: 'lime', icon: 'fa-arrow-up' };
            if (pct >= 50) return { label: 'Em progresso', color: 'amber', icon: 'fa-clock' };
            return { label: 'Crítico', color: 'red', icon: 'fa-exclamation-circle' };
        };
        
        // Projeção linear
        const projectValue = (currentTrend, targetDate) => {
            if (!targetDate || currentTrend.length < 2) return null;
            const n = currentTrend.length;
            const xM = (n - 1) / 2;
            const yM = currentTrend.reduce((s, t) => s + t.taxa, 0) / n;
            let num = 0, den = 0;
            currentTrend.forEach((p, i) => { num += (i - xM) * (p.taxa - yM); den += (i - xM) * (i - xM); });
            const slope = den ? num / den : 0;
            const monthsToTarget = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
            return Math.max(0, Math.min(100, currentTrend[n - 1].taxa + slope * monthsToTarget));
        };
        
        const projection = projectValue(trend, goals.targetDate);
        const taxaStatus = getStatus(m.taxa, goals.taxa);
        
        // Gráfico de metas vs atual
        const GoalChart = () => {
            const ref = useRef(null), chart = useRef(null);
            useEffect(() => {
                if (!ref.current) return;
                chart.current?.destroy();
                const labels = ind.map(i => i.name);
                const atual = ind.map(i => i.pct);
                const metas = ind.map(i => goals['comp' + i.index] || 0);
                chart.current = new Chart(ref.current, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Atual', data: atual, backgroundColor: 'rgba(99, 102, 241, 0.8)', borderRadius: 4 },
                            { label: 'Meta', data: metas, backgroundColor: 'rgba(234, 179, 8, 0.8)', borderRadius: 4 }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                        scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } } }
                    }
                });
                return () => chart.current?.destroy();
            }, [ind, goals]);
            return <canvas ref={ref}></canvas>;
        };
        
        // Gráfico de evolução com meta
        const TrendWithGoalChart = () => {
            const ref = useRef(null), chart = useRef(null);
            useEffect(() => {
                if (!ref.current) return;
                chart.current?.destroy();
                const labels = trend.map(t => t.month.slice(0, 3));
                chart.current = new Chart(ref.current, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Taxa Atual', data: trend.map(t => t.taxa), borderColor: '#6366f1', backgroundColor: (() => { const ctx = ref.current.getContext('2d'); const g = ctx.createLinearGradient(0, 0, 0, 280); g.addColorStop(0, 'rgba(99, 102, 241, 0.25)'); g.addColorStop(1, 'rgba(99, 102, 241, 0.02)'); return g; })(), fill: true, tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 8, pointHoverBackgroundColor: '#4f46e5' },
                            { label: 'Meta', data: trend.map(() => goals.taxa || 0), borderColor: '#eab308', borderDash: [6, 4], pointRadius: 0, borderWidth: 2 }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '500' } } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}` } }, datalabels: { display: ctx => ctx.datasetIndex === 0, color: '#4338ca', font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'top', offset: 4, formatter: v => v ? v.toFixed(1) : '' } },
                        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.06)', drawBorder: false }, ticks: { font: { size: 11 }, color: '#64748b', padding: 8 } }, x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: '#64748b' } } }
                    }
                });
                return () => chart.current?.destroy();
            }, [trend, goals]);
            return <canvas ref={ref}></canvas>;
        };
        
        return (
            <div className="animate-fadeIn">
                <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                            <i className="fas fa-chart-line animate-pulse"></i>
                            Avaliação de Metas
                        </h1>
                        <p className="text-white/90 text-lg">Acompanhe o progresso e análise de desempenho em tempo real</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                {/* Filtros */}
                <div className="card p-6 mb-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Seleção de Regional */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <i className="fas fa-map-marker-alt text-white text-sm"></i>
                                </div>
                                Abrangência
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={() => setSelectedRegiao(selectedState === 'msp' ? 'capital' : 'estadual')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${(selectedRegiao === 'estadual' || selectedRegiao === 'capital') ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    <i className="fas fa-globe-americas mr-1"></i>{selectedState === 'msp' ? 'Capital' : 'Estadual'}
                                </button>
                                {selectedState === 'msp' ? distritos.map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => setSelectedRegiao(d)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${selectedRegiao === d ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        {d}
                                    </button>
                                )) : regioes.map(r => (
                                    <button 
                                        key={r}
                                        onClick={() => setSelectedRegiao(r)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${selectedRegiao === r ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Modo de Visualização */}
                        <div>
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <i className="fas fa-eye text-white text-sm"></i>
                                </div>
                                Visualização
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setViewMode('resumo')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${viewMode === 'resumo' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    <i className="fas fa-th-large mr-1"></i>Resumo
                                </button>
                                <button onClick={() => setViewMode('radar')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${viewMode === 'radar' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    <i className="fas fa-radar mr-1"></i>Radar 360°
                                </button>
                                <button onClick={() => setViewMode('componentes')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${viewMode === 'componentes' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    <i className="fas fa-layer-group mr-1"></i>Componentes
                                </button>
                                <button onClick={() => setViewMode('evolucao')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${viewMode === 'evolucao' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    <i className="fas fa-chart-line mr-1"></i>Evolução
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Cards de Resumo */}
                {(viewMode === 'resumo' || viewMode === 'taxa') && <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-${taxaStatus.color}-100 flex items-center justify-center`}>
                                <i className={`fas ${taxaStatus.icon} text-${taxaStatus.color}-600 text-xl`}></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status da Meta Principal</p>
                                <p className={`font-bold text-${taxaStatus.color}-600`}>{taxaStatus.label}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs text-gray-500">Taxa Atual</p>
                        <p className="text-2xl font-bold text-indigo-600">{m.taxa.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Meta: {goals.taxa || 'Não definida'}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs text-gray-500">Gap para Meta</p>
                        <p className={`text-2xl font-bold ${getGap(m.taxa, goals.taxa) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {getGap(m.taxa, goals.taxa) > 0 ? '+' : ''}{getGap(m.taxa, goals.taxa).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">pontos necessários</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-xs text-gray-500">Projeção</p>
                        <p className="text-2xl font-bold text-purple-600">{projection ? projection.toFixed(2) : 'N/A'}</p>
                        <p className="text-xs text-gray-400">até {goals.targetDate || 'data não definida'}</p>
                    </div>
                </div>}
                
                {/* Gráficos */}
                {(viewMode === 'resumo' || viewMode === 'componentes') && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-chart-bar text-indigo-500"></i>
                            Componentes: Atual vs Meta
                        </h3>
                        <div style={{ height: '300px' }}><GoalChart /></div>
                    </div>
                    <div className="card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-chart-line text-purple-500"></i>
                            Evolução com Linha de Meta
                        </h3>
                        <div style={{ height: '300px' }}><TrendWithGoalChart /></div>
                    </div>
                </div>}
                
                {/* Visualização Radar 360° - INOVADORA */}
                {viewMode === 'radar' && (() => {
                    const RadarChart = () => {
                        const ref = useRef(null);
                        const chart = useRef(null);
                        useEffect(() => {
                            if (!ref.current) return;
                            if (chart.current) chart.current.destroy();
                            const labels = ind.map(i => i.name);
                            const atual = ind.map(i => i.pct);
                            const metas = ind.map(i => goals['comp' + i.index] || 0);
                            chart.current = new Chart(ref.current, {
                                type: 'radar',
                                data: {
                                    labels,
                                    datasets: [
                                        { 
                                            label: 'Desempenho Atual', 
                                            data: atual, 
                                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                            borderColor: 'rgba(139, 92, 246, 1)',
                                            borderWidth: 3,
                                            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                                            pointBorderColor: '#fff',
                                            pointHoverBackgroundColor: '#fff',
                                            pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
                                            pointRadius: 5
                                        },
                                        { 
                                            label: 'Metas Definidas', 
                                            data: metas, 
                                            backgroundColor: 'rgba(234, 179, 8, 0.1)',
                                            borderColor: 'rgba(234, 179, 8, 1)',
                                            borderWidth: 2,
                                            borderDash: [5, 5],
                                            pointBackgroundColor: 'rgba(234, 179, 8, 1)',
                                            pointBorderColor: '#fff',
                                            pointRadius: 4
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { 
                                        legend: { position: 'bottom' },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => `${context.dataset.label}: ${context.parsed.r.toFixed(1)}%`
                                            }
                                        }
                                    },
                                    scales: { 
                                        r: { 
                                            beginAtZero: true, 
                                            max: 100,
                                            ticks: { 
                                                stepSize: 20,
                                                callback: v => v + '%'
                                            },
                                            grid: {
                                                color: 'rgba(0, 0, 0, 0.1)'
                                            },
                                            angleLines: {
                                                color: 'rgba(0, 0, 0, 0.1)'
                                            }
                                        } 
                                    }
                                }
                            });
                            return () => {
                                if (chart.current) chart.current.destroy();
                            };
                        }, []);
                        return <canvas ref={ref}></canvas>;
                    };
                    
                    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="card p-6 border-2 border-purple-100 hover:border-purple-300 transition-all">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <i className="fas fa-radar text-white text-sm"></i>
                                </div>
                                Radar de Desempenho 360°
                            </h3>
                            <div style={{ height: '400px' }}>
                                <RadarChart />
                            </div>
                        </div>
                    
                    {/* Análise de Cobertura */}
                    <div className="card p-6 border-2 border-blue-100 hover:border-blue-300 transition-all">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                <i className="fas fa-chart-pie text-white text-sm"></i>
                            </div>
                            Análise de Cobertura de Metas
                        </h3>
                        <div className="space-y-4">
                            {(() => {
                                const totalComps = ind.length;
                                const compsComMeta = ind.filter(i => goals['comp' + i.index] > 0).length;
                                const metasAtingidas = ind.filter(i => {
                                    const goal = goals['comp' + i.index];
                                    return goal > 0 && i.pct >= goal;
                                }).length;
                                const coberturaMetas = totalComps > 0 ? (compsComMeta / totalComps) * 100 : 0;
                                const taxaSucesso = compsComMeta > 0 ? (metasAtingidas / compsComMeta) * 100 : 0;
                                
                                return (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-blue-700">Cobertura de Metas</span>
                                                <span className="text-2xl font-bold text-blue-600">{coberturaMetas.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" style={{width: coberturaMetas + '%'}}></div>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2">{compsComMeta} de {totalComps} componentes com metas definidas</p>
                                        </div>
                                        
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-green-700">Taxa de Sucesso</span>
                                                <span className="text-2xl font-bold text-green-600">{taxaSucesso.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-3 bg-green-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000" style={{width: taxaSucesso + '%'}}></div>
                                            </div>
                                            <p className="text-xs text-green-600 mt-2">{metasAtingidas} metas atingidas de {compsComMeta} definidas</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                                                <i className="fas fa-bullseye text-purple-500 text-2xl mb-2"></i>
                                                <p className="text-xs text-purple-600 mb-1">Componentes</p>
                                                <p className="text-xl font-bold text-purple-700">{totalComps}</p>
                                            </div>
                                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                                                <i className="fas fa-trophy text-amber-500 text-2xl mb-2"></i>
                                                <p className="text-xs text-amber-600 mb-1">Atingidas</p>
                                                <p className="text-xl font-bold text-amber-700">{metasAtingidas}</p>
                                            </div>
                                        </div>
                                        
                                        {metasAtingidas === totalComps && totalComps > 0 && (
                                            <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border-2 border-amber-300 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <i className="fas fa-star text-amber-500 text-3xl"></i>
                                                    <div>
                                                        <p className="font-bold text-amber-800">Excelência Total!</p>
                                                        <p className="text-sm text-amber-700">Todas as metas foram atingidas! 🎉</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>;
                })()}
                
                {/* Gráfico de Evolução (modo evolução) */}
                {viewMode === 'evolucao' && <div className="card p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-chart-line text-purple-500"></i>
                        Evolução Temporal com Linha de Meta
                    </h3>
                    <div style={{ height: '400px' }}><TrendWithGoalChart /></div>
                </div>}
                
                {/* Detalhamento por Componente */}
                {(viewMode === 'resumo' || viewMode === 'componentes') && <div className="card p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-list-check text-green-500"></i>
                        Status por Componente
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left">Componente</th>
                                    <th className="px-4 py-3 text-center">Atual</th>
                                    <th className="px-4 py-3 text-center">Meta</th>
                                    <th className="px-4 py-3 text-center">Gap</th>
                                    <th className="px-4 py-3 text-center">Progresso</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ind.map(i => {
                                    const goal = goals['comp' + i.index] || 0;
                                    const status = getStatus(i.pct, goal);
                                    const gap = getGap(i.pct, goal);
                                    return (
                                        <tr key={i.index} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium">C{i.index}</span> - {i.name}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold">{i.pct.toFixed(1)}%</td>
                                            <td className="px-4 py-3 text-center">{goal || '-'}%</td>
                                            <td className={`px-4 py-3 text-center font-medium ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {goal ? (gap > 0 ? '+' + gap.toFixed(1) : gap.toFixed(1)) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                                    <div className={`h-full rounded-full bg-${status.color}-500`} style={{ width: getProgress(i.pct, goal) + '%' }}></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs bg-${status.color}-100 text-${status.color}-700`}>
                                                    <i className={`fas ${status.icon} mr-1`}></i>{status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>}
            </div>
        );
    };

    // ========== ANOTAÇÕES ==========
    const NotesView = () => {
        const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('gdiaps_notes_' + indicatorType) || '[]'));
        const [newNote, setNewNote] = useState({ title: '', content: '', type: 'observation', priority: 'normal' });
        const [editingId, setEditingId] = useState(null);
        
        const saveNotes = (newNotes) => {
            setNotes(newNotes);
            localStorage.setItem('gdiaps_notes_' + indicatorType, JSON.stringify(newNotes));
        };
        
        const addNote = () => {
            if (!newNote.title.trim() || !newNote.content.trim()) return;
            const note = {
                id: Date.now(),
                ...newNote,
                author: user?.name || 'Anônimo',
                date: new Date().toISOString(),
                indicator: config?.title || indicatorType
            };
            saveNotes([note, ...notes]);
            setNewNote({ title: '', content: '', type: 'observation', priority: 'normal' });
        };
        
        const deleteNote = (id) => {
            if (confirm('Deseja excluir esta anotação?')) {
                saveNotes(notes.filter(n => n.id !== id));
            }
        };
        
        const updateNote = (id, updates) => {
            saveNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
            setEditingId(null);
        };
        
        const typeConfig = {
            observation: { label: 'Observação', icon: 'fa-eye', color: 'blue' },
            problem: { label: 'Problema', icon: 'fa-exclamation-triangle', color: 'red' },
            action: { label: 'Ação', icon: 'fa-tasks', color: 'green' },
            idea: { label: 'Ideia', icon: 'fa-lightbulb', color: 'amber' }
        };
        
        const priorityConfig = {
            low: { label: 'Baixa', color: 'gray' },
            normal: { label: 'Normal', color: 'blue' },
            high: { label: 'Alta', color: 'amber' },
            urgent: { label: 'Urgente', color: 'red' }
        };
        
        return (
            <div className="animate-fadeIn">
                <h1 className="text-3xl font-bold mb-2">Anotações</h1>
                <p className="text-gray-500 mb-6">Registre problemas, ações e observações importantes</p>
                
                {/* Formulário de Nova Anotação */}
                <div className="card p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-plus-circle text-blue-500"></i>
                        Nova Anotação
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Título</label>
                            <input 
                                type="text" 
                                className="input-field"
                                value={newNote.title}
                                onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                placeholder="Título da anotação..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                                <select 
                                    className="input-field"
                                    value={newNote.type}
                                    onChange={e => setNewNote({ ...newNote, type: e.target.value })}
                                >
                                    {Object.entries(typeConfig).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Prioridade</label>
                                <select 
                                    className="input-field"
                                    value={newNote.priority}
                                    onChange={e => setNewNote({ ...newNote, priority: e.target.value })}
                                >
                                    {Object.entries(priorityConfig).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Conteúdo</label>
                        <textarea 
                            className="input-field min-h-[100px]"
                            value={newNote.content}
                            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                            placeholder="Descreva o problema, ação ou observação..."
                        ></textarea>
                    </div>
                    <button 
                        onClick={addNote}
                        className="btn-primary"
                        disabled={!newNote.title.trim() || !newNote.content.trim()}
                    >
                        <i className="fas fa-save mr-2"></i>Salvar Anotação
                    </button>
                </div>
                
                {/* Lista de Anotações */}
                <div className="space-y-4">
                    {notes.length === 0 ? (
                        <div className="card p-8 text-center text-gray-400">
                            <i className="fas fa-sticky-note text-4xl mb-3"></i>
                            <p>Nenhuma anotação registrada ainda.</p>
                        </div>
                    ) : (
                        notes.map(note => {
                            const type = typeConfig[note.type] || typeConfig.observation;
                            const priority = priorityConfig[note.priority] || priorityConfig.normal;
                            return (
                                <div key={note.id} className={`card p-4 border-l-4 border-${type.color}-500`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                                                <i className={`fas ${type.icon} text-${type.color}-600`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{note.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span className={`px-2 py-0.5 rounded bg-${type.color}-100 text-${type.color}-700`}>{type.label}</span>
                                                    <span className={`px-2 py-0.5 rounded bg-${priority.color}-100 text-${priority.color}-700`}>{priority.label}</span>
                                                    <span><i className="fas fa-user mr-1"></i>{note.author}</span>
                                                    <span><i className="fas fa-calendar mr-1"></i>{new Date(note.date).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => deleteNote(note.id)} className="text-red-500 hover:text-red-700">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                                    {note.updatedAt && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            <i className="fas fa-edit mr-1"></i>Editado em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    // ========== REDE GDI-APS (Social Network) ==========
    const NetworkView = () => {
        const [posts, setPosts] = useState(() => JSON.parse(localStorage.getItem('gdiaps_posts') || '[]'));
        const [newPost, setNewPost] = useState({ content: '', image: null });
        const [showNewPostModal, setShowNewPostModal] = useState(false);
        const [activeTab, setActiveTab] = useState('feed');
        const [following, setFollowing] = useState(() => JSON.parse(localStorage.getItem('gdiaps_following_' + user?.id) || '[]'));
        const [allUsers] = useState(() => JSON.parse(localStorage.getItem('gdiaps_all_users') || '[]'));
        const selectedAvatar = user?.avatar || 'fa-user-nurse';
        
        const savePosts = (newPosts) => {
            setPosts(newPosts);
            localStorage.setItem('gdiaps_posts', JSON.stringify(newPosts));
        };
        
        const saveFollowing = (newFollowing) => {
            setFollowing(newFollowing);
            localStorage.setItem('gdiaps_following_' + user?.id, JSON.stringify(newFollowing));
        };
        
        const handleFollow = (userId) => {
            if (following.includes(userId)) {
                saveFollowing(following.filter(id => id !== userId));
            } else {
                saveFollowing([...following, userId]);
            }
        };
        
        const handleCreatePost = () => {
            if (!newPost.content.trim()) return;
            const post = {
                id: Date.now(),
                userId: user?.id || Date.now(),
                userName: user?.name || 'Usuário',
                userCargo: user?.cargo || '',
                userMunicipio: user?.municipio || '',
                userAvatar: selectedAvatar,
                content: newPost.content,
                image: newPost.image,
                date: new Date().toISOString(),
                likes: [],
                comments: [],
                shares: 0
            };
            savePosts([post, ...posts]);
            setNewPost({ content: '', image: null });
            setShowNewPostModal(false);
        };
        
        const handleLike = (postId) => {
            const updated = posts.map(p => {
                if (p.id === postId) {
                    const userId = user?.id || 'anon';
                    const liked = p.likes?.includes(userId);
                    return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...(p.likes || []), userId] };
                }
                return p;
            });
            savePosts(updated);
        };
        
        const handleShare = (postId) => {
            const updated = posts.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p);
            savePosts(updated);
        };
        
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = Math.floor((now - date) / 1000);
            if (diff < 60) return 'Agora';
            if (diff < 3600) return `${Math.floor(diff / 60)}min`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
            return date.toLocaleDateString('pt-BR');
        };
        
        // Posts do feed (próprios + de quem segue)
        const feedPosts = posts.filter(p => p.userId === user?.id || following.includes(p.userId));
        const discoverPosts = posts.filter(p => p.userId !== user?.id && !following.includes(p.userId));
        
        if (!user) return (
            <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                    <i className="fas fa-user-lock text-white text-4xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
                <p className="text-gray-500 mb-6">Faça login para acessar a Rede GDI-APS</p>
                <button onClick={() => { setAuthMode('login'); setAuthModal(true); }} className="btn-primary">
                    <i className="fas fa-sign-in-alt mr-2"></i>Entrar
                </button>
            </div>
        );

        return (
            <div className="animate-fadeIn">
                {/* Modal de Nova Postagem */}
                {showNewPostModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewPostModal(false)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Criar Publicação</h3>
                                <button onClick={() => setShowNewPostModal(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                            </div>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <i className={`fas ${selectedAvatar} text-white text-lg`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.cargo}</p>
                                </div>
                            </div>
                            <textarea className="input-field min-h-[150px] text-lg border-0 focus:ring-0 resize-none" placeholder="O que você gostaria de compartilhar com a rede?" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} autoFocus></textarea>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-500"><i className="fas fa-image text-lg"></i></button>
                                    <button className="p-2 rounded-lg hover:bg-green-50 text-green-500"><i className="fas fa-chart-bar text-lg"></i></button>
                                    <button className="p-2 rounded-lg hover:bg-amber-50 text-amber-500"><i className="fas fa-smile text-lg"></i></button>
                                </div>
                                <button onClick={handleCreatePost} disabled={!newPost.content.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Publicar</button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Rede GDI-APS</h1>
                        <p className="text-gray-500">Conecte-se com profissionais de saúde</p>
                    </div>
                    <button onClick={() => setShowNewPostModal(true)} className="btn-primary"><i className="fas fa-plus mr-2"></i>Nova Publicação</button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
                    {[['feed', 'fa-home', 'Meu Feed'], ['discover', 'fa-compass', 'Descobrir'], ['following', 'fa-user-friends', 'Seguindo']].map(([key, icon, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === key ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                            <i className={`fas ${icon}`}></i>{label}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal - Posts */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Criar Post Rápido */}
                        <div className="card p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <i className={`fas ${selectedAvatar} text-white`}></i>
                                </div>
                                <button onClick={() => setShowNewPostModal(true)} className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                    Compartilhe uma atualização...
                                </button>
                            </div>
                        </div>
                        
                        {/* Posts do Feed */}
                        {activeTab === 'feed' && (
                            feedPosts.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <i className="fas fa-newspaper text-gray-300 text-5xl mb-4"></i>
                                    <p className="text-gray-500 mb-2">Seu feed está vazio</p>
                                    <p className="text-sm text-gray-400">Siga outros profissionais para ver suas publicações aqui</p>
                                </div>
                            ) : feedPosts.map(post => (
                                <div key={post.id} className="card overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <i className={`fas ${post.userAvatar || 'fa-user'} text-white`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{post.userName}</p>
                                                <p className="text-xs text-gray-500">{post.userCargo} {post.userMunicipio && `• ${post.userMunicipio}`}</p>
                                                <p className="text-xs text-gray-400">{formatDate(post.date)}</p>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600"><i className="fas fa-ellipsis-h"></i></button>
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                    </div>
                                    {post.image && <img src={post.image} alt="" className="w-full" />}
                                    <div className="px-4 py-2 border-t flex items-center justify-between text-sm text-gray-500">
                                        <span>{post.likes?.length || 0} curtidas</span>
                                        <span>{post.comments?.length || 0} comentários • {post.shares || 0} compartilhamentos</span>
                                    </div>
                                    <div className="flex border-t">
                                        <button onClick={() => handleLike(post.id)} className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${post.likes?.includes(user?.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                            <i className={`${post.likes?.includes(user?.id) ? 'fas' : 'far'} fa-thumbs-up`}></i>Curtir
                                        </button>
                                        <button className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50">
                                            <i className="far fa-comment"></i>Comentar
                                        </button>
                                        <button onClick={() => handleShare(post.id)} className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50">
                                            <i className="fas fa-share"></i>Compartilhar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Posts para Descobrir */}
                        {activeTab === 'discover' && (
                            discoverPosts.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <i className="fas fa-compass text-gray-300 text-5xl mb-4"></i>
                                    <p className="text-gray-500">Nenhuma publicação nova para descobrir</p>
                                </div>
                            ) : discoverPosts.map(post => (
                                <div key={post.id} className="card overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                                                <i className={`fas ${post.userAvatar || 'fa-user'} text-white`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{post.userName}</p>
                                                <p className="text-xs text-gray-500">{post.userCargo}</p>
                                            </div>
                                            <button onClick={() => handleFollow(post.userId)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${following.includes(post.userId) ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                                {following.includes(post.userId) ? 'Seguindo' : 'Seguir'}
                                            </button>
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                    <div className="flex border-t">
                                        <button onClick={() => handleLike(post.id)} className={`flex-1 py-3 flex items-center justify-center gap-2 ${post.likes?.includes(user?.id) ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                            <i className={`${post.likes?.includes(user?.id) ? 'fas' : 'far'} fa-thumbs-up`}></i>{post.likes?.length || 0}
                                        </button>
                                        <button className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50">
                                            <i className="far fa-comment"></i>{post.comments?.length || 0}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Lista de Seguindo */}
                        {activeTab === 'following' && (
                            <div className="card p-6">
                                <h3 className="font-bold text-lg mb-4">Pessoas que você segue ({following.length})</h3>
                                {following.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Você ainda não segue ninguém. Explore a aba "Descobrir"!</p>
                                ) : (
                                    <div className="space-y-3">
                                        {allUsers.filter(u => following.includes(u.id)).map(u => (
                                            <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                    <i className={`fas ${u.avatar || 'fa-user'} text-white`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold">{u.name}</p>
                                                    <p className="text-sm text-gray-500">{u.cargo}</p>
                                                </div>
                                                <button onClick={() => handleFollow(u.id)} className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">
                                                    Deixar de seguir
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Coluna Lateral */}
                    <div className="space-y-4">
                        {/* Meu Perfil Resumido */}
                        <div className="card p-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <i className={`fas ${selectedAvatar} text-white text-2xl`}></i>
                            </div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.cargo}</p>
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                                <div><p className="text-xl font-bold">{posts.filter(p => p.userId === user?.id).length}</p><p className="text-xs text-gray-500">Posts</p></div>
                                <div><p className="text-xl font-bold">{following.length}</p><p className="text-xs text-gray-500">Seguindo</p></div>
                            </div>
                        </div>
                        
                        {/* Sugestões para Seguir */}
                        <div className="card p-4">
                            <h4 className="font-bold mb-3">Sugestões para você</h4>
                            <div className="space-y-3">
                                {allUsers.filter(u => u.id !== user?.id && !following.includes(u.id)).slice(0, 3).map(u => (
                                    <div key={u.id} className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                            <i className={`fas ${u.avatar || 'fa-user'} text-white text-sm`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{u.cargo}</p>
                                        </div>
                                        <button onClick={() => handleFollow(u.id)} className="text-blue-600 text-sm font-semibold hover:underline">Seguir</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ========== PERFIL DO USUÁRIO (SIMPLIFICADO) ==========
    const ProfileView = () => {
        const [showAvatarModal, setShowAvatarModal] = useState(false);
        const [showEditModal, setShowEditModal] = useState(false);
        const [editField, setEditField] = useState(null);
        const [profileData, setProfileData] = useState({ name: user?.name || '', cargo: user?.cargo || '', municipio: user?.municipio || '' });
        const avatarIcons = ['fa-user-nurse', 'fa-user-md', 'fa-stethoscope', 'fa-heartbeat', 'fa-hospital-user', 'fa-hand-holding-medical', 'fa-user-tie', 'fa-user-graduate'];
        const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'fa-user-nurse');
        const cargoOptions = ['Profissional de Saúde', 'Enfermeiro(a)', 'Médico(a)', 'Técnico(a) de Enfermagem', 'Agente Comunitário de Saúde', 'Coordenador(a) de UBS', 'Gestor(a) Municipal', 'Gestor(a) Regional', 'Coordenador(a) Estadual', 'Time interno'];
        
        const handleSaveField = () => {
            setUser({ ...user, ...profileData, avatar: selectedAvatar });
            setShowEditModal(false);
            setEditField(null);
        };
        
        const openEditModal = (field) => {
            setEditField(field);
            setProfileData({ name: user?.name || '', cargo: user?.cargo || '', municipio: user?.municipio || '' });
            setShowEditModal(true);
        };

        if (!user) return (
            <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                    <i className="fas fa-user-lock text-white text-4xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
                <p className="text-gray-500 mb-6">Faça login para acessar seu perfil</p>
                <button onClick={() => { setAuthMode('login'); setAuthModal(true); }} className="btn-primary">
                    <i className="fas fa-sign-in-alt mr-2"></i>Entrar
                </button>
            </div>
        );

        return (
            <div className="animate-fadeIn max-w-2xl mx-auto">
                {/* Modal de Avatar */}
                {showAvatarModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAvatarModal(false)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Escolha seu Avatar</h3>
                                <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {avatarIcons.map(icon => (
                                    <button key={icon} onClick={() => { setSelectedAvatar(icon); setUser({...user, avatar: icon}); setShowAvatarModal(false); }} className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${selectedAvatar === icon ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'}`}>
                                        <i className={`fas ${icon} text-2xl`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Modal de Edição */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Editar {editField === 'name' ? 'Nome' : editField === 'cargo' ? 'Cargo' : 'Município'}</h3>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
                            </div>
                            {editField === 'name' && (
                                <input type="text" className="input-field text-lg" placeholder="Seu nome" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} autoFocus />
                            )}
                            {editField === 'cargo' && (
                                <select className="input-field text-lg" value={profileData.cargo} onChange={e => setProfileData({...profileData, cargo: e.target.value})}>
                                    <option value="">Selecione seu cargo</option>
                                    {cargoOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                            {editField === 'municipio' && (
                                <select className="input-field text-lg" value={profileData.municipio} onChange={e => setProfileData({...profileData, municipio: e.target.value})}>
                                    <option value="">Selecione seu município</option>
                                    {getUnique('municipio').map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            )}
                            <button onClick={handleSaveField} className="btn-primary w-full mt-4"><i className="fas fa-check mr-2"></i>Salvar</button>
                        </div>
                    </div>
                )}
                
                {/* Header do Perfil */}
                <div className="corp-card overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                    <div className="px-6 pb-6 pt-2">
                        <div className="flex flex-col items-center -mt-16">
                            <div className="relative cursor-pointer group" onClick={() => setShowAvatarModal(true)}>
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-xl">
                                    <i className={`fas ${selectedAvatar} text-white text-4xl`}></i>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <i className="fas fa-camera text-white text-xl"></i>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mt-4">{user.name}</h1>
                            <p className="text-gray-600">{user.cargo}</p>
                            <p className="text-gray-500 text-sm"><i className="fas fa-map-marker-alt mr-1"></i>{user.municipio || 'Localização não informada'}</p>
                        </div>
                    </div>
                </div>
                
                {/* Informações Editáveis */}
                <div className="corp-card mb-6">
                    <div className="corp-card-header">
                        <h3 className="corp-card-title"><i className="fas fa-user-edit"></i>Informações Pessoais</h3>
                    </div>
                    <div className="corp-card-body space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => openEditModal('name')}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><i className="fas fa-user text-blue-500"></i></div>
                                <div>
                                    <p className="text-xs text-gray-500">Nome</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => openEditModal('cargo')}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><i className="fas fa-briefcase text-purple-500"></i></div>
                                <div>
                                    <p className="text-xs text-gray-500">Cargo</p>
                                    <p className="font-medium">{user.cargo}</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => openEditModal('municipio')}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><i className="fas fa-map-marker-alt text-green-500"></i></div>
                                <div>
                                    <p className="text-xs text-gray-500">Município</p>
                                    <p className="font-medium">{user.municipio || 'Não informado'}</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                    </div>
                </div>
                
                {/* Configurações */}
                <div className="corp-card mb-6">
                    <div className="corp-card-header">
                        <h3 className="corp-card-title"><i className="fas fa-cog"></i>Configurações</h3>
                    </div>
                    <div className="corp-card-body space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><i className="fas fa-bell text-indigo-500"></i></div>
                                <div>
                                    <p className="font-medium">Notificações</p>
                                    <p className="text-xs text-gray-500">Receber alertas e atualizações</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><i className="fas fa-moon text-amber-500"></i></div>
                                <div>
                                    <p className="font-medium">Modo Escuro</p>
                                    <p className="text-xs text-gray-500">Tema escuro para o dashboard</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center"><i className="fas fa-language text-cyan-500"></i></div>
                                <div>
                                    <p className="font-medium">Idioma</p>
                                    <p className="text-xs text-gray-500">Português (Brasil)</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center"><i className="fas fa-download text-teal-500"></i></div>
                                <div>
                                    <p className="font-medium">Exportar Dados</p>
                                    <p className="text-xs text-gray-500">Baixar seus dados em CSV</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                    </div>
                </div>
                
                {/* Ações da Conta */}
                <div className="corp-card">
                    <div className="corp-card-header">
                        <h3 className="corp-card-title"><i className="fas fa-shield-alt"></i>Conta</h3>
                    </div>
                    <div className="corp-card-body space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center"><i className="fas fa-key text-rose-500"></i></div>
                                <div>
                                    <p className="font-medium">Alterar Senha</p>
                                    <p className="text-xs text-gray-500">Atualizar sua senha de acesso</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </div>
                        <button onClick={() => setUser(null)} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><i className="fas fa-sign-out-alt text-red-500"></i></div>
                                <div>
                                    <p className="font-medium text-red-600">Sair da Conta</p>
                                    <p className="text-xs text-red-400">Encerrar sua sessão</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ========== GESTÃO PLANIFICASUS - TIME INTERNO ==========
    const PlanificaSUSView = () => {
        const [viewMode, setViewMode] = useState('comparativo');
        const [selectedUF, setSelectedUF] = useState('todas');
        
        // Calcular métricas por UF (usando selectedState como base)
        const ufData = {
            name: STATE_CONFIG[selectedState]?.name || 'Estado',
            uf: selectedState === 'acre' ? 'AC' : selectedState === 'rn' ? 'RN' : selectedState === 'am' ? 'AM' : selectedState === 'mt' ? 'MT' : selectedState === 'msp' ? 'SP' : ''
        };
        
        // Calcular métricas por região de saúde
        const regioesSaude = getRegioes().map(regiao => {
            const dados = rawData.filter(r => r.regiao === regiao);
            const totalPacientes = dados.reduce((s, r) => s + (r.totalPacientes || 0), 0);
            const somatorio = dados.reduce((s, r) => s + r.somatorio, 0);
            const taxa = totalPacientes > 0 ? somatorio / totalPacientes : 0;
            const equipes = new Set(dados.map(r => r.ine)).size;
            const municipios = new Set(dados.map(r => r.municipio)).size;
            
            // Calcular cada componente
            const componentes = Array.from({ length: config?.indicatorCount || 11 }, (_, i) => {
                const sum = dados.reduce((s, r) => s + (r['ind' + (i + 1)] || 0), 0);
                return totalPacientes > 0 ? (sum / totalPacientes) * 100 : 0;
            });
            
            // Calcular tendência
            const meses = [...new Set(dados.map(r => r.competencia))];
            const tendencia = meses.length >= 2 ? (() => {
                const primeiro = dados.filter(r => r.competencia === meses[0]);
                const ultimo = dados.filter(r => r.competencia === meses[meses.length - 1]);
                const taxaPrimeiro = primeiro.reduce((s, r) => s + r.somatorio, 0) / (primeiro.reduce((s, r) => s + (r.totalPacientes || 0), 0) || 1);
                const taxaUltimo = ultimo.reduce((s, r) => s + r.somatorio, 0) / (ultimo.reduce((s, r) => s + (r.totalPacientes || 0), 0) || 1);
                return taxaUltimo - taxaPrimeiro;
            })() : 0;
            
            // Projeção para atingir Ótimo (75+)
            const mesesParaOtimo = taxa >= 75 ? 0 : tendencia > 0 ? Math.ceil((75 - taxa) / tendencia) : null;
            
            return { regiao, taxa, equipes, municipios, totalPacientes, componentes, tendencia, mesesParaOtimo, cat: getCategoriaTaxa(taxa) };
        }).sort((a, b) => b.taxa - a.taxa);
        
        // Estatísticas gerais
        const totalRegioes = regioesSaude.length;
        const regioesOtimo = regioesSaude.filter(r => r.taxa >= 75).length;
        const regioesBom = regioesSaude.filter(r => r.taxa >= 50 && r.taxa < 75).length;
        const regioesSuficiente = regioesSaude.filter(r => r.taxa >= 25 && r.taxa < 50).length;
        const regioesRegular = regioesSaude.filter(r => r.taxa < 25).length;
        
        // Componentes com pior desempenho geral
        const componentesGerais = Array.from({ length: config?.indicatorCount || 11 }, (_, i) => {
            const sum = rawData.reduce((s, r) => s + (r['ind' + (i + 1)] || 0), 0);
            const total = rawData.reduce((s, r) => s + (r.totalPacientes || 0), 0);
            return { index: i + 1, name: config?.shortNames?.[i] || `C${i + 1}`, pct: total > 0 ? (sum / total) * 100 : 0 };
        }).sort((a, b) => a.pct - b.pct);
        
        // Regiões com projeção de atingir Ótimo
        const regioesComProjecao = regioesSaude.filter(r => r.mesesParaOtimo !== null && r.mesesParaOtimo > 0 && r.mesesParaOtimo <= 12);
        
        const RegionComparisonChart = () => {
            const ref = useRef(null), chart = useRef(null);
            useEffect(() => {
                if (!ref.current) return;
                chart.current?.destroy();
                chart.current = new Chart(ref.current, {
                    type: 'bar',
                    data: {
                        labels: regioesSaude.map(r => r.regiao),
                        datasets: [{
                            label: 'Boas Práticas',
                            data: regioesSaude.map(r => r.taxa),
                            backgroundColor: regioesSaude.map(r => r.cat.color),
                            borderRadius: 6
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true, max: 100 } }
                    }
                });
                return () => chart.current?.destroy();
            }, [regioesSaude]);
            return <canvas ref={ref}></canvas>;
        };
        
        const ProjectionChart = () => {
            const ref = useRef(null), chart = useRef(null);
            useEffect(() => {
                if (!ref.current || regioesComProjecao.length === 0) return;
                chart.current?.destroy();
                chart.current = new Chart(ref.current, {
                    type: 'bar',
                    data: {
                        labels: regioesComProjecao.map(r => r.regiao),
                        datasets: [{
                            label: 'Meses para Ótimo',
                            data: regioesComProjecao.map(r => r.mesesParaOtimo),
                            backgroundColor: '#3b82f6',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
                return () => chart.current?.destroy();
            }, [regioesComProjecao]);
            return <canvas ref={ref}></canvas>;
        };

        return (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <i className="fas fa-sitemap text-indigo-600"></i>
                            Gestão PlanificaSUS
                        </h1>
                        <p className="text-gray-500 mt-1">Análise comparativa entre UFs e Regionais de Saúde - {ufData.name}</p>
                    </div>
                    <div className="flex gap-2">
                        {['comparativo', 'projecoes', 'componentes', 'ranking'].map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                {mode === 'comparativo' ? 'Comparativo' : mode === 'projecoes' ? 'Projeções' : mode === 'componentes' ? 'Componentes' : 'Ranking'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Regiões Ótimo</p>
                                <p className="text-3xl font-bold">{regioesOtimo}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-trophy text-xl"></i>
                            </div>
                        </div>
                        <p className="text-green-100 text-xs mt-2">{((regioesOtimo / totalRegioes) * 100).toFixed(0)}% do total</p>
                    </div>
                    <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lime-100 text-sm">Regiões Bom</p>
                                <p className="text-3xl font-bold">{regioesBom}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-thumbs-up text-xl"></i>
                            </div>
                        </div>
                        <p className="text-lime-100 text-xs mt-2">{((regioesBom / totalRegioes) * 100).toFixed(0)}% do total</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm">Regiões Suficiente</p>
                                <p className="text-3xl font-bold">{regioesSuficiente}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle text-xl"></i>
                            </div>
                        </div>
                        <p className="text-amber-100 text-xs mt-2">{((regioesSuficiente / totalRegioes) * 100).toFixed(0)}% do total</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm">Regiões Regular</p>
                                <p className="text-3xl font-bold">{regioesRegular}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <i className="fas fa-times-circle text-xl"></i>
                            </div>
                        </div>
                        <p className="text-red-100 text-xs mt-2">{((regioesRegular / totalRegioes) * 100).toFixed(0)}% do total</p>
                    </div>
                </div>

                {viewMode === 'comparativo' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-chart-bar"></i> Comparativo por Região de Saúde</h3>
                            </div>
                            <div className="corp-card-body">
                                <div style={{ height: '400px' }}><RegionComparisonChart /></div>
                            </div>
                        </div>
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-list-ol"></i> Detalhamento por Região</h3>
                            </div>
                            <div className="corp-card-body max-h-96 overflow-y-auto">
                                <div className="space-y-3">
                                    {regioesSaude.map((r, i) => (
                                        <div key={r.regiao} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: r.cat.color }}>{i + 1}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{r.regiao}</p>
                                                        <p className="text-xs text-gray-500">{r.municipios} municípios • {r.equipes} equipes</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold" style={{ color: r.cat.color }}>{r.taxa.toFixed(2)}</p>
                                                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: r.cat.color }}>{r.cat.label}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className={r.tendencia >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    <i className={`fas fa-arrow-${r.tendencia >= 0 ? 'up' : 'down'} mr-1`}></i>
                                                    {r.tendencia >= 0 ? '+' : ''}{r.tendencia.toFixed(2)} tendência
                                                </span>
                                                {r.mesesParaOtimo !== null && r.mesesParaOtimo > 0 && (
                                                    <span className="text-blue-600">• ~{r.mesesParaOtimo} meses para Ótimo</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'projecoes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-chart-line"></i> Projeção para Atingir Ótimo</h3>
                            </div>
                            <div className="corp-card-body">
                                {regioesComProjecao.length > 0 ? (
                                    <div style={{ height: '350px' }}><ProjectionChart /></div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <i className="fas fa-chart-line text-4xl mb-3 opacity-30"></i>
                                        <p>Nenhuma região com projeção calculável</p>
                                        <p className="text-sm">Regiões já estão em Ótimo ou não há tendência positiva</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-bullseye"></i> Regiões Próximas do Ótimo</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {regioesSaude.filter(r => r.taxa >= 60 && r.taxa < 75).map(r => (
                                        <div key={r.regiao} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{r.regiao}</p>
                                                    <p className="text-sm text-gray-500">Faltam {(75 - r.taxa).toFixed(2)} pontos para Ótimo</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">{r.taxa.toFixed(2)}</p>
                                                    {r.mesesParaOtimo && <p className="text-xs text-blue-500">~{r.mesesParaOtimo} meses</p>}
                                                </div>
                                            </div>
                                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: `${(r.taxa / 75) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {regioesSaude.filter(r => r.taxa >= 60 && r.taxa < 75).length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <i className="fas fa-check-circle text-4xl mb-3 text-green-500"></i>
                                            <p>Nenhuma região entre 60-75</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="corp-card lg:col-span-2">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-flag-checkered"></i> Regiões que Já Atingiram Ótimo</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {regioesSaude.filter(r => r.taxa >= 75).map(r => (
                                        <div key={r.regiao} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                    <i className="fas fa-trophy text-white"></i>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{r.regiao}</p>
                                                    <p className="text-2xl font-bold text-green-600">{r.taxa.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {regioesSaude.filter(r => r.taxa >= 75).length === 0 && (
                                        <div className="col-span-3 text-center py-8 text-gray-500">
                                            <i className="fas fa-trophy text-4xl mb-3 opacity-30"></i>
                                            <p>Nenhuma região atingiu Ótimo ainda</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'componentes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-exclamation-circle text-red-500"></i> Componentes Críticos (Menor Desempenho)</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {componentesGerais.slice(0, 5).map((c, i) => {
                                        const cat = getCategoriaComponente(c.pct);
                                        return (
                                            <div key={c.index} className="p-4 bg-red-50 rounded-xl border border-red-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-red-500 text-white text-sm font-bold flex items-center justify-center">C{c.index}</span>
                                                        <p className="font-medium text-gray-800">{c.name}</p>
                                                    </div>
                                                    <span className="text-xl font-bold" style={{ color: cat.color }}>{c.pct.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: cat.color }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="corp-card">
                            <div className="corp-card-header">
                                <h3 className="corp-card-title"><i className="fas fa-check-circle text-green-500"></i> Componentes Destaque (Maior Desempenho)</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {[...componentesGerais].reverse().slice(0, 5).map((c, i) => {
                                        const cat = getCategoriaComponente(c.pct);
                                        return (
                                            <div key={c.index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-green-500 text-white text-sm font-bold flex items-center justify-center">C{c.index}</span>
                                                        <p className="font-medium text-gray-800">{c.name}</p>
                                                    </div>
                                                    <span className="text-xl font-bold" style={{ color: cat.color }}>{c.pct.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: cat.color }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'ranking' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="corp-card">
                            <div className="corp-card-header bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
                                <h3 className="font-bold flex items-center gap-2"><i className="fas fa-medal"></i> Top 5 Melhores</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {regioesSaude.slice(0, 5).map((r, i) => (
                                        <div key={r.regiao} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                            <span className="w-10 h-10 rounded-full bg-green-500 text-white font-bold flex items-center justify-center">{i + 1}º</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{r.regiao}</p>
                                                <p className="text-xs text-gray-500">{r.municipios} mun. • {r.equipes} eq.</p>
                                            </div>
                                            <p className="text-xl font-bold text-green-600">{r.taxa.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="corp-card">
                            <div className="corp-card-header bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-xl">
                                <h3 className="font-bold flex items-center gap-2"><i className="fas fa-chart-line"></i> Maior Evolução</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {[...regioesSaude].sort((a, b) => b.tendencia - a.tendencia).slice(0, 5).map((r, i) => (
                                        <div key={r.regiao} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                                            <span className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center">{i + 1}º</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{r.regiao}</p>
                                                <p className="text-xs text-gray-500">Taxa: {r.taxa.toFixed(2)}</p>
                                            </div>
                                            <p className="text-xl font-bold text-amber-600">+{r.tendencia.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="corp-card">
                            <div className="corp-card-header bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-xl">
                                <h3 className="font-bold flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> Atenção Prioritária</h3>
                            </div>
                            <div className="corp-card-body">
                                <div className="space-y-3">
                                    {[...regioesSaude].reverse().slice(0, 5).map((r, i) => (
                                        <div key={r.regiao} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                                            <span className="w-10 h-10 rounded-full bg-red-500 text-white font-bold flex items-center justify-center"><i className="fas fa-exclamation"></i></span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{r.regiao}</p>
                                                <p className="text-xs text-gray-500">{r.municipios} mun. • {r.equipes} eq.</p>
                                            </div>
                                            <p className="text-xl font-bold text-red-600">{r.taxa.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    
    // ========== REFLEXÕES DE IA - PLANIFICAÇÃO ==========
    const AIInsightsView = () => {
        const [activeCategory, setActiveCategory] = useState('organizacao');
        const m = calcMetrics();
        const ind = calcIndicators();
        
        const insights = {
            organizacao: [
                {
                    icon: 'fa-sitemap',
                    title: 'Organização da Demanda Espontânea',
                    content: 'Considere implementar o acolhimento com classificação de risco para otimizar o fluxo de pacientes. A estratificação permite priorizar casos urgentes e organizar agendas de forma mais eficiente.',
                    action: 'Mapear o fluxo atual de atendimento e identificar gargalos'
                },
                {
                    icon: 'fa-calendar-check',
                    title: 'Agenda Programada por Condição',
                    content: 'Estruture agendas específicas para grupos prioritários (gestantes, hipertensos, diabéticos). Isso facilita o acompanhamento longitudinal e melhora a adesão ao tratamento.',
                    action: 'Definir dias/horários específicos para cada grupo de condição'
                },
                {
                    icon: 'fa-route',
                    title: 'Fluxos de Referência e Contrarreferência',
                    content: 'Estabeleça protocolos claros de encaminhamento para a Atenção Especializada. A comunicação efetiva entre os pontos de atenção garante continuidade do cuidado.',
                    action: 'Criar matriz de critérios de encaminhamento por especialidade'
                }
            ],
            redes: [
                {
                    icon: 'fa-hospital',
                    title: 'Integração com Atenção Especializada',
                    content: 'Fortaleça a articulação com ambulatórios de especialidades e hospitais. Reuniões periódicas de matriciamento podem qualificar as equipes e reduzir encaminhamentos desnecessários.',
                    action: 'Agendar reuniões mensais de matriciamento com especialistas'
                },
                {
                    icon: 'fa-ambulance',
                    title: 'Articulação com Urgência e Emergência',
                    content: 'Defina critérios claros para acionamento do SAMU e encaminhamento para UPAs. Capacite a equipe para reconhecer sinais de alerta e agir rapidamente.',
                    action: 'Treinar equipe em protocolos de urgência e emergência'
                },
                {
                    icon: 'fa-pills',
                    title: 'Assistência Farmacêutica Integrada',
                    content: 'Garanta o abastecimento regular de medicamentos essenciais. A falta de medicamentos compromete a adesão ao tratamento e os resultados clínicos.',
                    action: 'Revisar lista de medicamentos e criar sistema de alerta de estoque'
                }
            ],
            territorio: [
                {
                    icon: 'fa-map-marked-alt',
                    title: 'Diagnóstico Territorial',
                    content: 'Realize mapeamento das vulnerabilidades e recursos do território. Conhecer a realidade local permite planejar ações mais assertivas e focadas nas necessidades reais.',
                    action: 'Atualizar mapa de riscos e recursos da área de abrangência'
                },
                {
                    icon: 'fa-users',
                    title: 'Participação Comunitária',
                    content: 'Envolva lideranças comunitárias e conselhos locais no planejamento. A participação social fortalece o vínculo e aumenta a efetividade das ações.',
                    action: 'Organizar reunião com lideranças para discutir prioridades'
                },
                {
                    icon: 'fa-handshake',
                    title: 'Parcerias Intersetoriais',
                    content: 'Articule com escolas, CRAS, igrejas e outras instituições. Ações intersetoriais ampliam o alcance e potencializam os resultados em saúde.',
                    action: 'Identificar parceiros potenciais e propor ações conjuntas'
                }
            ],
            processos: [
                {
                    icon: 'fa-clipboard-list',
                    title: 'Padronização de Protocolos',
                    content: 'Implemente protocolos clínicos baseados em evidências para as condições prioritárias. A padronização reduz variabilidade e melhora a qualidade do cuidado.',
                    action: 'Revisar e atualizar protocolos de atendimento da unidade'
                },
                {
                    icon: 'fa-chart-line',
                    title: 'Monitoramento Contínuo',
                    content: 'Estabeleça rotina de análise dos indicadores com a equipe. O acompanhamento regular permite identificar problemas precocemente e ajustar estratégias.',
                    action: 'Criar reunião mensal de análise de indicadores com a equipe'
                },
                {
                    icon: 'fa-graduation-cap',
                    title: 'Educação Permanente',
                    content: 'Promova momentos de capacitação e discussão de casos. A educação permanente mantém a equipe atualizada e engajada na melhoria contínua.',
                    action: 'Planejar cronograma de capacitações para o próximo trimestre'
                }
            ]
        };
        
        const categories = [
            { key: 'organizacao', label: 'Organização do Processo de Trabalho', icon: 'fa-cogs' },
            { key: 'redes', label: 'Redes de Atenção à Saúde', icon: 'fa-project-diagram' },
            { key: 'territorio', label: 'Territorialização', icon: 'fa-map' },
            { key: 'processos', label: 'Melhoria de Processos', icon: 'fa-sync-alt' }
        ];
        
        return (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Reflexões para Planificação</h1>
                        <p className="text-gray-500">Insights estratégicos baseados no contexto do PlanificaSUS</p>
                    </div>
                    <a href="https://planificasus.com.br/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <i className="fas fa-external-link-alt mr-2"></i>Acessar e-Planifica
                    </a>
                </div>
                
                {/* Banner Informativo */}
                <div className="corp-card corp-card-accent blue mb-6">
                    <div className="corp-card-body">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-lightbulb text-white text-2xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Sobre esta seção</h3>
                                <p className="text-gray-600">Esta área traz reflexões inspiradas na metodologia do <strong>PlanificaSUS</strong>, projeto do PROADI-SUS que apoia a organização das Redes de Atenção à Saúde. Use estes insights como ponto de partida para pensar em ações estratégicas na sua realidade local.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Categorias */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(cat => (
                        <button 
                            key={cat.key} 
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeCategory === cat.key ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            <i className={`fas ${cat.icon}`}></i>
                            <span className="hidden sm:inline">{cat.label}</span>
                        </button>
                    ))}
                </div>
                
                {/* Cards de Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {insights[activeCategory].map((insight, idx) => (
                        <div key={idx} className="corp-card hover:shadow-xl transition-all">
                            <div className="p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                                    <i className={`fas ${insight.icon} text-white text-xl`}></i>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 mb-3">{insight.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{insight.content}</p>
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800">
                                        <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                                        <strong>Ação sugerida:</strong> {insight.action}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Seção de Contexto */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="corp-card">
                        <div className="corp-card-header">
                            <h3 className="corp-card-title"><i className="fas fa-info-circle"></i>Sobre o PlanificaSUS</h3>
                        </div>
                        <div className="corp-card-body">
                            <p className="text-gray-600 mb-4">O PlanificaSUS é um projeto do PROADI-SUS que apoia estados e municípios na organização das Redes de Atenção à Saúde, com foco na Atenção Primária.</p>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">19</p>
                                    <p className="text-xs text-gray-500">Unidades Federativas</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">733</p>
                                    <p className="text-xs text-gray-500">Municípios</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">4.069</p>
                                    <p className="text-xs text-gray-500">Unidades APS</p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <p className="text-2xl font-bold text-amber-600">55</p>
                                    <p className="text-xs text-gray-500">Regiões de Saúde</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="corp-card">
                        <div className="corp-card-header">
                            <h3 className="corp-card-title"><i className="fas fa-chart-pie"></i>Seu Contexto Atual</h3>
                        </div>
                        <div className="corp-card-body">
                            <p className="text-gray-600 mb-4">Use os dados do seu território para direcionar as reflexões:</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Boas Práticas</span>
                                    <span className="font-bold text-blue-600">{m.taxa.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Total de Pacientes</span>
                                    <span className="font-bold text-purple-600">{m.totalPacientes.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Equipes Ativas</span>
                                    <span className="font-bold text-green-600">{m.equipes}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Componente com menor %</span>
                                    <span className="font-bold text-amber-600">{ind.length > 0 ? `C${ind.sort((a,b) => a.pct - b.pct)[0].index}` : '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const DataCollectionView = () => {
        const [uploadedFiles, setUploadedFiles] = useState([]);
        const [selectedUF, setSelectedUF] = useState('');
        const [selectedRegiao, setSelectedRegiao] = useState('');
        const [processing, setProcessing] = useState(false);
        const [processedData, setProcessedData] = useState([]);
        const [errors, setErrors] = useState([]);
        const [successMessage, setSuccessMessage] = useState('');
        const [showPreview, setShowPreview] = useState(false);
        const [existingData, setExistingData] = useState([]);
        const [availableRegioes, setAvailableRegioes] = useState([]);
        const [duplicateRecords, setDuplicateRecords] = useState([]);
        const [selectedDuplicates, setSelectedDuplicates] = useState({});
        const fileInputRef = useRef(null);

        const UF_OPTIONS = [
            { value: 'AC', label: 'Acre' },
            { value: 'AL', label: 'Alagoas' },
            { value: 'AP', label: 'Amapá' },
            { value: 'AM', label: 'Amazonas' },
            { value: 'BA', label: 'Bahia' },
            { value: 'CE', label: 'Ceará' },
            { value: 'DF', label: 'Distrito Federal' },
            { value: 'ES', label: 'Espírito Santo' },
            { value: 'GO', label: 'Goiás' },
            { value: 'MA', label: 'Maranhão' },
            { value: 'MT', label: 'Mato Grosso' },
            { value: 'MS', label: 'Mato Grosso do Sul' },
            { value: 'MG', label: 'Minas Gerais' },
            { value: 'PA', label: 'Pará' },
            { value: 'PB', label: 'Paraíba' },
            { value: 'PR', label: 'Paraná' },
            { value: 'PE', label: 'Pernambuco' },
            { value: 'PI', label: 'Piauí' },
            { value: 'RJ', label: 'Rio de Janeiro' },
            { value: 'RN', label: 'Rio Grande do Norte' },
            { value: 'RS', label: 'Rio Grande do Sul' },
            { value: 'RO', label: 'Rondônia' },
            { value: 'RR', label: 'Roraima' },
            { value: 'SC', label: 'Santa Catarina' },
            { value: 'SP', label: 'São Paulo' },
            { value: 'SE', label: 'Sergipe' },
            { value: 'TO', label: 'Tocantins' }
        ];

        // Extrair UFs e regiões de saúde dos dados carregados
        // Confirmação: Temos 3 bancos - Gestantes, Diabetes e Hipertensão
        // Cada banco tem suas próprias regiões disponíveis
        const availableUFs = rawData && rawData.length > 0 
            ? [...new Set(rawData.map(r => {
                // Extrair UF do estado selecionado no dashboard
                if (selectedState === 'rn') return 'RN';
                if (selectedState === 'acre') return 'AC';
                if (selectedState === 'am') return 'AM';
                return '';
            }).filter(Boolean))]
            : [];

        useEffect(() => {
            if (rawData && rawData.length > 0) {
                const regioes = [...new Set(rawData.map(r => r.regiao).filter(r => r && r.trim()))].sort();
                setAvailableRegioes(regioes);
            }
        }, [rawData]);

        const isAdmin = user?.cargo?.toLowerCase().includes('admin') || user?.cargo?.toLowerCase().includes('gestor') || user?.cargo?.toLowerCase().includes('coordenador');

        const handleFileSelect = (e) => {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
            if (validFiles.length !== files.length) {
                setErrors(prev => [...prev, 'Alguns arquivos foram ignorados. Apenas arquivos .xlsx e .xls são aceitos.']);
            }
            setUploadedFiles(prev => [...prev, ...validFiles.map(f => ({ file: f, status: 'pending', name: f.name }))]);
            setShowPreview(false);
            setProcessedData([]);
        };

        const removeFile = (index) => {
            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
            setShowPreview(false);
            setProcessedData([]);
        };

        const detectIndicatorFromContent = (grupoText) => {
            const text = (grupoText || '').toLowerCase();
            // Gestantes: detectar "gestante", "puérpera", "pré-natal", "gestação", "puerpério"
            if (text.includes('gestante') || text.includes('puérpera') || text.includes('pré-natal') || 
                text.includes('gestação') || text.includes('puerpério') || text.includes('puerperio')) {
                return { key: 'gestantes', name: 'Gestantes e Puérperas' };
            }
            if (text.includes('diabetes') || text.includes('diabético') || text.includes('diabetico')) {
                return { key: 'dm', name: 'Diabetes' };
            }
            if (text.includes('hipertens') || text.includes('pressão arterial') || text.includes('pressao arterial')) {
                return { key: 'has', name: 'Hipertensão' };
            }
            return null;
        };

        // Converter competência do formato "JUN/25" para "Junho"
        const parseCompetencia = (text) => {
            const mesesAbrev = {
                'JAN': 'Janeiro', 'FEV': 'Fevereiro', 'MAR': 'Março', 'ABR': 'Abril',
                'MAI': 'Maio', 'JUN': 'Junho', 'JUL': 'Julho', 'AGO': 'Agosto',
                'SET': 'Setembro', 'OUT': 'Outubro', 'NOV': 'Novembro', 'DEZ': 'Dezembro'
            };
            // Padrão JUN/25, JAN/25, etc
            const matchAbrev = text.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/?\d{0,2}\b/i);
            if (matchAbrev) {
                const mes = matchAbrev[1].toUpperCase();
                return mesesAbrev[mes] || text;
            }
            // Padrão completo: Janeiro, Fevereiro, etc
            const mesesCompletos = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                                    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
            for (const mes of mesesCompletos) {
                if (text.toLowerCase().includes(mes)) {
                    return mes.charAt(0).toUpperCase() + mes.slice(1);
                }
            }
            return text;
        };

        const parseExcelFile = async (fileObj) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                        
                        if (jsonData.length < 17) {
                            reject({ file: fileObj.name, error: 'Arquivo não possui linhas suficientes. Esperado pelo menos 17 linhas.' });
                            return;
                        }

                        // Linha 9 (índice 8) = UF, Linha 10 (índice 9) = Município
                        // Linha 13 (índice 12) = Grupo do Indicador, Linha 14 (índice 13) = Competência
                        const ufRow = jsonData[8] || [];
                        const municipioRow = jsonData[9] || [];
                        const grupoRow = jsonData[12] || [];
                        const competenciaRow = jsonData[13] || [];
                        const headersRow = jsonData[15] || [];

                        // Extrair UF da linha 9 (formato: "UF: RN" ou "UF: AC")
                        let ufArquivo = '';
                        for (const cell of ufRow) {
                            const cellStr = String(cell).trim().toUpperCase();
                            // Procurar por siglas de UF conhecidas
                            if (cellStr.includes('RN') || cellStr.includes('NORTE')) {
                                ufArquivo = 'RN';
                                break;
                            } else if (cellStr.includes('AC') || cellStr.includes('ACRE')) {
                                ufArquivo = 'AC';
                                break;
                            } else if (cellStr.includes('AM') || cellStr.includes('AMAZONAS')) {
                                ufArquivo = 'AM';
                                break;
                            } else if (cellStr.match(/\b[A-Z]{2}\b/)) {
                                // Capturar qualquer sigla de 2 letras
                                const match = cellStr.match(/\b([A-Z]{2})\b/);
                                if (match) {
                                    ufArquivo = match[1];
                                    break;
                                }
                            }
                        }

                        // Extrair município da linha 10 (formato: "Município: 240570 / JARDIM DO SERIDÓ")
                        let municipio = '';
                        for (const cell of municipioRow) {
                            const cellStr = String(cell).trim();
                            if (cellStr.includes('/')) {
                                // Pegar apenas a parte após a barra
                                const parts = cellStr.split('/');
                                if (parts.length >= 2) {
                                    municipio = parts[parts.length - 1].trim();
                                    break;
                                }
                            } else if (cellStr.toLowerCase().includes('município') || cellStr.length > 5) {
                                municipio = cellStr.replace(/município:?\s*/i, '').trim();
                                break;
                            }
                        }

                        // Extrair grupo/indicador da linha 13
                        let grupoText = '';
                        for (const cell of grupoRow) {
                            if (typeof cell === 'string' && cell.length > 3) {
                                grupoText = cell.trim();
                                break;
                            }
                        }

                        // Detectar tipo de indicador pelo conteúdo da linha 13
                        const indicatorInfo = detectIndicatorFromContent(grupoText);
                        if (!indicatorInfo) {
                            reject({ file: fileObj.name, error: `Não foi possível identificar o tipo de indicador na linha 13. Conteúdo encontrado: "${grupoText}"` });
                            return;
                        }

                        // Extrair competência da linha 14
                        let competenciaRaw = '';
                        for (const cell of competenciaRow) {
                            const cellStr = String(cell).trim();
                            // Procurar por padrões de data/mês: JUN/25, JAN/25, 2024-01, Janeiro, etc
                            if (cellStr.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/?\d{0,2}\b/i) ||
                                cellStr.match(/\d{4}-\d{2}/) || cellStr.match(/\d{2}\/\d{4}/) || 
                                cellStr.match(/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i)) {
                                competenciaRaw = cellStr;
                                break;
                            }
                        }
                        // Se não encontrou, tentar pegar qualquer texto significativo
                        if (!competenciaRaw) {
                            for (const cell of competenciaRow) {
                                const cellStr = String(cell).trim();
                                if (cellStr.length >= 3 && cellStr.length <= 50 && !cellStr.match(/^[\d\s]+$/)) {
                                    // Extrair apenas a parte do mês se houver "Competência selecionada: JUN/25"
                                    const matchComp = cellStr.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/?\d{0,2}\b/i);
                                    if (matchComp) {
                                        competenciaRaw = matchComp[0];
                                    } else {
                                        competenciaRaw = cellStr;
                                    }
                                    break;
                                }
                            }
                        }
                        // Converter para formato legível (JUN/25 -> Junho)
                        const competencia = parseCompetencia(competenciaRaw);

                        // Extrair dados da tabela (a partir da linha 17, índice 16)
                        // Linha 16 (índice 15) é o cabeçalho - manter como referência
                        // Linha 17+ (índice 16+) são os dados
                        const allRows = jsonData.slice(16);
                        
                        // Filtrar: linhas em branco e linha com "Fonte:" no início
                        const tableData = allRows.filter(row => {
                            // Verificar se a linha tem conteúdo significativo
                            const hasContent = row.some(cell => cell !== '' && cell !== null && cell !== undefined);
                            if (!hasContent) return false;
                            
                            // Verificar se é linha de fonte de dados (ignorar)
                            const firstCell = String(row[0] || '').toLowerCase().trim();
                            if (firstCell.startsWith('fonte:') || firstCell.startsWith('fonte ')) return false;
                            
                            // Verificar se a primeira célula é vazia
                            const firstCellValue = String(row[0] || '').trim();
                            if (firstCellValue === '') return false;
                            
                            // Verificar se é um código numérico (CNES válido) - deve ser número
                            if (!/^\d+$/.test(firstCellValue)) return false;
                            
                            return true;
                        });
                        
                        if (tableData.length === 0) {
                            reject({ file: fileObj.name, error: 'Nenhum dado encontrado na tabela (a partir da linha 17).' });
                            return;
                        }

                        resolve({
                            file: fileObj.name,
                            indicatorKey: indicatorInfo.key,
                            indicatorName: indicatorInfo.name,
                            ufArquivo: ufArquivo,
                            municipio: municipio,
                            competencia: competencia || 'Não identificada',
                            grupo: grupoText,
                            rowCount: tableData.length,
                            tableData,
                            headers: headersRow,
                            status: 'success',
                            sampleRows: tableData.slice(0, 5) // Primeiras 5 linhas para preview
                        });
                    } catch (err) {
                        reject({ file: fileObj.name, error: 'Erro ao processar arquivo: ' + err.message });
                    }
                };
                reader.onerror = () => reject({ file: fileObj.name, error: 'Erro ao ler arquivo.' });
                reader.readAsArrayBuffer(fileObj.file);
            });
        };

        // Verificar se há dados existentes na região selecionada
        const checkRegionHasData = (regiao) => {
            return rawData.some(r => r.regiao === regiao);
        };

        // Verificar duplicados entre novos dados e base existente
        const checkDuplicates = (fileData) => {
            const duplicates = [];
            const validRows = [];
            
            for (let i = 0; i < fileData.tableData.length; i++) {
                const row = fileData.tableData[i];
                const cnes = String(row[0] || '').trim();
                const estabelecimento = String(row[1] || '').trim();
                const equipe = String(row[4] || '').trim();
                const somatorio = row[row.length - 3] || '';
                const total = row[row.length - 2] || '';
                let taxa = row[row.length - 1] || '';
                if (typeof taxa === 'string') taxa = taxa.replace(',', '.');
                
                // Verificar se já existe na base com mesmo CNES, competência e região
                const existingRecord = rawData.find(existing => 
                    existing.cnes === cnes && 
                    existing.competencia === fileData.competencia &&
                    existing.regiao === fileData.regiao
                );
                
                if (existingRecord) {
                    duplicates.push({ 
                        id: `${fileData.file}-${i}`,
                        cnes, 
                        estabelecimento,
                        equipe,
                        somatorio,
                        total,
                        taxa,
                        competencia: fileData.competencia,
                        regiao: fileData.regiao,
                        municipio: fileData.municipio,
                        existingRecord,
                        row,
                        action: 'skip' // default: pular
                    });
                } else {
                    validRows.push(row);
                }
            }
            
            return { duplicates, validRows };
        };

        const processFiles = async () => {
            if (!selectedRegiao) {
                setErrors(['Por favor, selecione a Região de Saúde antes de processar os arquivos.']);
                return;
            }
            
            // Verificar se a região selecionada tem dados na base atual
            if (!checkRegionHasData(selectedRegiao)) {
                setErrors([`A região "${selectedRegiao}" não possui dados na base atual do indicador ${config?.title || 'selecionado'}. Selecione uma região que já tenha dados cadastrados.`]);
                return;
            }
            
            if (uploadedFiles.length === 0) {
                setErrors(['Nenhum arquivo selecionado para processamento.']);
                return;
            }

            setProcessing(true);
            setErrors([]);
            setProcessedData([]);
            setSuccessMessage('');
            setShowPreview(false);
            setDuplicateRecords([]);
            setSelectedDuplicates({});

            const results = [];
            const newErrors = [];
            const duplicateWarnings = [];
            const allDuplicates = [];

            for (const fileObj of uploadedFiles) {
                try {
                    const result = await parseExcelFile(fileObj);
                    result.regiao = selectedRegiao;
                    
                    // Verificar se o indicador do arquivo corresponde ao indicador atual do dashboard
                    if (result.indicatorKey !== indicatorType) {
                        const indicadorArquivo = result.indicatorName || result.indicatorKey;
                        const indicadorAtual = config?.title || indicatorType;
                        newErrors.push(`${result.file}: O arquivo contém dados de "${indicadorArquivo}", mas a base atual é de "${indicadorAtual}". Não é possível inserir dados de indicadores diferentes.`);
                        setUploadedFiles(prev => prev.map(f => f.name === fileObj.name ? { ...f, status: 'error', error: `Indicador incompatível: ${indicadorArquivo}` } : f));
                        continue;
                    }
                    
                    // Verificar se a UF do ARQUIVO corresponde à UF da base atual do dashboard
                    const ufBase = selectedState === 'rn' ? 'RN' : selectedState === 'acre' ? 'AC' : selectedState === 'am' ? 'AM' : '';
                    const ufArquivo = result.ufArquivo || '';
                    
                    if (!ufArquivo) {
                        newErrors.push(`${result.file}: Não foi possível identificar a UF na linha 9 do arquivo.`);
                        setUploadedFiles(prev => prev.map(f => f.name === fileObj.name ? { ...f, status: 'error', error: 'UF não identificada no arquivo' } : f));
                        continue;
                    }
                    
                    if (ufArquivo !== ufBase) {
                        newErrors.push(`${result.file}: O arquivo contém dados de "${ufArquivo}", mas a base atual é de "${ufBase}". Não é possível inserir dados de UFs diferentes.`);
                        setUploadedFiles(prev => prev.map(f => f.name === fileObj.name ? { ...f, status: 'error', error: `UF incompatível: arquivo ${ufArquivo} ≠ base ${ufBase}` } : f));
                        continue;
                    }
                    
                    // Usar a UF extraída do arquivo
                    result.uf = ufArquivo;
                    
                    // Verificar duplicados
                    const { duplicates, validRows } = checkDuplicates(result);
                    
                    // Armazenar duplicados para permitir seleção do usuário
                    if (duplicates.length > 0) {
                        allDuplicates.push(...duplicates);
                        duplicateWarnings.push(`${result.file}: ${duplicates.length} registro(s) duplicado(s) encontrado(s).`);
                    }
                    
                    // Atualizar resultado com registros válidos
                    result.tableData = validRows;
                    result.rowCount = validRows.length;
                    result.sampleRows = validRows.slice(0, 5);
                    result.duplicatesFound = duplicates.length;
                    result.allTableData = [...validRows]; // Guardar para possível adição de subscritos
                    results.push(result);
                    setUploadedFiles(prev => prev.map(f => f.name === fileObj.name ? { ...f, status: duplicates.length > 0 ? 'warning' : 'success' } : f));
                } catch (err) {
                    newErrors.push(`${err.file}: ${err.error}`);
                    setUploadedFiles(prev => prev.map(f => f.name === fileObj.name ? { ...f, status: 'error', error: err.error } : f));
                }
            }

            setProcessedData(results);
            setDuplicateRecords(allDuplicates);
            
            // Inicializar ações dos duplicados como 'skip' por padrão
            const initialActions = {};
            allDuplicates.forEach(d => { initialActions[d.id] = 'skip'; });
            setSelectedDuplicates(initialActions);
            
            setErrors([...newErrors, ...duplicateWarnings]);
            setProcessing(false);

            if (results.length > 0 || allDuplicates.length > 0) {
                setShowPreview(true);
                const totalNew = results.reduce((s, r) => s + r.rowCount, 0);
                const totalDuplicates = allDuplicates.length;
                let msg = `${results.length} arquivo(s) processado(s)! ${totalNew} registro(s) novo(s) encontrado(s).`;
                if (totalDuplicates > 0) {
                    msg += ` ${totalDuplicates} duplicado(s) encontrado(s) - escolha a ação para cada um.`;
                }
                msg += ' Verifique a prévia abaixo antes de confirmar.';
                setSuccessMessage(msg);
            }
        };

        const confirmAndSave = () => {
            const existingImports = JSON.parse(localStorage.getItem('gdiaps_imported_data') || '[]');
            const newImports = processedData.map(d => ({
                ...d,
                importedAt: new Date().toISOString(),
                importedBy: user?.name || 'Anônimo'
            }));
            localStorage.setItem('gdiaps_imported_data', JSON.stringify([...existingImports, ...newImports]));
            setSuccessMessage('Dados inseridos com sucesso na base!');
            setUploadedFiles([]);
            setProcessedData([]);
            setShowPreview(false);
        };

        if (!user) {
            return (
                <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                        <i className="fas fa-lock text-white text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
                    <p className="text-gray-500 mb-6">Faça login para acessar a coleta de dados</p>
                    <button onClick={() => { setAuthMode('login'); setAuthModal(true); }} className="btn-primary">
                        <i className="fas fa-sign-in-alt mr-2"></i>Entrar
                    </button>
                </div>
            );
        }

        if (!isAdmin) {
            return (
                <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6">
                        <i className="fas fa-user-shield text-white text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Permissão Negada</h2>
                    <p className="text-gray-500 mb-2">Apenas administradores podem acessar esta área.</p>
                    <p className="text-sm text-gray-400">Seu cargo atual: <span className="font-medium">{user?.cargo || 'Não definido'}</span></p>
                    <p className="text-xs text-gray-400 mt-4">Cargos permitidos: Administrador, Gestor, Coordenador</p>
                </div>
            );
        }

        return (
            <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Coleta de Dados</h1>
                        <p className="text-gray-500">Importe relatórios do SIAPS para o sistema</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                        <i className="fas fa-shield-alt"></i>
                        <span className="font-medium">Administrador</span>
                    </div>
                </div>

                {/* Info do indicador atual */}
                <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <i className="fas fa-database text-white text-xl"></i>
                        </div>
                        <div>
                            <p className="text-sm text-blue-600">Base de dados atual</p>
                            <p className="font-bold text-blue-800">{config?.title || 'Nenhum indicador selecionado'}</p>
                            <p className="text-xs text-blue-500">
                                {selectedState === 'rn' ? 'Rio Grande do Norte (RN)' : selectedState === 'acre' ? 'Acre (AC)' : selectedState === 'am' ? 'Amazonas (AM)' : 'Estado não selecionado'}
                                {' • '}{rawData.length} registros na base
                            </p>
                        </div>
                    </div>
                </div>

                {/* Configuração de Região */}
                <div className="card p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-cog text-blue-500"></i>
                        Configuração da Importação
                    </h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-amber-700">
                            <i className="fas fa-info-circle mr-2"></i>
                            <strong>Validação automática:</strong> A UF e o tipo de indicador serão extraídos automaticamente do arquivo Excel e validados contra a base atual.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-map-marked-alt mr-1"></i> Região de Saúde (destino dos dados)
                        </label>
                        <select 
                            className="input-field" 
                            value={selectedRegiao} 
                            onChange={e => setSelectedRegiao(e.target.value)}
                        >
                            <option value="">Selecione a Região...</option>
                            {availableRegioes.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        {availableRegioes.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                                <i className="fas fa-check-circle mr-1"></i>
                                {availableRegioes.length} região(ões) disponível(is) na base atual
                            </p>
                        )}
                    </div>
                </div>

                {/* Área de Upload */}
                <div className="card p-6 mb-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fas fa-cloud-upload-alt text-purple-500"></i>
                        Upload de Arquivos
                    </h3>
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                        onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); handleFileSelect({ target: { files: e.dataTransfer.files } }); }}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple 
                            accept=".xlsx,.xls" 
                            className="hidden" 
                            onChange={handleFileSelect}
                        />
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-file-excel text-white text-2xl"></i>
                        </div>
                        <p className="text-lg font-medium text-gray-700">Arraste arquivos aqui ou clique para selecionar</p>
                        <p className="text-sm text-gray-500 mt-2">Aceita múltiplos arquivos .xlsx ou .xls do SIAPS</p>
                        <p className="text-xs text-gray-400 mt-1">Formatos: Relatório Visão Competência (Gestantes, Diabetes, Hipertensão)</p>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">{uploadedFiles.length} arquivo(s) selecionado(s):</p>
                            {uploadedFiles.map((f, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${f.status === 'success' ? 'bg-green-50 border border-green-200' : f.status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <i className={`fas ${f.status === 'success' ? 'fa-check-circle text-green-500' : f.status === 'error' ? 'fa-times-circle text-red-500' : 'fa-file-excel text-green-600'}`}></i>
                                        <div>
                                            <p className="font-medium text-sm">{f.name}</p>
                                            {f.error && <p className="text-xs text-red-500">{f.error}</p>}
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {errors.length > 0 && (
                    <div className="card p-4 mb-6 bg-red-50 border border-red-200">
                        <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                            <i className="fas fa-exclamation-triangle"></i>
                            Erros encontrados
                        </h4>
                        <ul className="space-y-1">
                            {errors.map((err, i) => (
                                <li key={i} className="text-sm text-red-600"><i className="fas fa-times mr-1"></i>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {successMessage && (
                    <div className="card p-4 mb-6 bg-green-50 border border-green-200">
                        <p className="text-green-700 font-medium flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* Prévia dos dados */}
                {showPreview && processedData.length > 0 && (
                    <div className="card p-6 mb-6 border-2 border-blue-300">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-800">
                            <i className="fas fa-eye"></i>
                            Prévia da Inserção de Dados
                        </h3>
                        
                        {/* Resumo dos arquivos processados */}
                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-blue-800 mb-3">Arquivos a serem inseridos:</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-blue-100">
                                            <th className="px-4 py-2 text-left">Arquivo</th>
                                            <th className="px-4 py-2 text-left">Indicador</th>
                                            <th className="px-4 py-2 text-left">Competência</th>
                                            <th className="px-4 py-2 text-left">UF</th>
                                            <th className="px-4 py-2 text-left">Região</th>
                                            <th className="px-4 py-2 text-center">Registros</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedData.map((d, i) => (
                                            <tr key={i} className="border-t border-blue-200 bg-green-50">
                                                <td className="px-4 py-3 font-medium">{d.file}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
                                                        {d.indicatorName}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-green-700">{d.competencia}</td>
                                                <td className="px-4 py-3">{d.uf}</td>
                                                <td className="px-4 py-3">{d.regiao}</td>
                                                <td className="px-4 py-3 text-center font-bold text-green-600">{d.rowCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Visualização combinada: Base atual + Novos dados */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <i className="fas fa-database text-blue-500"></i>
                                Visualização da Base de Dados Após Inserção
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                <i className="fas fa-info-circle mr-1"></i>
                                Linhas em <span className="bg-green-100 text-green-700 px-1 rounded">verde</span> são os novos dados que serão inseridos. 
                                Linhas em branco são dados já existentes na base.
                            </p>
                            <div className="overflow-x-auto border-2 border-blue-300 rounded-lg">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-blue-100">
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Status</th>
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Município</th>
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Região</th>
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Competência</th>
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Equipe</th>
                                            <th className="px-3 py-2 text-left font-bold text-blue-800">Estabelecimento</th>
                                            <th className="px-3 py-2 text-center font-bold text-blue-800">Somatório</th>
                                            <th className="px-3 py-2 text-center font-bold text-blue-800">Total</th>
                                            <th className="px-3 py-2 text-center font-bold text-blue-800">Taxa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Dados existentes - filtrados pela região selecionada */}
                                        {rawData.filter(r => r.regiao === selectedRegiao).slice(0, 3).map((row, i) => (
                                            <tr key={`existing-${i}`} className="border-t border-gray-200 bg-white hover:bg-gray-50">
                                                <td className="px-3 py-2"><span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Existente</span></td>
                                                <td className="px-3 py-2 font-medium">{row.municipio || '-'}</td>
                                                <td className="px-3 py-2">{row.regiao || '-'}</td>
                                                <td className="px-3 py-2">{row.competencia || '-'}</td>
                                                <td className="px-3 py-2 truncate max-w-[120px]">{row.estabelecimento || '-'}</td>
                                                <td className="px-3 py-2 truncate max-w-[150px]">{row.estabelecimento || '-'}</td>
                                                <td className="px-3 py-2 text-center">{row.somatorio?.toLocaleString() || '-'}</td>
                                                <td className="px-3 py-2 text-center">{row.totalPacientes?.toLocaleString() || '-'}</td>
                                                <td className="px-3 py-2 text-center font-medium">{row.somatorio && row.totalPacientes ? (row.somatorio / row.totalPacientes).toFixed(2) : '-'}</td>
                                            </tr>
                                        ))}
                                        {/* Separador visual */}
                                        <tr className="bg-gradient-to-r from-green-200 to-green-100">
                                            <td colSpan="9" className="px-3 py-2 text-center text-green-800 font-bold text-sm">
                                                <i className="fas fa-arrow-down mr-2"></i>
                                                NOVOS DADOS A SEREM INSERIDOS ({processedData.reduce((s, d) => s + d.rowCount, 0)} registros)
                                                <i className="fas fa-arrow-down ml-2"></i>
                                            </td>
                                        </tr>
                                        {/* Novos dados de cada arquivo */}
                                        {processedData.map((fileData, fileIdx) => (
                                            fileData.sampleRows.map((row, rowIdx) => {
                                                // Mapear colunas do Excel para formato da base
                                                const estabelecimento = row[1] || '';
                                                const equipe = row[4] || '';
                                                const somatorio = row[row.length - 3] || '';
                                                const total = row[row.length - 2] || '';
                                                // Padronizar taxa: converter vírgula para ponto
                                                let taxa = row[row.length - 1] || '';
                                                if (typeof taxa === 'string') {
                                                    taxa = taxa.replace(',', '.');
                                                }
                                                const taxaFormatada = typeof taxa === 'number' ? taxa.toFixed(2) : (parseFloat(String(taxa).replace(',', '.')) || 0).toFixed(2);
                                                return (
                                                    <tr key={`new-${fileIdx}-${rowIdx}`} className="border-t border-green-300 bg-green-50 hover:bg-green-100">
                                                        <td className="px-3 py-2"><span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-medium">NOVO</span></td>
                                                        <td className="px-3 py-2 font-medium text-green-800">{fileData.municipio || '-'}</td>
                                                        <td className="px-3 py-2 text-green-700">{fileData.regiao}</td>
                                                        <td className="px-3 py-2 text-green-700 font-medium">{fileData.competencia}</td>
                                                        <td className="px-3 py-2 truncate max-w-[120px] text-green-700">{equipe}</td>
                                                        <td className="px-3 py-2 truncate max-w-[150px] text-green-700">{estabelecimento}</td>
                                                        <td className="px-3 py-2 text-center text-green-700">{somatorio}</td>
                                                        <td className="px-3 py-2 text-center text-green-700">{total}</td>
                                                        <td className="px-3 py-2 text-center font-medium text-green-800">{taxaFormatada}</td>
                                                    </tr>
                                                );
                                            })
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                    <i className="fas fa-chart-bar mr-1"></i>
                                    Base atual: {rawData.length} registros → Após inserção: {rawData.length + processedData.reduce((s, d) => s + d.rowCount, 0) + Object.values(selectedDuplicates).filter(a => a === 'overwrite').length} registros
                                </p>
                                <p className="text-xs text-green-600 font-medium">
                                    <i className="fas fa-plus-circle mr-1"></i>
                                    +{processedData.reduce((s, d) => s + d.rowCount, 0)} novos registros
                                    {Object.values(selectedDuplicates).filter(a => a === 'overwrite').length > 0 && (
                                        <span className="text-amber-600 ml-2">
                                            <i className="fas fa-sync-alt mr-1"></i>
                                            {Object.values(selectedDuplicates).filter(a => a === 'overwrite').length} a subscrever
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Gerenciamento de Duplicados */}
                        {duplicateRecords.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-copy text-amber-500"></i>
                                    Registros Duplicados Encontrados ({duplicateRecords.length})
                                </h4>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-amber-700">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        Os registros abaixo já existem na base. Escolha a ação para cada um:
                                        <strong> Pular</strong> (manter o existente) ou <strong>Subscrever</strong> (atualizar com o novo).
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => {
                                                const newActions = {};
                                                duplicateRecords.forEach(d => { newActions[d.id] = 'skip'; });
                                                setSelectedDuplicates(newActions);
                                            }}
                                            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded"
                                        >
                                            <i className="fas fa-ban mr-1"></i> Pular Todos
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const newActions = {};
                                                duplicateRecords.forEach(d => { newActions[d.id] = 'overwrite'; });
                                                setSelectedDuplicates(newActions);
                                            }}
                                            className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-700 px-3 py-1 rounded"
                                        >
                                            <i className="fas fa-sync-alt mr-1"></i> Subscrever Todos
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto border-2 border-amber-300 rounded-lg max-h-64 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0">
                                            <tr className="bg-amber-100">
                                                <th className="px-3 py-2 text-left font-bold text-amber-800">Ação</th>
                                                <th className="px-3 py-2 text-left font-bold text-amber-800">CNES</th>
                                                <th className="px-3 py-2 text-left font-bold text-amber-800">Estabelecimento</th>
                                                <th className="px-3 py-2 text-left font-bold text-amber-800">Competência</th>
                                                <th className="px-3 py-2 text-center font-bold text-amber-800">Somatório (Atual → Novo)</th>
                                                <th className="px-3 py-2 text-center font-bold text-amber-800">Taxa (Atual → Novo)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {duplicateRecords.map((dup, i) => (
                                                <tr key={dup.id} className={`border-t border-amber-200 ${selectedDuplicates[dup.id] === 'overwrite' ? 'bg-amber-100' : 'bg-white'} hover:bg-amber-50`}>
                                                    <td className="px-3 py-2">
                                                        <select 
                                                            value={selectedDuplicates[dup.id] || 'skip'}
                                                            onChange={e => setSelectedDuplicates(prev => ({ ...prev, [dup.id]: e.target.value }))}
                                                            className={`text-xs px-2 py-1 rounded border ${selectedDuplicates[dup.id] === 'overwrite' ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-gray-100 border-gray-300'}`}
                                                        >
                                                            <option value="skip">Pular</option>
                                                            <option value="overwrite">Subscrever</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">{dup.cnes}</td>
                                                    <td className="px-3 py-2 truncate max-w-[150px]">{dup.estabelecimento}</td>
                                                    <td className="px-3 py-2">{dup.competencia}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="text-gray-500">{dup.existingRecord?.somatorio?.toLocaleString() || '-'}</span>
                                                        <i className="fas fa-arrow-right mx-1 text-amber-500"></i>
                                                        <span className="font-medium text-amber-700">{dup.somatorio}</span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className="text-gray-500">{dup.existingRecord?.somatorio && dup.existingRecord?.totalPacientes ? (dup.existingRecord.somatorio / dup.existingRecord.totalPacientes).toFixed(2) : '-'}</span>
                                                        <i className="fas fa-arrow-right mx-1 text-amber-500"></i>
                                                        <span className="font-medium text-amber-700">{typeof dup.taxa === 'number' ? dup.taxa.toFixed(2) : parseFloat(String(dup.taxa).replace(',', '.')).toFixed(2)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Detalhes dos arquivos processados */}
                        {processedData.map((fileData, fileIdx) => (
                            <div key={fileIdx} className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <i className="fas fa-file-excel text-green-600"></i>
                                    {fileData.file}
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-gray-500">Indicador:</span> <span className="font-medium">{fileData.indicatorName}</span></div>
                                    <div><span className="text-gray-500">Competência:</span> <span className="font-medium text-green-700">{fileData.competencia}</span></div>
                                    <div><span className="text-gray-500">Região:</span> <span className="font-medium">{fileData.regiao}</span></div>
                                    <div><span className="text-gray-500">Registros:</span> <span className="font-bold text-green-600">{fileData.rowCount}</span></div>
                                </div>
                            </div>
                        ))}

                        {/* Botões de confirmação */}
                        <div className="flex gap-4 mt-6 pt-4 border-t">
                            <button onClick={confirmAndSave} className="btn-primary flex-1">
                                <i className="fas fa-check mr-2"></i>Confirmar e Inserir na Base
                            </button>
                            <button onClick={() => { setShowPreview(false); setProcessedData([]); }} className="btn-secondary flex-1">
                                <i className="fas fa-times mr-2"></i>Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Botão de processar */}
                {!showPreview && (
                    <div className="flex gap-4">
                        <button 
                            onClick={processFiles}
                            disabled={processing || uploadedFiles.length === 0}
                            className={`btn-primary flex-1 ${(processing || uploadedFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {processing ? (
                                <><i className="fas fa-spinner fa-spin mr-2"></i>Processando...</>
                            ) : (
                                <><i className="fas fa-cogs mr-2"></i>Processar Arquivos</>
                            )}
                        </button>
                    </div>
                )}

                {/* Instruções */}
                <div className="card p-6 mt-6 bg-blue-50 border border-blue-200">
                    <h3 className="font-bold mb-3 flex items-center gap-2 text-blue-800">
                        <i className="fas fa-info-circle"></i>
                        Instruções de Uso
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <p className="font-medium mb-2">Formato esperado dos arquivos:</p>
                            <ul className="space-y-1 text-blue-600">
                                <li><i className="fas fa-check mr-1"></i>Relatório Visão Competência do SIAPS</li>
                                <li><i className="fas fa-check mr-1"></i>Gestantes e Puérperas</li>
                                <li><i className="fas fa-check mr-1"></i>Diabetes</li>
                                <li><i className="fas fa-check mr-1"></i>Hipertensão</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-2">Estrutura do arquivo:</p>
                            <ul className="space-y-1 text-blue-600">
                                <li><i className="fas fa-table mr-1"></i>Linha 9: UF</li>
                                <li><i className="fas fa-table mr-1"></i>Linha 10: Município</li>
                                <li><i className="fas fa-table mr-1"></i>Linha 13: Tipo de Indicador (auto-detectado)</li>
                                <li><i className="fas fa-table mr-1"></i>Linha 14: Competência</li>
                                <li><i className="fas fa-table mr-1"></i>Linha 17+: Dados da tabela</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleSelectComponent = (comp) => {
        if (comp === 'equidade') {
            setActiveComponent('equidade');
            loadEquidadeData();
        }
    };

    const loadEquidadeData = async () => {
        setEquidadeLoading(true);
        try {
            const loadXlsx = async (url) => {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheets = {};
                workbook.SheetNames.forEach(name => {
                    sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
                });
                return sheets;
            };
            const [jan, fev] = await Promise.all([
                loadXlsx('./componente equidade/janeiro.xlsx'),
                loadXlsx('./componente equidade/fevereiro.xlsx')
            ]);
            setEquidadeData({ janeiro: jan, fevereiro: fev });
        } catch (err) {
            console.error('Erro ao carregar dados de equidade:', err);
        }
        setEquidadeLoading(false);
    };

    const EquidadeDashboard = () => {
        const [equidadeFilters, setEquidadeFilters] = useState({ uf: 'Todas', municipio: 'Todos', classVinculo: 'Todas', classQualidade: 'Todas' });
        const [chartViewType, setChartViewType] = useState('total');
        
        const data = equidadeData[selectedEquidadeMes];
        const tabs = data ? Object.keys(data).filter(t => t === 'eSF') : [];
        
        const formatCurrency = (value) => {
            if (!value && value !== 0) return 'R$ 0,00';
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        };

        const getFieldValue = (row, fieldBase) => {
            const suffixes = ['eSF', 'eAP', 'eMulti', 'eSB', 'NASF', 'eAPP'];
            for (const suffix of suffixes) {
                const val = row[`${fieldBase} ${suffix}`] || row[`${fieldBase}${suffix}`];
                if (val !== undefined && val !== null && val !== '') return parseFloat(val) || 0;
            }
            return row[fieldBase] ? parseFloat(row[fieldBase]) || 0 : 0;
        };

        const getMunicipioField = (row) => row['Município'] || row['MUNICÍPIO'] || row['Municipio'] || row['IBGE'] || '-';
        const getUFField = (row) => row['UF'] || row['uf'] || row['Uf'] || '-';

        const rawTabData = data ? data[selectedEquidadeTab] : null;
        
        const tabData = rawTabData ? rawTabData.filter(row => {
            if (equidadeFilters.uf !== 'Todas' && getUFField(row) !== equidadeFilters.uf) return false;
            if (equidadeFilters.municipio !== 'Todos' && getMunicipioField(row) !== equidadeFilters.municipio) return false;
            if (equidadeFilters.classVinculo !== 'Todas' && (row['Classificação Componente Vínculo'] || '-') !== equidadeFilters.classVinculo) return false;
            if (equidadeFilters.classQualidade !== 'Todas' && (row['Classificação Componente Qualidade'] || '-') !== equidadeFilters.classQualidade) return false;
            return true;
        }) : null;

        const ufOptions = rawTabData ? [...new Set(rawTabData.map(r => getUFField(r)))].filter(v => v && v !== '-').sort() : [];
        const municipioOptions = rawTabData ? [...new Set(rawTabData.filter(r => equidadeFilters.uf === 'Todas' || getUFField(r) === equidadeFilters.uf).map(r => getMunicipioField(r)))].filter(v => v && v !== '-').sort() : [];
        const classVinculoOptions = rawTabData ? [...new Set(rawTabData.map(r => r['Classificação Componente Vínculo'] || '-'))].filter(Boolean).sort() : [];
        const classQualidadeOptions = rawTabData ? [...new Set(rawTabData.map(r => r['Classificação Componente Qualidade'] || '-'))].filter(Boolean).sort() : [];

        const getTableColumns = () => {
            if (!rawTabData || !rawTabData[0]) return [];
            const sampleRow = rawTabData[0];
            const keys = Object.keys(sampleRow);
            const excludePatterns = ['__EMPTY', 'undefined'];
            return keys.filter(k => !excludePatterns.some(p => k.includes(p)) && sampleRow[k] !== undefined && sampleRow[k] !== null && sampleRow[k] !== '');
        };

        const tableColumns = getTableColumns();

        const calcTotals = (dataToCalc) => {
            if (!dataToCalc || !dataToCalc.length) return { equidade: 0, vinculo: 0, qualidade: 0, parcela: 0, total: 0, implantacao: 0, count: 0 };
            return dataToCalc.reduce((acc, row) => {
                acc.equidade += getFieldValue(row, 'Componente Equidade');
                acc.vinculo += getFieldValue(row, 'Vínculo e Acompanhamento territorial');
                acc.qualidade += getFieldValue(row, 'Qualidade');
                acc.parcela += parseFloat(row['Parcela Adicional - Qualidade'] || 0);
                acc.total += getFieldValue(row, 'Valor Total');
                acc.implantacao += getFieldValue(row, 'Implantação');
                acc.count++;
                return acc;
            }, { equidade: 0, vinculo: 0, qualidade: 0, parcela: 0, total: 0, implantacao: 0, count: 0 });
        };

        const totals = calcTotals(tabData);

        const getChartData = () => {
            const meses = ['janeiro', 'fevereiro'];
            return meses.map(mes => {
                const mesData = equidadeData[mes]?.[selectedEquidadeTab];
                if (!mesData) return { mes: mes.charAt(0).toUpperCase() + mes.slice(1), valor: 0 };
                const filteredMesData = mesData.filter(row => {
                    if (equidadeFilters.uf !== 'Todas' && getUFField(row) !== equidadeFilters.uf) return false;
                    if (equidadeFilters.municipio !== 'Todos' && getMunicipioField(row) !== equidadeFilters.municipio) return false;
                    return true;
                });
                const t = calcTotals(filteredMesData);
                const fieldMap = { equidade: t.equidade, vinculo: t.vinculo, qualidade: t.qualidade, parcela: t.parcela, total: t.total, implantacao: t.implantacao };
                return { mes: mes.charAt(0).toUpperCase() + mes.slice(1), valor: fieldMap[chartViewType] || 0 };
            });
        };

        const chartData = getChartData();

        const EquidadeLineChart = () => {
            const canvasRef = useRef(null);
            const chartRef = useRef(null);
            useEffect(() => {
                if (!canvasRef.current) return;
                if (chartRef.current) chartRef.current.destroy();
                const ctx = canvasRef.current.getContext('2d');
                const colorMap = { equidade: '#10b981', vinculo: '#3b82f6', qualidade: '#8b5cf6', parcela: '#f59e0b', total: '#374151', implantacao: '#14b8a6' };
                const labelMap = { equidade: 'Componente Equidade', vinculo: 'Vínculo e Acompanhamento', qualidade: 'Qualidade', parcela: 'Parcela Adicional', total: 'Valor Total', implantacao: 'Implantação' };
                chartRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chartData.map(d => d.mes),
                        datasets: [{
                            label: labelMap[chartViewType],
                            data: chartData.map(d => d.valor),
                            borderColor: colorMap[chartViewType],
                            backgroundColor: colorMap[chartViewType] + '20',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            pointBackgroundColor: colorMap[chartViewType],
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: true, position: 'top' },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                                }
                            },
                            datalabels: {
                                display: true,
                                color: colorMap[chartViewType],
                                anchor: 'end',
                                align: 'top',
                                font: { weight: 'bold', size: 11 },
                                formatter: (value) => formatCurrency(value)
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { callback: (v) => formatCurrency(v) }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
                return () => { if (chartRef.current) chartRef.current.destroy(); };
            }, [chartData, chartViewType]);
            return <canvas ref={canvasRef}></canvas>;
        };

        const getClassificationStats = () => {
            if (!tabData) return { vinculo: {}, qualidade: {} };
            const vinculo = tabData.reduce((acc, row) => {
                const cls = row['Classificação Componente Vínculo'] || 'Não classificado';
                acc[cls] = (acc[cls] || 0) + 1;
                return acc;
            }, {});
            const qualidade = tabData.reduce((acc, row) => {
                const cls = row['Classificação Componente Qualidade'] || 'Não classificado';
                acc[cls] = (acc[cls] || 0) + 1;
                return acc;
            }, {});
            return { vinculo, qualidade };
        };

        const classStats = getClassificationStats();

        if (equidadeLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                            <i className="fas fa-balance-scale text-white text-3xl"></i>
                        </div>
                        <p className="text-gray-600 text-lg font-medium">Carregando dados de Equidade...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveComponent(null)} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                                    <i className="fas fa-arrow-left"></i>
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold">Componente I - Equidade</h1>
                                    <p className="text-emerald-100">Financiamento eSF - {selectedEquidadeMes.charAt(0).toUpperCase() + selectedEquidadeMes.slice(1)}/2025</p>
                                </div>
                            </div>
                            <select value={selectedEquidadeMes} onChange={e => setSelectedEquidadeMes(e.target.value)} className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white">
                                <option value="janeiro" className="text-gray-800">Janeiro</option>
                                <option value="fevereiro" className="text-gray-800">Fevereiro</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white border-b shadow-sm sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium"><i className="fas fa-filter"></i><span>Filtros:</span></div>
                            {ufOptions.length > 0 && (
                                <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" value={equidadeFilters.uf} onChange={e => setEquidadeFilters({...equidadeFilters, uf: e.target.value, municipio: 'Todos'})}>
                                    <option value="Todas">Todas UFs</option>
                                    {ufOptions.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            )}
                            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" value={equidadeFilters.municipio} onChange={e => setEquidadeFilters({...equidadeFilters, municipio: e.target.value})}>
                                <option value="Todos">Todos Municípios</option>
                                {municipioOptions.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            {classVinculoOptions.length > 1 && (
                                <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" value={equidadeFilters.classVinculo} onChange={e => setEquidadeFilters({...equidadeFilters, classVinculo: e.target.value})}>
                                    <option value="Todas">Class. Vínculo</option>
                                    {classVinculoOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                            {classQualidadeOptions.length > 1 && (
                                <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" value={equidadeFilters.classQualidade} onChange={e => setEquidadeFilters({...equidadeFilters, classQualidade: e.target.value})}>
                                    <option value="Todas">Class. Qualidade</option>
                                    {classQualidadeOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                            {(equidadeFilters.uf !== 'Todas' || equidadeFilters.municipio !== 'Todos' || equidadeFilters.classVinculo !== 'Todas' || equidadeFilters.classQualidade !== 'Todas') && (
                                <button onClick={() => setEquidadeFilters({ uf: 'Todas', municipio: 'Todos', classVinculo: 'Todas', classQualidade: 'Todas' })} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">
                                    <i className="fas fa-times mr-1"></i>Limpar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="max-w-7xl mx-auto p-6">
                    {tabData && tabData.length > 0 ? (
                        <>
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-balance-scale text-2xl"></i>
                                            </div>
                                            <span className="text-emerald-100 text-sm">{totals.count} registros</span>
                                        </div>
                                        <p className="text-emerald-100 text-sm mb-1">Componente Equidade</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.equidade)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-link text-2xl"></i>
                                            </div>
                                        </div>
                                        <p className="text-blue-100 text-sm mb-1">Vínculo e Acompanhamento</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.vinculo)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-star text-2xl"></i>
                                            </div>
                                        </div>
                                        <p className="text-purple-100 text-sm mb-1">Qualidade</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.qualidade)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-plus-circle text-2xl"></i>
                                            </div>
                                        </div>
                                        <p className="text-amber-100 text-sm mb-1">Parcela Adicional</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.parcela)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-coins text-2xl"></i>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-1">Valor Total</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.total)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-rocket text-2xl"></i>
                                            </div>
                                        </div>
                                        <p className="text-teal-100 text-sm mb-1">Implantação</p>
                                        <p className="text-3xl font-bold">{formatCurrency(totals.implantacao)}</p>
                                    </div>
                                </div>

                                {/* Gráfico de Linhas */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-chart-line text-emerald-600"></i>
                                            Evolução Mensal
                                        </h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {[
                                                { key: 'equidade', label: 'Equidade', color: 'emerald' },
                                                { key: 'vinculo', label: 'Vínculo', color: 'blue' },
                                                { key: 'qualidade', label: 'Qualidade', color: 'purple' },
                                                { key: 'parcela', label: 'Parcela Adic.', color: 'amber' },
                                                { key: 'total', label: 'Valor Total', color: 'gray' },
                                                { key: 'implantacao', label: 'Implantação', color: 'teal' }
                                            ].map(opt => (
                                                <button key={opt.key} onClick={() => setChartViewType(opt.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${chartViewType === opt.key ? `bg-${opt.color}-500 text-white` : `bg-${opt.color}-50 text-${opt.color}-700 hover:bg-${opt.color}-100`}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ height: '300px' }}>
                                        <EquidadeLineChart />
                                    </div>
                                </div>

                                {/* Análise de Classificações */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <i className="fas fa-chart-pie text-blue-600"></i>
                                            Distribuição - Classificação Vínculo
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(classStats.vinculo).map(([cls, count]) => {
                                                const pct = tabData.length ? ((count / tabData.length) * 100).toFixed(1) : 0;
                                                const colorMap = { 'Ótimo': 'blue', 'Bom': 'green', 'Suficiente': 'amber', 'Regular': 'red', 'Não classificado': 'gray' };
                                                const color = colorMap[cls] || 'gray';
                                                return (
                                                    <div key={cls} className="flex items-center gap-3">
                                                        <span className={`w-3 h-3 rounded-full bg-${color}-500`}></span>
                                                        <span className="flex-1 text-sm text-gray-700">{cls}</span>
                                                        <span className="text-sm font-semibold text-gray-800">{count}</span>
                                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-12 text-right">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <i className="fas fa-chart-pie text-purple-600"></i>
                                            Distribuição - Classificação Qualidade
                                        </h3>
                                        <div className="space-y-3">
                                            {Object.entries(classStats.qualidade).map(([cls, count]) => {
                                                const pct = tabData.length ? ((count / tabData.length) * 100).toFixed(1) : 0;
                                                const colorMap = { 'Ótimo': 'blue', 'Bom': 'green', 'Suficiente': 'amber', 'Regular': 'red', 'Não classificado': 'gray' };
                                                const color = colorMap[cls] || 'gray';
                                                return (
                                                    <div key={cls} className="flex items-center gap-3">
                                                        <span className={`w-3 h-3 rounded-full bg-${color}-500`}></span>
                                                        <span className="flex-1 text-sm text-gray-700">{cls}</span>
                                                        <span className="text-sm font-semibold text-gray-800">{count}</span>
                                                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 w-12 text-right">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabela de Dados */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                            <i className="fas fa-table text-emerald-600"></i>
                                            Detalhamento - {selectedEquidadeTab}
                                        </h3>
                                        <span className="text-sm text-gray-500">{tabData.length} registros</span>
                                    </div>
                                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {tableColumns.slice(0, 12).map(col => (
                                                        <th key={col} className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabData.map((row, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-emerald-50/50 transition-colors">
                                                        {tableColumns.slice(0, 12).map(col => {
                                                            const val = row[col];
                                                            const colLower = col.toLowerCase();
                                                            const isCurrency = colLower.includes('valor') || (colLower.includes('componente') && !colLower.includes('classificação')) || colLower.includes('vínculo e acompanhamento') || colLower.includes('implantação') || colLower.includes('parcela adicional') || colLower.includes('qualidade eSF') || colLower.includes('equidade');
                                                            const isClassification = colLower.includes('classificação');
                                                            const isNumeric = typeof val === 'number' || !isNaN(parseFloat(val));
                                                            
                                                            if (isClassification) {
                                                                const colorMap = { 'Ótimo': 'bg-blue-100 text-blue-800', 'Bom': 'bg-green-100 text-green-800', 'Suficiente': 'bg-amber-100 text-amber-800', 'Regular': 'bg-red-100 text-red-800' };
                                                                return (
                                                                    <td key={col} className="p-3">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[val] || 'bg-gray-100 text-gray-600'}`}>
                                                                            {val || '-'}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            }
                                                            
                                                            if (isCurrency && isNumeric && val) {
                                                                return (
                                                                    <td key={col} className="p-3 text-right font-medium text-emerald-700">
                                                                        {formatCurrency(parseFloat(val))}
                                                                    </td>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <td key={col} className={`p-3 ${isNumeric && val ? 'text-right' : ''}`}>
                                                                    {isNumeric && val ? parseFloat(val).toLocaleString('pt-BR') : (val || '-')}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <i className="fas fa-database text-4xl text-gray-300"></i>
                            </div>
                            <p className="text-gray-500 text-lg">Nenhum dado disponível para eSF</p>
                            <p className="text-gray-400 text-sm mt-2">Verifique se os dados foram carregados corretamente</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (activeComponent === 'equidade') return <EquidadeDashboard />;
    if (!indicatorType) return (<><AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} mode={authMode} setMode={setAuthMode} onLogin={setUser} /><LandingPage onSelectIndicator={handleSelectIndicator} onSelectComponent={handleSelectComponent} user={user} onOpenAuth={() => setAuthModal(true)} /></>);
    if (loading) return <div className="min-h-screen flex items-center justify-center landing-bg"><div className="text-center"><i className="fas fa-spinner fa-spin text-5xl text-white mb-4"></i><p className="text-white text-lg">Carregando dados...</p></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500"><i className="fas fa-exclamation-triangle mr-2"></i>{error}</div>;

    return (<div className="min-h-screen"><Sidebar /><ProfileDropdown /><NotaTecnicaModal /><BabyAPSTip view={activeView} />{notaTecnicaMinimized ? <button onClick={() => setNotaTecnicaMinimized(false)} className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center" title="Expandir Nota Técnica"><i className="fas fa-book-open"></i></button> : <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2"><button onClick={() => setNotaTecnicaMinimized(true)} className="w-8 h-8 bg-gray-500 text-white rounded-full shadow hover:bg-gray-600 transition-all flex items-center justify-center" title="Minimizar"><i className="fas fa-minus text-xs"></i></button><button onClick={() => setShowNotaTecnica(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2" title="Nota Técnica"><i className="fas fa-book-open"></i><span className="text-sm font-semibold">Nota Técnica</span></button></div>}<div className="main-content">{activeView === 'home' && <HomeView />}{activeView === 'indicators' && <IndicatorsView />}{activeView === 'components' && <ComponentsView />}{activeView === 'strategic' && <StrategicView />}{activeView === 'goals' && <GoalsView />}{activeView === 'evaluation' && <EvaluationView />}{activeView === 'map' && <MapView />}{activeView === 'dataCollection' && <DataCollectionView />}{activeView === 'profile' && <ProfileView />}</div></div>);
};

ReactDOM.render(<Dashboard />, document.getElementById('root'));
