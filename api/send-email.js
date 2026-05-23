import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Разрешаем CORS-запросы (чтобы фронтенд мог достучаться до бэкэнда)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email обязателен' });
    }

    const secretCode = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS  
        }
    });

    try {
        await transporter.sendMail({
            // Жестко привязываем отправителя к вашей почте, иначе Mail.ru сбросит соединение
            from: `Робот Верификации <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Ваш код подтверждения',
            text: `Здравствуйте! Ваш секретный код подтверждения: ${secretCode}`,
            html: `<p>Здравствуйте!</p><h3>Ваш секретный код подтверждения: <strong style="color: #0070f3; font-size: 24px;">${secretCode}</strong></h3>`
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message || 'Ошибка отправки' });
    }
}
