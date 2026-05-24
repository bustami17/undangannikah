// ==========================================
// 1. MANAJEMEN NAMA TAMU OTOMATIS (URL PARAM)
// ==========================================
function getGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    // Mendukung parameter ?to= , ?nama= , atau ?u=
    const to = urlParams.get('to') || urlParams.get('nama') || urlParams.get('u');
    if (to) {
        return decodeURIComponent(to.replace(/\+/g, ' '));
    }
    return null;
}

// Set nama ketika halaman selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    const guestName = getGuestName();
    if (guestName) {
        document.getElementById('guestName').textContent = guestName;
        document.getElementById('rsvpName').value = guestName;
    }
    // Cegah scroll saat screen opening masih aktif
    document.body.style.overflow = 'hidden';
});

// ==========================================
// 2. KONTROL AUDIO & TOMBOL BUKA UNDANGAN
// ==========================================
const music = document.getElementById('weddingMusic');
const musicBtn = document.getElementById('musicControlBtn');
const musicIcon = document.getElementById('musicIcon');

function openInvitation() {
    // Sembunyikan opening screen & aktifkan halaman utama
    document.getElementById('opening').classList.add('hidden');
    document.getElementById('main').classList.add('active');
    document.body.style.overflow = 'auto';
    
    // Putar musik otomatis setelah tombol diklik
    playMusic();
    
    // Mulai hitung mundur waktu acara
    startCountdown();
}

function toggleMusic() {
    if (music.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
}

function playMusic() {
    music.play().then(() => {
        musicBtn.classList.add('playing');
        musicIcon.classList.remove('fa-music');
        musicIcon.classList.add('fa-pause'); // Ganti ikon ke pause
    }).catch(err => {
        console.log("Autoplay diblokir oleh browser, membutuhkan interaksi pengguna.", err);
    });
}

function pauseMusic() {
    music.pause();
    musicBtn.classList.remove('playing');
    musicIcon.classList.remove('fa-pause');
    musicIcon.classList.add('fa-music'); // Kembalikan ke ikon musik
    musicBtn.classList.add('manually-paused'); // Tanda jika di-pause manual
}

// Trik Autoplay Alternatif jika browser memblokir audio di awal
document.addEventListener('click', function() {
    if (music.paused && !musicBtn.classList.contains('manually-paused') && document.getElementById('main').classList.contains('active')) {
        playMusic();
    }
}, { once: true });


// ==========================================
// 3. LOGIKA HITUNG MUNDUR (COUNTDOWN)
// ==========================================
function startCountdown() {
    // Format tanggal: Tahun-Bulan-HariTHari:Menit:Detik+ZonaWaktu (WITA = +08:00)
    const weddingDate = new Date('2026-06-28T09:00:00+08:00').getTime();
    
    const interval = setInterval(windowUpdate, 1000);
    
    function windowUpdate() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            clearInterval(interval);
            document.getElementById('countdown').innerHTML = '<div style="font-size:1.5rem;color:var(--flores-gold)">Hari Bahagia Telah Tiba!</div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
}


// ==========================================
// 4. FITUR SALIN NOMOR REKENING
// ==========================================
function copyRek(id, btn) {
    const text = document.getElementById(id).textContent.replace(/\s/g, '');
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('copied');
        }, 2000);
    });
}


// ==========================================
// 5. SUBMIT RSVP KE WHATSAPP
// ==========================================
function submitRSVP(e) {
    e.preventDefault();
    const name = document.getElementById('rsvpName').value;
    const attend = document.getElementById('rsvpAttend').value;
    const message = document.getElementById('rsvpMessage').value;
    
    const whatsappMsg = `Assalamu'alaikum, saya *${name}* ingin konfirmasi kehadiran:%0A%0A*Status Kehadiran:* ${attend}%0A*Ucapan/Doa:* ${message || '-'}`;
    
    // Mengarah ke nomor WhatsApp pengantin/panitia yang tertera di kode awal Anda
    window.open(`https://wa.me/6281270432509?text=${whatsappMsg}`, '_blank');
    
    alert('Terima kasih! Konfirmasi Anda akan diteruskan ke WhatsApp.');
    e.target.reset();
    
    // Kembalikan nama default dari URL jika ada
    const guestName = getGuestName();
    if (guestName) document.getElementById('rsvpName').value = guestName;
}

// ==========================================
// 5. FITUR UCAPAN & DOA (GUESTBOOK)
// ==========================================

// Memuat ucapan yang tersimpan saat halaman dibuka
window.addEventListener('DOMContentLoaded', loadWishes);

function submitRSVP(e) {
    e.preventDefault();
    
    // Ambil nilai dari form
    const name = document.getElementById('rsvpName').value;
    const attend = document.getElementById('rsvpAttend').value;
    const message = document.getElementById('rsvpMessage').value;
    
    // Buat objek ucapan baru
    const newWish = {
        id: Date.now(),
        name: name,
        attend: attend,
        message: message,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    
    // Ambil data lama dari LocalStorage (simulasi database)
    let wishes = JSON.parse(localStorage.getItem('weddingWishes')) || [];
    
    // Masukkan pesan baru ke urutan paling atas
    wishes.unshift(newWish);
    
    // Simpan kembali
    localStorage.setItem('weddingWishes', JSON.stringify(wishes));
    
    // Render ulang tampilan ucapan
    loadWishes();
    
    // Bersihkan form
    e.target.reset();
    
    // Opsional: Tetap arahkan ke WhatsApp
    const whatsappMsg = `Assalamu'alaikum, saya *${name}* ingin konfirmasi kehadiran:%0A%0A*Status Kehadiran:* ${attend}%0A*Ucapan/Doa:* ${message}`;
    window.open(`https://wa.me/6281270432509?text=${whatsappMsg}`, '_blank');
}

function loadWishes() {
    const container = document.getElementById('wishesContainer');
    const countDisplay = document.getElementById('wishCount');
    let wishes = JSON.parse(localStorage.getItem('weddingWishes')) || [];
    
    countDisplay.textContent = wishes.length;
    
    if (wishes.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted mt-5">
                <i class="fas fa-envelope-open-text fa-3x mb-3 opacity-25"></i>
                <p>Belum ada ucapan. Jadilah yang pertama!</p>
            </div>`;
        return;
    }
    
    container.innerHTML = ''; // Kosongkan kontainer
    
    wishes.forEach(wish => {
        // Tentukan warna badge berdasarkan kehadiran
        const badgeClass = wish.attend.toLowerCase().includes('tidak') ? 'badge-tidak' : 'badge-hadir';
        const icon = wish.attend.toLowerCase().includes('tidak') ? 'fa-times-circle' : 'fa-check-circle';
        
        const bubble = document.createElement('div');
        bubble.className = 'wish-bubble';
        bubble.innerHTML = `
            <div class="wish-header">
                <span class="wish-name"><i class="fas fa-user-circle text-muted me-1"></i> ${wish.name}</span>
                <span class="wish-badge ${badgeClass}"><i class="fas ${icon}"></i> ${wish.attend}</span>
            </div>
            <p class="wish-text">"${wish.message}"</p>
            <span class="wish-time">${wish.date}</span>
        `;
        container.appendChild(bubble);
    });
}