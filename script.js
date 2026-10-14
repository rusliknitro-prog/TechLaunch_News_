let loggedIn = false;
let currentUser = '';

const POSTS_KEY = 'techlaunch_posts';

function showSection(id) {
    document.querySelectorAll('.content').forEach(section => {
        section.classList.remove('active');
    });

    const section = document.getElementById(id);
    if (section) section.classList.add('active');

    document.querySelectorAll('.sidebar button').forEach(button => {
        button.classList.remove('active');
    });

    const navButton = document.getElementById('nav-' + id);
    if (navButton) navButton.classList.add('active');

    if (id === 'add') renderPosts();
}

function openLogin() {
    document.getElementById('loginModal').classList.add('open');
    setTimeout(() => document.getElementById('username').focus(), 100);
}

function closeLogin() {
    document.getElementById('loginModal').classList.remove('open');

    const msg = document.getElementById('loginMessage');
    msg.textContent = '';
    msg.className = '';
}

document.getElementById('loginModal').addEventListener('click', function (e) {
    if (e.target === this) closeLogin();
});

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const msg = document.getElementById('loginMessage');

    if (!username || !password) {
        msg.textContent = '⚠️ Заполните все поля';
        msg.className = 'msg-error';
        return;
    }

    if (username.length < 3 || password.length < 3) {
        msg.textContent = '⚠️ Минимум 3 символа в каждом поле';
        msg.className = 'msg-error';
        return;
    }

    loggedIn = true;
    currentUser = username;

    msg.textContent = '✅ Добро пожаловать, ' + username + '!';
    msg.className = 'msg-success';

    updateAuthUI();

    setTimeout(() => {
        closeLogin();
        renderPosts();
    }, 900);
}

function logout() {
    loggedIn = false;
    currentUser = '';
    updateAuthUI();
    renderPosts();
}

function updateAuthUI() {
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const greeting = document.getElementById('userGreeting');
    const lockedHint = document.getElementById('lockedHint');

    btnLogin.style.display = loggedIn ? 'none' : 'block';
    btnLogout.style.display = loggedIn ? 'block' : 'none';
    greeting.style.display = loggedIn ? 'block' : 'none';

    greeting.textContent = loggedIn ? '👤 ' + currentUser : '';

    if (lockedHint) {
        lockedHint.style.display = loggedIn ? 'none' : 'inline-flex';
    }
}

function getPosts() {
    try {
        const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
        return Array.isArray(posts) ? posts : [];
    } catch (error) {
        console.error('Не удалось прочитать новости:', error);
        return [];
    }
}

function savePosts(posts) {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        return true;
    } catch (error) {
        alert('Не удалось сохранить новость. Проверьте настройки браузера и доступное место.');
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

function addPost() {
    if (!loggedIn) {
        openLogin();
        return;
    }

    const titleInput = document.getElementById('title');
    const textInput = document.getElementById('text');

    const title = titleInput.value.trim();
    const text = textInput.value.trim();

    if (!title || !text) {
        alert('Заполните заголовок и текст новости.');
        return;
    }

    const posts = getPosts();

    const post = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title: title,
        text: text,
        author: currentUser,
        date: new Date().toISOString()
    };

    posts.unshift(post);

    if (!savePosts(posts)) return;

    titleInput.value = '';
    textInput.value = '';

    renderPosts();

    alert('✅ Новость успешно опубликована!');
}

function renderPosts() {
    const container = document.getElementById('userPosts');
    if (!container) return;

    container.replaceChildren();

    const posts = getPosts();

    if (posts.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-posts';
        empty.textContent = 'Пока нет опубликованных новостей.';
        container.appendChild(empty);
        return;
    }

    posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'user-post';

        const heading = document.createElement('h3');
        heading.textContent = post.title;

        const paragraph = document.createElement('p');
        paragraph.style.whiteSpace = 'pre-wrap';
        paragraph.textContent = post.text;

        const meta = document.createElement('div');
        meta.className = 'user-post-meta';

        const date = new Date(post.date);
        const dateStr = Number.isNaN(date.getTime())
            ? ''
            : date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

        meta.textContent = `Опубликовал: ${post.author} · ${dateStr}`;

        article.append(heading, paragraph, meta);

        // Удалять публикации может только автор
        if (loggedIn && post.author === currentUser) {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn-delete';
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', () => deletePost(post.id));
            article.appendChild(deleteButton);
        }

        container.appendChild(article);
    });
}

function deletePost(id) {
    if (!loggedIn) {
        openLogin();
        return;
    }

    const posts = getPosts();
    const post = posts.find(item => item.id === id);

    if (!post || post.author !== currentUser) {
        alert('Можно удалять только свои публикации.');
        return;
    }

    if (!confirm('Вы действительно хотите удалить эту новость?')) return;

    const updatedPosts = posts.filter(item => item.id !== id);

    if (savePosts(updatedPosts)) {
        renderPosts();
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

// Инициализация сайта
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    renderPosts();
});