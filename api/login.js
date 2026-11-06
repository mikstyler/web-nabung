async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Mengarah ke Serverless Functions Vercel
    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        alert(data.message);

        if (data.success) {
            if (isLoginMode) {
                // Simpan sesi login lokal sementara di browser
                localStorage.setItem('mbd_logged_user', data.user.username);
                tampilkanWelcomeScreen(data.user.username);
            } else {
                // Berhasil daftar, otomatis pindah ke mode login
                switchMode();
                document.getElementById('auth-form').reset();
            }
        }
    } catch (err) {
        alert('Gagal terhubung ke database server Vercel.');
    }
}
