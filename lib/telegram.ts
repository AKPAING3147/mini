export const BOT_TOKEN = process.env.BOT_TOKEN;

export async function sendTelegramMessage(chatId: string, text: string) {
    if (!BOT_TOKEN) {
        console.error('BOT_TOKEN is not set');
        return false;
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await res.json();
        if (!data.ok) {
            console.error('Telegram API Error:', data);
        }
        return data.ok;
    } catch (e) {
        console.error('Network Error:', e);
        return false;
    }
}
