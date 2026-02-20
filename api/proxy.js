// api/proxy.js
// Универсальный прокси для DeepSeek API и MOEX ISS с токеном

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ---- Запрос к MOEX ISS с токеном (GET) ----
    if (req.method === 'GET' && req.query.url) {
        try {
            const targetUrl = decodeURIComponent(req.query.url);
            
            // Заголовки, имитирующие браузер + токен авторизации
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.moex.com/',
                'Origin': 'https://www.moex.com'
            };

            // Если передан токен, добавляем его в заголовок
            if (req.headers.authorization) {
                headers['Authorization'] = req.headers.authorization;
            }

            const response = await fetch(targetUrl, { headers });
            const data = await response.json();
            res.status(response.status).json(data);
            return;
        } catch (error) {
            console.error('Proxy MOEX error:', error);
            res.status(500).json({ error: error.message });
            return;
        }
    }

    // ---- Запрос к DeepSeek API (POST) ----
    if (req.method === 'POST') {
        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                },
                body: JSON.stringify(req.body)
            });
            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            console.error('Proxy DeepSeek error:', error);
            res.status(500).json({ error: error.message });
        }
        return;
    }

    res.status(405).json({ error: 'Method not allowed' });
}
