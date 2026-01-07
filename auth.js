const ROLES = ['Médico(a)', 'Enfermeiro(a)', 'Técnico(a) de Enfermagem', 'ACS', 'Coordenador(a)', 'Gestor(a)', 'Dentista', 'Administrador', 'Outro'];

const LoginView = ({ onLogin }) => {
    const [isRegister, setIsRegister] = React.useState(false);
    const [step, setStep] = React.useState(1);
    const [form, setForm] = React.useState({ name: '', email: '', password: '', role: '', unit: '', municipality: '', bio: '', specialties: [], experience: '' });
    const [error, setError] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (isRegister) {
            if (step === 1) {
                if (!form.name || !form.email || !form.password) {
                    setError('Preencha todos os campos obrigatórios');
                    return;
                }
                setStep(2);
                return;
            }
            if (!form.role) {
                setError('Selecione seu cargo/função');
                return;
            }
            const user = {
                id: generateId(),
                name: form.name,
                email: form.email,
                role: form.role,
                isAdmin: form.role === 'Administrador',
                unit: form.unit,
                municipality: form.municipality,
                bio: form.bio,
                specialties: form.specialties,
                experience: form.experience,
                joinDate: Date.now(),
                followers: [],
                following: [],
                achievements: [],
                verified: false
            };
            onLogin(user);
        } else {
            if (!form.email || !form.password) {
                setError('Preencha email e senha');
                return;
            }
            const saved = localStorage.getItem('gdiaps_users');
            const users = saved ? JSON.parse(saved) : [];
            const found = users.find(u => u.email === form.email);
            if (found) {
                onLogin(found);
            } else {
                setError('Usuário não encontrado. Cadastre-se primeiro.');
            }
        }
    };

    const specialtyOptions = ['Saúde da Família', 'Pré-natal', 'Puerpério', 'Saúde da Criança', 'Saúde do Idoso', 'Saúde Mental', 'Vigilância Epidemiológica', 'Gestão em Saúde', 'Atenção Primária'];

    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-4', style: { background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #06b6d4 100%)' } },
        React.createElement('div', { className: 'card p-8 w-full max-w-md animate-fadeInUp' },
            React.createElement('div', { className: 'text-center mb-8' },
                React.createElement('div', { className: 'w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float' },
                    React.createElement('i', { className: 'fas fa-heartbeat text-white text-3xl' })
                ),
                React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'GDI-APS'),
                React.createElement('p', { className: 'text-gray-500 mt-1' }, 'Rede de Profissionais de Saúde'),
                isRegister && step === 2 && React.createElement('div', { className: 'flex justify-center gap-2 mt-4' },
                    [1, 2].map(s => React.createElement('div', { key: s, className: `w-3 h-3 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-gray-300'}` }))
                )
            ),
            error && React.createElement('div', { className: 'bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm flex items-center gap-2 animate-fadeIn' },
                React.createElement('i', { className: 'fas fa-exclamation-circle' }), error
            ),
            React.createElement('form', { onSubmit: handleSubmit },
                !isRegister && React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('i', { className: 'fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                            React.createElement('input', { type: 'email', className: 'w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all', placeholder: 'seu@email.com', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })
                        )
                    ),
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Senha'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('i', { className: 'fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                            React.createElement('input', { type: 'password', className: 'w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all', placeholder: '••••••••', value: form.password, onChange: e => setForm({ ...form, password: e.target.value }) })
                        )
                    )
                ),
                isRegister && step === 1 && React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Nome completo'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('i', { className: 'fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                            React.createElement('input', { type: 'text', className: 'w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })
                        )
                    ),
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Email'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('i', { className: 'fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                            React.createElement('input', { type: 'email', className: 'w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })
                        )
                    ),
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Senha'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('i', { className: 'fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                            React.createElement('input', { type: 'password', className: 'w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.password, onChange: e => setForm({ ...form, password: e.target.value }) })
                        )
                    )
                ),
                isRegister && step === 2 && React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Cargo/Função *'),
                        React.createElement('select', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.role, onChange: e => setForm({ ...form, role: e.target.value }) },
                            React.createElement('option', { value: '' }, 'Selecione seu cargo...'),
                            ROLES.map(r => React.createElement('option', { key: r, value: r }, r))
                        )
                    ),
                    form.role === 'Administrador' && React.createElement('div', { className: 'mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800' },
                        React.createElement('i', { className: 'fas fa-shield-alt mr-2' }),
                        'Administradores podem gerenciar tópicos e usuários do fórum.'
                    ),
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Unidade de Saúde'),
                        React.createElement('input', { type: 'text', className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', placeholder: 'Ex: UBS Centro', value: form.unit, onChange: e => setForm({ ...form, unit: e.target.value }) })
                    ),
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Município'),
                        React.createElement('input', { type: 'text', className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.municipality, onChange: e => setForm({ ...form, municipality: e.target.value }) })
                    ),
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Áreas de Atuação'),
                        React.createElement('div', { className: 'flex flex-wrap gap-2' },
                            specialtyOptions.map(s => React.createElement('button', { key: s, type: 'button', className: `px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.specialties.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, onClick: () => setForm({ ...form, specialties: form.specialties.includes(s) ? form.specialties.filter(x => x !== s) : [...form.specialties, s] }) }, s))
                        )
                    ),
                    React.createElement('div', { className: 'mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Tempo de Experiência'),
                        React.createElement('select', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.experience, onChange: e => setForm({ ...form, experience: e.target.value }) },
                            React.createElement('option', { value: '' }, 'Selecione...'),
                            ['Menos de 1 ano', '1-3 anos', '3-5 anos', '5-10 anos', 'Mais de 10 anos'].map(e => React.createElement('option', { key: e, value: e }, e))
                        )
                    ),
                    React.createElement('div', { className: 'mb-6' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Bio (opcional)'),
                        React.createElement('textarea', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none', rows: 2, placeholder: 'Conte um pouco sobre você...', value: form.bio, onChange: e => setForm({ ...form, bio: e.target.value }) })
                    )
                ),
                React.createElement('div', { className: 'flex gap-3' },
                    isRegister && step === 2 && React.createElement('button', { type: 'button', className: 'flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all', onClick: () => setStep(1) },
                        React.createElement('i', { className: 'fas fa-arrow-left mr-2' }), 'Voltar'
                    ),
                    React.createElement('button', { type: 'submit', className: 'flex-1 py-3 btn-primary rounded-xl font-semibold' },
                        isRegister ? (step === 1 ? 'Continuar' : 'Criar Conta') : 'Entrar',
                        React.createElement('i', { className: `fas fa-${isRegister && step === 1 ? 'arrow-right' : 'sign-in-alt'} ml-2` })
                    )
                )
            ),
            React.createElement('div', { className: 'mt-6 text-center' },
                React.createElement('p', { className: 'text-gray-600' },
                    isRegister ? 'Já tem uma conta? ' : 'Não tem uma conta? ',
                    React.createElement('button', { className: 'text-blue-600 font-semibold hover:underline', onClick: () => { setIsRegister(!isRegister); setStep(1); setError(''); } },
                        isRegister ? 'Entrar' : 'Cadastre-se'
                    )
                )
            )
        )
    );
};

const ProfileView = ({ user, setUser, onLogout, topics, allUsers = [], onFollow }) => {
    const [editing, setEditing] = React.useState(false);
    const [form, setForm] = React.useState({ ...user });
    const [activeTab, setActiveTab] = React.useState('activity');
    const [showFollowers, setShowFollowers] = React.useState(null);
    const [showDetailPopup, setShowDetailPopup] = React.useState(null);

    const userTopics = topics.filter(t => t.author.name === user.name);
    const userComments = topics.flatMap(t => t.comments.filter(c => c.author.name === user.name).map(c => ({ ...c, topicTitle: t.title, topicId: t.id })));
    const totalLikes = userTopics.reduce((s, t) => s + t.likes, 0) + userComments.reduce((s, c) => s + c.likes, 0);
    const followers = user.followers || [];
    const following = user.following || [];

    const handleSave = () => {
        setUser({ ...user, ...form });
        setEditing(false);
    };

    const getJoinDateFormatted = () => {
        const d = new Date(user.joinDate);
        return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    const suggestedUsers = allUsers.filter(u => u.id !== user.id && !following.includes(u.id)).slice(0, 5);

    const ActivityFeed = () => {
        const activities = [
            ...userTopics.map(t => ({ type: 'post', data: t, date: t.date })),
            ...userComments.map(c => ({ type: 'comment', data: c, date: c.date }))
        ].sort((a, b) => b.date - a.date).slice(0, 10);

        if (activities.length === 0) {
            return React.createElement('div', { className: 'text-center py-12' },
                React.createElement('i', { className: 'fas fa-stream text-5xl text-gray-300 mb-4' }),
                React.createElement('p', { className: 'text-gray-500' }, 'Nenhuma atividade recente')
            );
        }

        return React.createElement('div', { className: 'space-y-4' },
            activities.map((a, i) => React.createElement('div', { key: i, className: 'activity-item flex gap-4 border-b pb-4 last:border-0' },
                React.createElement('div', { className: `w-10 h-10 rounded-full flex items-center justify-center ${a.type === 'post' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}` },
                    React.createElement('i', { className: `fas ${a.type === 'post' ? 'fa-pen' : 'fa-comment'}` })
                ),
                React.createElement('div', { className: 'flex-1' },
                    React.createElement('p', { className: 'text-sm' },
                        React.createElement('span', { className: 'font-semibold' }, user.name),
                        a.type === 'post' ? ' publicou um tópico' : ' comentou em ',
                        a.type === 'comment' && React.createElement('span', { className: 'text-blue-600' }, a.data.topicTitle)
                    ),
                    React.createElement('p', { className: 'text-gray-600 text-sm mt-1 line-clamp-2' }, a.type === 'post' ? a.data.title : a.data.content),
                    React.createElement('p', { className: 'text-xs text-gray-400 mt-2' }, formatDate(a.date))
                )
            ))
        );
    };

    const AboutSection = () => React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', null,
            React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3 flex items-center gap-2' },
                React.createElement('i', { className: 'fas fa-user-circle text-blue-500' }), 'Sobre'
            ),
            React.createElement('p', { className: 'text-gray-600' }, user.bio || 'Nenhuma bio adicionada ainda.')
        ),
        React.createElement('div', null,
            React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3 flex items-center gap-2' },
                React.createElement('i', { className: 'fas fa-briefcase text-blue-500' }), 'Experiência Profissional'
            ),
            React.createElement('div', { className: 'bg-gray-50 rounded-xl p-4' },
                React.createElement('div', { className: 'flex items-start gap-3' },
                    React.createElement('div', { className: 'w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center' },
                        React.createElement('i', { className: 'fas fa-hospital text-blue-600' })
                    ),
                    React.createElement('div', null,
                        React.createElement('p', { className: 'font-semibold text-gray-800' }, user.role),
                        user.unit && React.createElement('p', { className: 'text-gray-600 text-sm' }, user.unit),
                        user.municipality && React.createElement('p', { className: 'text-gray-500 text-sm' }, user.municipality),
                        user.experience && React.createElement('p', { className: 'text-gray-400 text-xs mt-1' }, user.experience, ' de experiência')
                    )
                )
            )
        ),
        user.specialties?.length > 0 && React.createElement('div', null,
            React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3 flex items-center gap-2' },
                React.createElement('i', { className: 'fas fa-tags text-blue-500' }), 'Áreas de Atuação'
            ),
            React.createElement('div', { className: 'flex flex-wrap gap-2' },
                user.specialties.map(s => React.createElement('span', { key: s, className: 'px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium' }, s))
            )
        ),
        React.createElement('div', null,
            React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3 flex items-center gap-2' },
                React.createElement('i', { className: 'fas fa-chart-bar text-blue-500' }), 'Estatísticas'
            ),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                [
                    ['Publicações', userTopics.length, 'fa-file-alt', 'blue'],
                    ['Comentários', userComments.length, 'fa-comment', 'green'],
                    ['Curtidas Recebidas', totalLikes, 'fa-heart', 'red'],
                    ['Visualizações', userTopics.reduce((s, t) => s + (t.views || 0), 0), 'fa-eye', 'purple']
                ].map(([label, value, icon, color]) => React.createElement('div', { key: label, className: 'bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-all', onClick: () => setShowDetailPopup({ type: label, value }) },
                    React.createElement('i', { className: `fas ${icon} text-${color}-500 text-xl mb-2` }),
                    React.createElement('p', { className: 'text-2xl font-bold text-gray-800' }, value),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, label)
                ))
            )
        )
    );

    const ConnectionsSection = () => React.createElement('div', { className: 'space-y-6' },
        suggestedUsers.length > 0 && React.createElement('div', null,
            React.createElement('h4', { className: 'font-semibold text-gray-800 mb-3' }, 'Sugestões para Seguir'),
            React.createElement('div', { className: 'space-y-3' },
                suggestedUsers.map(u => React.createElement('div', { key: u.id, className: 'flex items-center gap-3 p-3 bg-gray-50 rounded-xl' },
                    React.createElement(Avatar, { name: u.name, size: 'md' }),
                    React.createElement('div', { className: 'flex-1' },
                        React.createElement('p', { className: 'font-semibold text-gray-800' }, u.name),
                        React.createElement('p', { className: 'text-xs text-gray-500' }, u.role)
                    ),
                    React.createElement('button', { className: 'px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all', onClick: () => onFollow && onFollow(u.id) },
                        React.createElement('i', { className: 'fas fa-user-plus mr-1' }), 'Seguir'
                    )
                ))
            )
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('div', { className: 'bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all', onClick: () => setShowFollowers('followers') },
                React.createElement('p', { className: 'text-3xl font-bold text-gray-800' }, followers.length),
                React.createElement('p', { className: 'text-sm text-gray-500' }, 'Seguidores')
            ),
            React.createElement('div', { className: 'bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all', onClick: () => setShowFollowers('following') },
                React.createElement('p', { className: 'text-3xl font-bold text-gray-800' }, following.length),
                React.createElement('p', { className: 'text-sm text-gray-500' }, 'Seguindo')
            )
        )
    );

    return React.createElement('div', { className: 'animate-fadeIn' },
        React.createElement('div', { className: 'card overflow-hidden mb-6' },
            React.createElement('div', { className: 'profile-cover' },
                user.isAdmin && React.createElement('div', { className: 'absolute top-4 right-4 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1' },
                    React.createElement('i', { className: 'fas fa-shield-alt' }), 'Administrador'
                )
            ),
            React.createElement('div', { className: 'px-6 pb-6' },
                React.createElement('div', { className: 'flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-12' },
                    React.createElement('div', { className: 'relative' },
                        React.createElement(Avatar, { name: user.name, size: 'xl', className: 'profile-avatar-large' }),
                        user.verified && React.createElement('div', { className: 'absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white' },
                            React.createElement('i', { className: 'fas fa-check text-white text-xs' })
                        )
                    ),
                    React.createElement('div', { className: 'flex-1 text-center md:text-left pt-4 md:pt-12' },
                        React.createElement('div', { className: 'flex items-center justify-center md:justify-start gap-2' },
                            React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, user.name),
                            user.verified && React.createElement('i', { className: 'fas fa-check-circle text-blue-500' })
                        ),
                        React.createElement('p', { className: 'text-gray-600 font-medium' }, user.role),
                        React.createElement('div', { className: 'flex items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500' },
                            user.unit && React.createElement('span', { className: 'flex items-center gap-1' },
                                React.createElement('i', { className: 'fas fa-hospital' }), user.unit
                            ),
                            user.municipality && React.createElement('span', { className: 'flex items-center gap-1' },
                                React.createElement('i', { className: 'fas fa-map-marker-alt' }), user.municipality
                            ),
                            React.createElement('span', { className: 'flex items-center gap-1' },
                                React.createElement('i', { className: 'fas fa-calendar' }), 'Desde ', getJoinDateFormatted()
                            )
                        )
                    ),
                    React.createElement('div', { className: 'flex gap-2' },
                        React.createElement('button', { className: 'btn-primary flex items-center gap-2', onClick: () => setEditing(true) },
                            React.createElement('i', { className: 'fas fa-edit' }), 'Editar Perfil'
                        ),
                        React.createElement('button', { className: 'btn-secondary flex items-center gap-2', onClick: onLogout },
                            React.createElement('i', { className: 'fas fa-sign-out-alt' }), 'Sair'
                        )
                    )
                ),
                React.createElement('div', { className: 'flex justify-center md:justify-start gap-8 mt-6 pt-6 border-t' },
                    [
                        ['Publicações', userTopics.length],
                        ['Seguidores', followers.length],
                        ['Seguindo', following.length],
                        ['Curtidas', totalLikes]
                    ].map(([label, value]) => React.createElement('div', { key: label, className: 'profile-stat' },
                        React.createElement('p', { className: 'profile-stat-value' }, value),
                        React.createElement('p', { className: 'profile-stat-label' }, label)
                    ))
                )
            )
        ),
        editing && React.createElement('div', { className: 'modal-overlay', onClick: () => setEditing(false) },
            React.createElement('div', { className: 'modal-content p-6', onClick: e => e.stopPropagation() },
                React.createElement('div', { className: 'flex items-center justify-between mb-6' },
                    React.createElement('h3', { className: 'text-xl font-bold' }, 'Editar Perfil'),
                    React.createElement('button', { className: 'w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center', onClick: () => setEditing(false) },
                        React.createElement('i', { className: 'fas fa-times text-gray-500' })
                    )
                ),
                React.createElement('div', { className: 'space-y-4' },
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Nome'),
                        React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all', value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Bio'),
                        React.createElement('textarea', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none', rows: 3, value: form.bio || '', onChange: e => setForm({ ...form, bio: e.target.value }) })
                    ),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Cargo'),
                            React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl', value: form.role, onChange: e => setForm({ ...form, role: e.target.value }) })
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Experiência'),
                            React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl', value: form.experience || '', onChange: e => setForm({ ...form, experience: e.target.value }) })
                        )
                    ),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Unidade'),
                            React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl', value: form.unit || '', onChange: e => setForm({ ...form, unit: e.target.value }) })
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Município'),
                            React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl', value: form.municipality || '', onChange: e => setForm({ ...form, municipality: e.target.value }) })
                        )
                    )
                ),
                React.createElement('div', { className: 'flex gap-3 mt-6' },
                    React.createElement('button', { className: 'flex-1 btn-primary', onClick: handleSave }, 'Salvar Alterações'),
                    React.createElement('button', { className: 'flex-1 btn-secondary', onClick: () => setEditing(false) }, 'Cancelar')
                )
            )
        ),
        showDetailPopup && React.createElement('div', { className: 'modal-overlay', onClick: () => setShowDetailPopup(null) },
            React.createElement('div', { className: 'modal-content p-6', onClick: e => e.stopPropagation() },
                React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                    React.createElement('h3', { className: 'text-xl font-bold' }, showDetailPopup.type),
                    React.createElement('button', { className: 'w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center', onClick: () => setShowDetailPopup(null) },
                        React.createElement('i', { className: 'fas fa-times text-gray-500' })
                    )
                ),
                React.createElement('div', { className: 'text-center py-8' },
                    React.createElement('p', { className: 'text-5xl font-bold text-blue-600 mb-2' }, showDetailPopup.value),
                    React.createElement('p', { className: 'text-gray-500' }, 'Total de ', showDetailPopup.type.toLowerCase())
                )
            )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
            React.createElement('div', { className: 'lg:col-span-2' },
                React.createElement('div', { className: 'card' },
                    React.createElement('div', { className: 'flex border-b' },
                        [['activity', 'Atividade', 'fa-stream'], ['about', 'Sobre', 'fa-user'], ['connections', 'Conexões', 'fa-users']].map(([id, label, icon]) =>
                            React.createElement('button', { key: id, className: `flex-1 py-4 font-medium transition-all ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`, onClick: () => setActiveTab(id) },
                                React.createElement('i', { className: `fas ${icon} mr-2` }), label
                            )
                        )
                    ),
                    React.createElement('div', { className: 'p-6' },
                        activeTab === 'activity' && React.createElement(ActivityFeed, null),
                        activeTab === 'about' && React.createElement(AboutSection, null),
                        activeTab === 'connections' && React.createElement(ConnectionsSection, null)
                    )
                )
            ),
            React.createElement('div', { className: 'space-y-6' },
                React.createElement('div', { className: 'card p-6' },
                    React.createElement('h4', { className: 'font-semibold text-gray-800 mb-4' }, 'Conquistas'),
                    React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
                        [
                            ['fa-star', 'Primeira Publicação', userTopics.length > 0],
                            ['fa-comments', '10 Comentários', userComments.length >= 10],
                            ['fa-heart', '50 Curtidas', totalLikes >= 50],
                            ['fa-trophy', 'Top Contribuidor', userTopics.length >= 5],
                            ['fa-users', '10 Seguidores', followers.length >= 10],
                            ['fa-fire', 'Em Alta', userTopics.some(t => t.likes >= 10)]
                        ].map(([icon, title, unlocked]) => React.createElement('div', { key: title, className: `p-3 rounded-xl text-center transition-all cursor-pointer ${unlocked ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-gray-50 opacity-50'}`, title: title },
                            React.createElement('i', { className: `fas ${icon} text-2xl ${unlocked ? 'text-yellow-500' : 'text-gray-300'}` })
                        ))
                    )
                ),
                React.createElement('div', { className: 'card p-6' },
                    React.createElement('h4', { className: 'font-semibold text-gray-800 mb-4' }, 'Publicações Recentes'),
                    userTopics.length === 0
                        ? React.createElement('p', { className: 'text-gray-500 text-sm text-center py-4' }, 'Nenhuma publicação')
                        : React.createElement('div', { className: 'space-y-3' },
                            userTopics.slice(0, 3).map(t => React.createElement('div', { key: t.id, className: 'p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer' },
                                React.createElement('p', { className: 'font-medium text-gray-800 text-sm line-clamp-2' }, t.title),
                                React.createElement('div', { className: 'flex gap-3 mt-2 text-xs text-gray-500' },
                                    React.createElement('span', null, React.createElement('i', { className: 'far fa-heart mr-1' }), t.likes),
                                    React.createElement('span', null, React.createElement('i', { className: 'far fa-comment mr-1' }), t.comments.length)
                                )
                            ))
                        )
                )
            )
        )
    );
};
