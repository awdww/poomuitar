// เว็บแกล้งควาย - กดออกไม่ได้
(function() {
    const bgMusic = document.getElementById('bgMusic');
    const overlay = document.getElementById('clickOverlay');
    const overlayText = overlay.querySelector('h1');

    function playMusic() {
        if (!bgMusic) return;
        bgMusic.volume = 1.0;
        bgMusic.play().then(function() {
            // ไม่ซ่อน overlay - กดออกไม่ได้
            overlayText.textContent = 'ยินดีต้อนรับ';
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
