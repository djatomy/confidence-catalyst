document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        name: '',
        date: '',
        attribute: null,
        touchCount: 0
    };

    // Elements
    const screens = {
        entry: document.getElementById('entry-screen'),
        sync: document.getElementById('sync-screen'),
        insight: document.getElementById('insight-screen'),
        release: document.getElementById('release-screen')
    };

    // Utility: Switch screen
    function switchScreen(toScreenId) {
        Object.values(screens).forEach(screen => {
            if (screen.classList.contains('active')) {
                screen.style.opacity = 0;
                setTimeout(() => {
                    screen.classList.remove('active');
                    screens[toScreenId].classList.add('active');
                    // Trigger reflow to apply transition
                    void screens[toScreenId].offsetWidth;
                    screens[toScreenId].style.opacity = 1;
                }, 1500); // Wait for fade out
            }
        });
    }

    // --- Entry Screen Logic ---
    const inputName = document.getElementById('input-name');
    const inputDate = document.getElementById('input-date');
    const inputPartnerName = document.getElementById('input-partner-name');
    const attrBtns = document.querySelectorAll('.attr-btn');
    const bgGradient = document.getElementById('background-gradient');
    
    // Restore
    if (localStorage.getItem('cc_name')) inputName.value = localStorage.getItem('cc_name');
    if (localStorage.getItem('cc_date')) inputDate.value = localStorage.getItem('cc_date');
    if (localStorage.getItem('cc_partner_name')) inputPartnerName.value = localStorage.getItem('cc_partner_name');
    if (localStorage.getItem('cc_partner_type')) document.getElementById('input-partner-type').value = localStorage.getItem('cc_partner_type');
    
    if (localStorage.getItem('cc_attr')) {
        let attr = localStorage.getItem('cc_attr');
        if (attr === 'sea') {
            attr = 'forest'; // Migration for users with old cached data
            localStorage.setItem('cc_attr', attr);
        }
        document.querySelector(`.attr-btn[data-attr="${attr}"]`)?.classList.add('selected');
        state.attribute = attr;
        updateBackground(attr);
    }

    function updateBackground(attr) {
        const gradients = {
            light: 'linear-gradient(135deg, #FAF8F5 0%, rgba(212,163,115,0.2) 100%)', // 光→暖かな金色
            earth: 'linear-gradient(135deg, #FAF8F5 0%, rgba(180,120,80,0.2) 100%)', // 地→琥珀色
            moon: 'linear-gradient(135deg, #FAF8F5 0%, rgba(120,150,200,0.2) 100%)', // 月→柔らかな銀青
            forest:  'linear-gradient(135deg, #FAF8F5 0%, rgba(80,160,110,0.2) 100%)' // 森→深い緑色
        };
        if(gradients[attr]) bgGradient.style.background = gradients[attr];
    }

    attrBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            attrBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.attribute = btn.getAttribute('data-attr');
            updateBackground(state.attribute);
            
            // Haptic
            if (navigator.vibrate) navigator.vibrate(10);
        });
    });

    document.getElementById('btn-sync-start').addEventListener('click', () => {
        state.name = inputName.value || 'あなた';
        state.date = inputDate.value || '0000-00-00';
        state.partnerName = inputPartnerName.value || 'お相手';
        state.partnerType = document.getElementById('input-partner-type').value;
        if (!state.attribute) state.attribute = 'light'; // default
        
        localStorage.setItem('cc_name', state.name);
        localStorage.setItem('cc_date', state.date);
        localStorage.setItem('cc_partner_name', state.partnerName);
        localStorage.setItem('cc_partner_type', state.partnerType);
        localStorage.setItem('cc_attr', state.attribute);
        
        switchScreen('sync');
    });

    // --- Sync Screen Logic ---
    const orb = document.getElementById('sync-orb');
    const syncText = document.getElementById('sync-text');
    let holdTimer = null;
    let vibrateInterval = null;
    const HOLD_DURATION = 4000; // 4 seconds

    function startHold(e) {
        e.preventDefault();
        orb.classList.add('holding');
        syncText.style.opacity = 1;
        
        if (navigator.vibrate) navigator.vibrate(20);
        
        vibrateInterval = setInterval(() => {
            if (navigator.vibrate) navigator.vibrate(5);
        }, 1000);

        holdTimer = setTimeout(() => {
            completeSync();
        }, HOLD_DURATION);
    }

    function cancelHold() {
        orb.classList.remove('holding');
        syncText.style.opacity = 0;
        clearTimeout(holdTimer);
        clearInterval(vibrateInterval);
    }

    function completeSync() {
        cancelHold();
        if (navigator.vibrate) navigator.vibrate([30, 50, 100]); // deep vibration
        
        // Setup Insight Data before transitioning
        setupInsightData();
        
        switchScreen('insight');
    }

    orb.addEventListener('mousedown', startHold);
    orb.addEventListener('touchstart', startHold, {passive: false});
    document.addEventListener('mouseup', cancelHold);
    document.addEventListener('touchend', cancelHold);

    // --- Insight Screen Logic ---
    function animateScore(id, targetValue) {
        const el = document.getElementById(id);
        const startValue = targetValue - Math.floor(Math.random() * 5 + 3); // Start 3-8 points below
        let current = startValue;
        
        el.textContent = current;
        
        const interval = setInterval(() => {
            if (current >= targetValue) {
                clearInterval(interval);
            } else {
                current += 1;
                el.textContent = current;
            }
        }, 200); // slow tick
    }
    
    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function setupInsightData() {
        // Scores
        const confTarget = 92 + Math.floor(Math.random() * 8); // 92-99
        const resTarget = 90 + Math.floor(Math.random() * 10); // 90-99
        
        setTimeout(() => {
            animateScore('score-confidence', confTarget);
            animateScore('score-resonance', resTarget);
        }, 2500); // wait for screen transition

        // Symbol
        const attrSymbols = appData.symbols[state.attribute];
        const symbol = getRandomItem(attrSymbols);
        
        const icons = {
            "ぽかぽかの日": "☀️",
            "どっしりした山": "⛰️",
            "静かな月明かり": "🌒",
            "深い緑の森": "🌲"
        };
        
        const imageFileMap = {
            "light": "light_art.jpg",
            "earth": "earth_art.jpg",
            "moon": "moon_art.jpg",
            "forest": "sea_art.jpg" // Note: sea_art.jpg actually contains the forest image
        };
        
        document.getElementById('insight-image').src = imageFileMap[state.attribute] || "light_art.jpg";
        
        document.getElementById('insight-symbol-icon').textContent = icons[symbol.name] || '✨';
        document.getElementById('insight-symbol-name').textContent = symbol.name;
        document.getElementById('insight-symbol-desc').textContent = symbol.desc;

        // Texts
        const nameText = getRandomItem(appData.compatibilityAnalysis).replace(/\[PARTNER\]/g, state.partnerName);
        const fateText = getRandomItem(appData.fateAnalysis).text.replace(/\[PARTNER\]/g, state.partnerName);
        
        let adviceText = "";
        if (state.partnerType && state.partnerType !== "none" && appData.partnerTypes[state.partnerType]) {
            adviceText = appData.partnerTypes[state.partnerType].advice.replace(/\[PARTNER\]/g, state.partnerName);
        } else {
            adviceText = getRandomItem(appData.advices).replace(/\[PARTNER\]/g, state.partnerName);
        }

        document.getElementById('insight-name-text').textContent = nameText;
        document.getElementById('insight-fate-text').textContent = fateText;
        document.getElementById('insight-advice-text').textContent = adviceText;
    }

    // --- Release Screen Logic ---
    const releaseScreen = document.getElementById('release-screen');
    const msg1 = document.getElementById('release-msg-1');
    const msg2 = document.getElementById('release-msg-2');
    const msg3 = document.getElementById('release-msg-3');
    const btnFinal = document.getElementById('btn-final');
    
    // Auto-reveal sequence is triggered inside the "btn-release-start" click handler
    document.getElementById('btn-release-start').addEventListener('click', () => {
        const msgs = getRandomItem(appData.releaseMessages);
        msg1.textContent = msgs[0].replace(/\[PARTNER\]/g, state.partnerName);
        msg2.textContent = msgs[1].replace(/\[PARTNER\]/g, state.partnerName);
        msg3.textContent = msgs[2].replace(/\[PARTNER\]/g, state.partnerName);
        
        switchScreen('release');
        
        // Fast, automated stagger effect
        setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(5);
            msg1.classList.add('visible');
        }, 800);
        setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(5);
            msg2.classList.add('visible');
        }, 1800);
        setTimeout(() => {
            if (navigator.vibrate) navigator.vibrate(10);
            msg3.classList.add('visible');
        }, 2800);
        setTimeout(() => {
            btnFinal.classList.add('visible');
        }, 3600);
    });

    btnFinal.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Add a satisfying press effect
        btnFinal.style.transform = 'scale(0.95)';
        
        // Flash overlay
        const flash = document.getElementById('flash-overlay');
        flash.style.opacity = 1;
        
        setTimeout(() => {
            // お相手の情報をクリアする（次回のクリーンな体験のため）
            localStorage.removeItem('cc_partner_name');
            localStorage.removeItem('cc_partner_type');
            state.partnerName = '';
            state.partnerType = 'none';
            document.getElementById('input-partner-name').value = '';
            document.getElementById('input-partner-type').value = 'none';

            // Reset state
            msg1.classList.remove('visible');
            msg2.classList.remove('visible');
            msg3.classList.remove('visible');
            btnFinal.classList.remove('visible');
            btnFinal.style.transform = 'scale(1)';
            
            // Go back to entry invisibly
            screens['release'].classList.remove('active');
            screens['entry'].classList.add('active');
            screens['entry'].style.opacity = 1;
            screens['release'].style.opacity = 0;
            
            // Fade out flash
            flash.style.opacity = 0;
        }, 1500); // Faster completion reset
    });
});
