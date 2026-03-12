let loggedIn = false;
    let currentUser = '';

    function showSection(id) {
        document.querySelectorAll('.content').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');

        document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
        const navBtn = document.getElementById('nav-' + id);
        if (navBtn) navBtn.classList.add('active');
    }

    function openLogin() {
        document.getElementById('loginModal').classList.add('open');
        setTimeout(() => document.getElementById('username').focus(), 100);
    }

    function closeLogin() {
        document.getElementById('loginModal').classList.remove('open');
        document.getElementById('loginMessage').textContent = '';
        document.getElementById('loginMessage').className = '';
    }

    // Закрытие по клику на фон
    document.getElementById('loginModal').addEventListener('click', function(e) {
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

        // Успешный вход
        loggedIn = true;
        currentUser = username;

        msg.textContent = '✅ Добро пожаловать, ' + username + '!';
        msg.className = 'msg-success';

        setTimeout(() => {
            closeLogin();
            updateAuthUI();
        }, 900);
    }

    function logout() {
        loggedIn = false;
        currentUser = '';
        updateAuthUI();
    }

    function updateAuthUI() {
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        const greeting = document.getElementById('userGreeting');
        const lockedHint = document.getElementById('lockedHint');

        if (loggedIn) {
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'block';
            greeting.style.display = 'block';
            greeting.textContent = '👤 ' + currentUser;
            if (lockedHint) lockedHint.style.display = 'none';
        } else {
            btnLogin.style.display = 'block';
            btnLogout.style.display = 'none';
            greeting.style.display = 'none';
            if (lockedHint) lockedHint.style.display = 'inline-flex';
        }
    }

    function addPost() {
        if (!loggedIn) {

            openLogin();
            return;
        }

        const title = document.getElementById('title').value.trim();
        const text = document.getElementById('text').value.trim();

        if (!title || !text) {
            alert('Заполните заголовок и текст новости.');
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

        const post = document.createElement('div');
        post.className = 'user-post';
        post.innerHTML = `
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
            <div class="user-post-meta">Опубликовал: ${escapeHtml(currentUser)} · ${dateStr}</div>
        `;

        const container = document.getElementById('userPosts');
        container.insertBefore(post, container.firstChild);

        document.getElementById('title').value = '';
        document.getElementById('text').value = '';
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }