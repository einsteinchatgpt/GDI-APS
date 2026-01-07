const DEFAULT_TOPICS = [
    { id: '1', title: 'Estratégias para melhorar o indicador de consultas no puerpério', content: 'Gostaria de compartilhar algumas estratégias que implementamos em nossa unidade para melhorar o acompanhamento das puérperas. Temos conseguido bons resultados com busca ativa via ACS.', author: { name: 'Maria Silva', role: 'Enfermeira - UBS Centro' }, category: 'boas-praticas', likes: 24, likedBy: [], comments: [{ id: 'c1', author: { name: 'João Santos' }, content: 'Excelente iniciativa! Vamos implementar aqui também.', date: Date.now() - 86400000, likes: 5, likedBy: [] }], shares: 8, views: 156, date: Date.now() - 172800000 },
    { id: '2', title: 'Dificuldades com registro de testes do 3º trimestre', content: 'Nossa equipe está enfrentando dificuldades para alcançar a meta de testes no terceiro trimestre. Alguém tem sugestões de como melhorar a captação?', author: { name: 'Carlos Oliveira', role: 'Médico - UBS Rural' }, category: 'duvidas', likes: 12, likedBy: [], comments: [], shares: 3, views: 89, date: Date.now() - 259200000 },
    { id: '3', title: 'Celebrando: Atingimos 85% em visitas domiciliares!', content: 'Quero compartilhar nossa conquista! Após 6 meses de trabalho intenso, conseguimos atingir 85% no indicador de visitas domiciliares do ACS. O segredo foi a reorganização das microáreas.', author: { name: 'Ana Costa', role: 'Coordenadora - ESF Esperança' }, category: 'conquistas', likes: 45, likedBy: [], comments: [{ id: 'c2', author: { name: 'Pedro Lima' }, content: 'Parabéns! Podem compartilhar como organizaram as microáreas?', date: Date.now() - 43200000, likes: 8, likedBy: [] }], shares: 15, views: 234, date: Date.now() - 86400000 }
];

const CATEGORIES = [
    { id: 'todos', label: 'Todos', icon: 'fa-th-large', color: 'bg-gray-500' },
    { id: 'boas-praticas', label: 'Boas Práticas', icon: 'fa-star', color: 'bg-green-500' },
    { id: 'duvidas', label: 'Dúvidas', icon: 'fa-question-circle', color: 'bg-blue-500' },
    { id: 'conquistas', label: 'Conquistas', icon: 'fa-trophy', color: 'bg-yellow-500' },
    { id: 'discussao', label: 'Discussão', icon: 'fa-comments', color: 'bg-purple-500' }
];

const ForumView = ({ user, topics, setTopics, onLoginRequired }) => {
    const [filter, setFilter] = React.useState('todos');
    const [showNewTopic, setShowNewTopic] = React.useState(false);
    const [selectedTopic, setSelectedTopic] = React.useState(null);
    const [newTopic, setNewTopic] = React.useState({ title: '', content: '', category: 'discussao' });
    const [newComment, setNewComment] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(null);
    const [notification, setNotification] = React.useState(null);

    const isAdmin = user?.isAdmin || user?.role === 'Administrador';

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDeleteTopic = (topicId) => {
        setTopics(prev => prev.filter(t => t.id !== topicId));
        setShowDeleteConfirm(null);
        setSelectedTopic(null);
        showNotification('Tópico excluído com sucesso');
    };

    const handleDeleteComment = (topicId, commentId) => {
        setTopics(prev => prev.map(t => t.id === topicId ? { ...t, comments: t.comments.filter(c => c.id !== commentId) } : t));
        if (selectedTopic) {
            setSelectedTopic(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }));
        }
        showNotification('Comentário excluído');
    };

    const handlePinTopic = (topicId) => {
        setTopics(prev => prev.map(t => t.id === topicId ? { ...t, pinned: !t.pinned } : t));
        showNotification('Tópico atualizado');
    };

    const searchedTopics = searchQuery 
        ? topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()))
        : topics;
    const filteredTopics = (filter === 'todos' ? searchedTopics : searchedTopics.filter(t => t.category === filter))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date - a.date);

    const handleLike = (topicId, commentId = null) => {
        if (!user) { onLoginRequired(); return; }
        setTopics(prev => prev.map(t => {
            if (t.id === topicId) {
                if (commentId) {
                    return { ...t, comments: t.comments.map(c => {
                        if (c.id === commentId) {
                            const liked = c.likedBy?.includes(user.id);
                            return { ...c, likes: liked ? c.likes - 1 : c.likes + 1, likedBy: liked ? c.likedBy.filter(id => id !== user.id) : [...(c.likedBy || []), user.id] };
                        }
                        return c;
                    })};
                }
                const liked = t.likedBy?.includes(user.id);
                return { ...t, likes: liked ? t.likes - 1 : t.likes + 1, likedBy: liked ? t.likedBy.filter(id => id !== user.id) : [...(t.likedBy || []), user.id] };
            }
            return t;
        }));
    };

    const handleShare = (topic) => {
        if (!user) { onLoginRequired(); return; }
        setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, shares: t.shares + 1 } : t));
        if (navigator.share) {
            navigator.share({ title: topic.title, text: topic.content.slice(0, 100) + '...', url: window.location.href });
        } else {
            navigator.clipboard.writeText(`${topic.title}\n\n${topic.content}`);
            alert('Conteúdo copiado para a área de transferência!');
        }
    };

    const handleNewTopic = () => {
        if (!user) { onLoginRequired(); return; }
        if (!newTopic.title.trim() || !newTopic.content.trim()) return;
        const topic = {
            id: generateId(),
            ...newTopic,
            author: { name: user.name, role: user.role },
            likes: 0, likedBy: [], comments: [], shares: 0, views: 0, date: Date.now()
        };
        setTopics(prev => [topic, ...prev]);
        setNewTopic({ title: '', content: '', category: 'discussao' });
        setShowNewTopic(false);
    };

    const handleComment = () => {
        if (!user) { onLoginRequired(); return; }
        if (!newComment.trim() || !selectedTopic) return;
        const comment = { id: generateId(), author: { name: user.name }, content: newComment, date: Date.now(), likes: 0, likedBy: [] };
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, comments: [...t.comments, comment] } : t));
        setNewComment('');
        setSelectedTopic(prev => ({ ...prev, comments: [...prev.comments, comment] }));
    };

    const TopicCard = ({ topic }) => {
        const cat = CATEGORIES.find(c => c.id === topic.category) || CATEGORIES[0];
        const isLiked = topic.likedBy?.includes(user?.id);
        return React.createElement('div', { className: `card p-5 hover:shadow-lg transition-all cursor-pointer animate-fadeIn ${topic.pinned ? 'border-l-4 border-blue-500' : ''}`, onClick: () => { setSelectedTopic(topic); setTopics(prev => prev.map(t => t.id === topic.id ? { ...t, views: t.views + 1 } : t)); } },
            React.createElement('div', { className: 'flex items-start gap-4' },
                React.createElement(Avatar, { name: topic.author.name, size: 'md' }),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                    React.createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' },
                        topic.pinned && React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1' },
                            React.createElement('i', { className: 'fas fa-thumbtack' }), 'Fixado'
                        ),
                        React.createElement('span', { className: 'font-semibold text-gray-900' }, topic.author.name),
                        React.createElement('span', { className: 'text-xs text-gray-500' }, topic.author.role),
                        React.createElement('span', { className: `text-xs px-2 py-0.5 rounded-full text-white ${cat.color}` }, cat.label)
                    ),
                    React.createElement('h3', { className: 'font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors' }, topic.title),
                    React.createElement('p', { className: 'text-gray-600 text-sm line-clamp-2 mb-3' }, topic.content),
                    React.createElement('div', { className: 'flex items-center gap-6 text-sm text-gray-500' },
                        React.createElement('button', { className: `flex items-center gap-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`, onClick: (e) => { e.stopPropagation(); handleLike(topic.id); } },
                            React.createElement('i', { className: `${isLiked ? 'fas' : 'far'} fa-heart` }), topic.likes
                        ),
                        React.createElement('span', { className: 'flex items-center gap-1' },
                            React.createElement('i', { className: 'far fa-comment' }), topic.comments.length
                        ),
                        React.createElement('button', { className: 'flex items-center gap-1 hover:text-blue-500 transition-colors', onClick: (e) => { e.stopPropagation(); handleShare(topic); } },
                            React.createElement('i', { className: 'fas fa-share' }), topic.shares
                        ),
                        React.createElement('span', { className: 'flex items-center gap-1' },
                            React.createElement('i', { className: 'far fa-eye' }), topic.views
                        ),
                        isAdmin && React.createElement('div', { className: 'flex items-center gap-2 ml-2' },
                            React.createElement('button', { className: `hover:text-blue-500 transition-colors ${topic.pinned ? 'text-blue-500' : ''}`, onClick: (e) => { e.stopPropagation(); handlePinTopic(topic.id); }, title: topic.pinned ? 'Desafixar' : 'Fixar' },
                                React.createElement('i', { className: 'fas fa-thumbtack' })
                            ),
                            React.createElement('button', { className: 'hover:text-red-500 transition-colors', onClick: (e) => { e.stopPropagation(); setShowDeleteConfirm(topic.id); }, title: 'Excluir' },
                                React.createElement('i', { className: 'fas fa-trash' })
                            )
                        ),
                        React.createElement('span', { className: 'ml-auto text-xs' }, formatDateShort(topic.date))
                    )
                )
            )
        );
    };

    if (selectedTopic) {
        const cat = CATEGORIES.find(c => c.id === selectedTopic.category) || CATEGORIES[0];
        const isLiked = selectedTopic.likedBy?.includes(user?.id);
        return React.createElement('div', null,
            React.createElement('button', { className: 'flex items-center gap-2 text-blue-600 mb-4 hover:underline', onClick: () => setSelectedTopic(null) },
                React.createElement('i', { className: 'fas fa-arrow-left' }), 'Voltar ao Fórum'
            ),
            React.createElement('div', { className: 'card p-6 mb-6' },
                React.createElement('div', { className: 'flex items-start gap-4 mb-4' },
                    React.createElement(Avatar, { name: selectedTopic.author.name, size: 'lg' }),
                    React.createElement('div', null,
                        React.createElement('h3', { className: 'font-bold text-lg' }, selectedTopic.author.name),
                        React.createElement('p', { className: 'text-sm text-gray-500' }, selectedTopic.author.role),
                        React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, formatDate(selectedTopic.date))
                    ),
                    React.createElement('span', { className: `ml-auto text-sm px-3 py-1 rounded-full text-white ${cat.color}` }, cat.label)
                ),
                React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, selectedTopic.title),
                React.createElement('p', { className: 'text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap' }, selectedTopic.content),
                React.createElement('div', { className: 'flex items-center gap-6 pt-4 border-t' },
                    React.createElement('button', { className: `flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-600'}`, onClick: () => handleLike(selectedTopic.id) },
                        React.createElement('i', { className: `${isLiked ? 'fas' : 'far'} fa-heart text-lg` }), `${selectedTopic.likes} curtidas`
                    ),
                    React.createElement('button', { className: 'flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-blue-50', onClick: () => handleShare(selectedTopic) },
                        React.createElement('i', { className: 'fas fa-share text-lg' }), `${selectedTopic.shares} compartilhamentos`
                    )
                )
            ),
            React.createElement('div', { className: 'card p-6' },
                React.createElement('h3', { className: 'font-bold text-lg mb-4' }, `Comentários (${selectedTopic.comments.length})`),
                user && React.createElement('div', { className: 'flex gap-3 mb-6' },
                    React.createElement(Avatar, { name: user.name, size: 'md' }),
                    React.createElement('div', { className: 'flex-1' },
                        React.createElement('textarea', { className: 'w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', rows: 3, placeholder: 'Escreva um comentário...', value: newComment, onChange: e => setNewComment(e.target.value) }),
                        React.createElement('button', { className: 'mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700', onClick: handleComment }, 'Comentar')
                    )
                ),
                !user && React.createElement('div', { className: 'bg-gray-50 p-4 rounded-lg mb-6 text-center' },
                    React.createElement('p', { className: 'text-gray-600' }, 'Faça login para comentar'),
                    React.createElement('button', { className: 'mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg', onClick: onLoginRequired }, 'Entrar')
                ),
                React.createElement('div', { className: 'space-y-4' },
                    selectedTopic.comments.map(c => {
                        const cLiked = c.likedBy?.includes(user?.id);
                        return React.createElement('div', { key: c.id, className: 'flex gap-3 p-4 bg-gray-50 rounded-lg' },
                            React.createElement(Avatar, { name: c.author.name, size: 'sm' }),
                            React.createElement('div', { className: 'flex-1' },
                                React.createElement('div', { className: 'flex items-center gap-2 mb-1' },
                                    React.createElement('span', { className: 'font-semibold' }, c.author.name),
                                    React.createElement('span', { className: 'text-xs text-gray-500' }, formatDateShort(c.date))
                                ),
                                React.createElement('p', { className: 'text-gray-700 text-sm' }, c.content),
                                React.createElement('button', { className: `mt-2 text-sm flex items-center gap-1 ${cLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`, onClick: () => handleLike(selectedTopic.id, c.id) },
                                    React.createElement('i', { className: `${cLiked ? 'fas' : 'far'} fa-heart` }), c.likes
                                )
                            )
                        );
                    })
                )
            )
        );
    }

    return React.createElement('div', { className: 'animate-fadeIn' },
        notification && React.createElement('div', { className: `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-fadeInUp ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium flex items-center gap-2` },
            React.createElement('i', { className: `fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}` }),
            notification.message
        ),
        showDeleteConfirm && React.createElement('div', { className: 'modal-overlay', onClick: () => setShowDeleteConfirm(null) },
            React.createElement('div', { className: 'modal-content p-6 max-w-sm', onClick: e => e.stopPropagation() },
                React.createElement('div', { className: 'text-center' },
                    React.createElement('div', { className: 'w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4' },
                        React.createElement('i', { className: 'fas fa-trash text-red-500 text-2xl' })
                    ),
                    React.createElement('h3', { className: 'text-xl font-bold text-gray-900 mb-2' }, 'Excluir Tópico?'),
                    React.createElement('p', { className: 'text-gray-500 mb-6' }, 'Esta ação não pode ser desfeita.'),
                    React.createElement('div', { className: 'flex gap-3' },
                        React.createElement('button', { className: 'flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200', onClick: () => setShowDeleteConfirm(null) }, 'Cancelar'),
                        React.createElement('button', { className: 'flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600', onClick: () => handleDeleteTopic(showDeleteConfirm) }, 'Excluir')
                    )
                )
            )
        ),
        React.createElement('div', { className: 'flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6' },
            React.createElement('div', null,
                React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 'Fórum de Discussões'),
                React.createElement('p', { className: 'text-gray-500' }, 'Compartilhe experiências e aprenda com a comunidade'),
                isAdmin && React.createElement('span', { className: 'inline-flex items-center gap-1 mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold' },
                    React.createElement('i', { className: 'fas fa-shield-alt' }), 'Modo Administrador'
                )
            ),
            React.createElement('div', { className: 'flex gap-3 w-full md:w-auto' },
                React.createElement('div', { className: 'relative flex-1 md:flex-none' },
                    React.createElement('i', { className: 'fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
                    React.createElement('input', { type: 'text', className: 'w-full md:w-64 pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all', placeholder: 'Buscar tópicos...', value: searchQuery, onChange: e => setSearchQuery(e.target.value) })
                ),
                React.createElement('button', { className: 'btn-primary flex items-center gap-2 whitespace-nowrap', onClick: () => user ? setShowNewTopic(true) : onLoginRequired() },
                    React.createElement('i', { className: 'fas fa-plus' }), 'Novo Tópico'
                )
            )
        ),
        React.createElement('div', { className: 'flex gap-3 mb-6 overflow-x-auto pb-2' },
            CATEGORIES.map(cat => React.createElement('button', { key: cat.id, className: `px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${filter === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`, onClick: () => setFilter(cat.id) },
                React.createElement('i', { className: `fas ${cat.icon} mr-2` }), cat.label
            ))
        ),
        showNewTopic && React.createElement('div', { className: 'modal-overlay', onClick: () => setShowNewTopic(false) },
            React.createElement('div', { className: 'modal-content p-6', onClick: e => e.stopPropagation() },
                React.createElement('div', { className: 'flex items-center justify-between mb-6' },
                    React.createElement('h3', { className: 'text-xl font-bold' }, 'Criar Novo Tópico'),
                    React.createElement('button', { className: 'w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center', onClick: () => setShowNewTopic(false) },
                        React.createElement('i', { className: 'fas fa-times text-gray-500' })
                    )
                ),
                React.createElement('div', { className: 'space-y-4' },
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Título'),
                        React.createElement('input', { className: 'w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all', placeholder: 'Digite o título do tópico...', value: newTopic.title, onChange: e => setNewTopic({ ...newTopic, title: e.target.value }) })
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Conteúdo'),
                        React.createElement('textarea', { className: 'w-full p-3 border-2 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all', rows: 6, placeholder: 'Escreva seu conteúdo aqui...', value: newTopic.content, onChange: e => setNewTopic({ ...newTopic, content: e.target.value }) })
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Categoria'),
                        React.createElement('div', { className: 'flex flex-wrap gap-2' },
                            CATEGORIES.filter(c => c.id !== 'todos').map(c => React.createElement('button', { key: c.id, type: 'button', className: `px-4 py-2 rounded-xl font-medium transition-all ${newTopic.category === c.id ? `${c.color} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`, onClick: () => setNewTopic({ ...newTopic, category: c.id }) },
                                React.createElement('i', { className: `fas ${c.icon} mr-2` }), c.label
                            ))
                        )
                    )
                ),
                React.createElement('div', { className: 'flex gap-3 mt-6' },
                    React.createElement('button', { className: 'flex-1 btn-primary', onClick: handleNewTopic },
                        React.createElement('i', { className: 'fas fa-paper-plane mr-2' }), 'Publicar'
                    ),
                    React.createElement('button', { className: 'flex-1 btn-secondary', onClick: () => setShowNewTopic(false) }, 'Cancelar')
                )
            )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
            React.createElement('div', { className: 'lg:col-span-2 space-y-4' },
                filteredTopics.length === 0 
                    ? React.createElement('div', { className: 'card p-12 text-center' },
                        React.createElement('i', { className: 'fas fa-comments text-6xl text-gray-300 mb-4' }),
                        React.createElement('p', { className: 'text-gray-500' }, searchQuery ? 'Nenhum tópico encontrado para sua busca' : 'Nenhum tópico encontrado nesta categoria')
                    )
                    : filteredTopics.map(t => React.createElement(TopicCard, { key: t.id, topic: t }))
            ),
            React.createElement('div', { className: 'space-y-6' },
                React.createElement('div', { className: 'card p-6' },
                    React.createElement('h4', { className: 'font-bold text-gray-800 mb-4 flex items-center gap-2' },
                        React.createElement('i', { className: 'fas fa-fire text-orange-500' }), 'Tópicos em Alta'
                    ),
                    React.createElement('div', { className: 'space-y-3' },
                        topics.sort((a, b) => b.likes - a.likes).slice(0, 5).map((t, i) => React.createElement('div', { key: t.id, className: 'flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all', onClick: () => setSelectedTopic(t) },
                            React.createElement('span', { className: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}` }, i + 1),
                            React.createElement('div', { className: 'flex-1 min-w-0' },
                                React.createElement('p', { className: 'font-medium text-gray-800 text-sm line-clamp-2' }, t.title),
                                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' },
                                    React.createElement('i', { className: 'far fa-heart mr-1' }), t.likes, ' curtidas'
                                )
                            )
                        ))
                    )
                ),
                React.createElement('div', { className: 'card p-6' },
                    React.createElement('h4', { className: 'font-bold text-gray-800 mb-4 flex items-center gap-2' },
                        React.createElement('i', { className: 'fas fa-chart-bar text-blue-500' }), 'Estatísticas'
                    ),
                    React.createElement('div', { className: 'space-y-4' },
                        [
                            ['Total de Tópicos', topics.length, 'fa-file-alt', 'blue'],
                            ['Total de Comentários', topics.reduce((s, t) => s + t.comments.length, 0), 'fa-comments', 'green'],
                            ['Total de Curtidas', topics.reduce((s, t) => s + t.likes, 0), 'fa-heart', 'red']
                        ].map(([label, value, icon, color]) => React.createElement('div', { key: label, className: 'flex items-center gap-3' },
                            React.createElement('div', { className: `w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center` },
                                React.createElement('i', { className: `fas ${icon} text-${color}-500` })
                            ),
                            React.createElement('div', null,
                                React.createElement('p', { className: 'text-lg font-bold text-gray-800' }, value),
                                React.createElement('p', { className: 'text-xs text-gray-500' }, label)
                            )
                        ))
                    )
                )
            )
        )
    );
};
