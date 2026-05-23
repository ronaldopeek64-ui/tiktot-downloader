import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email обязателен' });
    }

    // Генерируем случайный 6-значный код
    const secretCode = Math.floor(100000 + Math.random() * 900000);

    // Настройка почтового робота под Mail.ru
    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER, // Ваша почта из настроек Vercel
            pass: process.env.EMAIL_PASS // Ваш секретный пароль приложения
        }
    });

    try {
        await transporter.sendMail({
            from: `"Робот Верификации" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Ваш код подтверждения',
            text: `Здравствуйте! Ваш секретный код подтверждения: ${secretCode}`,
            html: `<p>Здравствуйте!</p><h3>Ваш секретный код подтверждения: <strong style="color: #0070f3; font-size: 24px;">${secretCode}</strong></h3>`
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Не удалось отправить письмо' });
    }
}
