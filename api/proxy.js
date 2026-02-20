export default async function handler(req, res) {
    // Разрешаем CORS для всех источников
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Если есть параметр url в query - это запрос к MOEX (GET)
    if (req.method === 'GET' && req.query.url) {
        try {
            const response = await fetch(decodeURIComponent(req.query.url));
            const data = await response.json();
            res.status(response.status).json(data);
            return;
        } catch (error) {
            res.status(500).json({ error: error.message });
            return;
        }
    }

    // Иначе - POST запрос к DeepSeek
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
            res.status(500).json({ error: error.message });
        }
        return;
    }

    res.status(405).json({ error: 'Method not allowed' });
}
