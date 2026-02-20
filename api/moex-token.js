// api/moex-token.js
// Получение токена доступа к MOEX API через логин/пароль от ЛКУ

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        // Запрос токена к MOEX SSO [citation:2][citation:5]
        const tokenResponse = await fetch('https://sso.moex.com/auth/realms/SSO/protocol/openid-connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'password',
                username: username,
                password: password,
                client_id: 'PASSPORT_PUBLIC', // Фиксированный client_id для публичного доступа [citation:5]
                scope: 'openid' // базовый scope
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(tokenData.error_description || tokenData.error || 'Authentication failed');
        }

        // Возвращаем токен клиенту
        res.status(200).json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            refresh_token: tokenData.refresh_token
        });

    } catch (error) {
        console.error('MOEX token error:', error);
        res.status(500).json({ error: error.message });
    }
}
