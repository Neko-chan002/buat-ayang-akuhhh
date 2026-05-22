/* 
 * music.js - Floating Premium Music Widget with Iframe Seamless BGM Shell
 * Designed for Ka Haura's Birthday Website
 */

(function () {
    const IS_IFRAME = window.self !== window.top;

    // =========================================================================
    // 1. TOP WINDOW LOGIC (BGM SHELL MANAGER)
    // =========================================================================
    if (!IS_IFRAME) {
        // Prevent double execution in the top window
        if (window.bgmShellInitialized) return;
        window.bgmShellInitialized = true;

        const currentUrl = new URL(window.location.href);

        // If the URL already has the shell flag, we do not wrap again (failsafe)
        if (!currentUrl.searchParams.has('bgm_shell')) {
            // Determine the target content page inside the iframe
            let targetSrc = window.location.href;
            const hash = window.location.hash;
            if (hash && hash.startsWith('#') && hash.length > 1) {
                const targetPage = hash.substring(1);
                try {
                    targetSrc = new URL(targetPage, window.location.href).href;
                } catch (e) {
                    console.error("Failed to resolve hash URL, falling back", e);
                }
            }

            // Append bgm_shell=true to the iframe's source URL to let it know it's a child
            const iframeUrl = new URL(targetSrc);
            iframeUrl.searchParams.set('bgm_shell', 'true');

            // Save parent document title
            const originalTitle = document.title;

            // Replace parent document content with the premium Fullscreen Iframe Shell
            document.documentElement.innerHTML = `
                <head>
                    <title>${originalTitle}</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
                    <style>
                        html, body {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                            background: #2b1b3d; /* Smooth dark elegant background */
                        }
                        iframe {
                            width: 100%;
                            height: 100%;
                            border: none;
                            margin: 0;
                            padding: 0;
                            display: block;
                            background: transparent;
                        }
                    </style>
                </head>
                <body>
                    <iframe id="bgm-content-frame" name="bgm_content_iframe" src="${iframeUrl.href}"></iframe>
                </body>
            `;

            // Configuration & BGM Source
            const BGM_URL = 'Andmesh Kamelang - Cinta Luar Biasa (Speed Up  Lyrics).mp3';
            const BGM_PLAYING_KEY = 'bgm_playing';

            // Audio Setup
            let audio = new Audio(BGM_URL);
            audio.loop = true;
            audio.volume = 0.5; // Soft romance volume
            window.bgmAudio = audio;

            // Bersihkan data posisi pemutaran lama jika ada
            localStorage.removeItem('bgm_time');

            // Inject CSS Styles for Floating Player Widget
            const style = document.createElement('style');
            style.id = 'bgm-style-tag';
            style.innerHTML = `
                /* Premium Floating Player Widget */
                .music-player-widget {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    padding: 10px 14px;
                    border-radius: 40px;
                    box-shadow: 0 10px 30px rgba(107, 45, 55, 0.12);
                    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                    cursor: pointer;
                    user-select: none;
                    font-family: 'Poppins', 'Inter', sans-serif;
                }

                @media (max-width: 600px) {
                    .music-player-widget {
                        bottom: 16px;
                        right: 16px;
                        padding: 8px 12px;
                    }
                }

                .music-player-widget:hover {
                    transform: scale(1.06) translateY(-2px);
                    background: rgba(255, 255, 255, 0.6);
                    box-shadow: 0 14px 35px rgba(107, 45, 55, 0.22);
                    border-color: rgba(255, 255, 255, 0.8);
                }

                .music-player-widget:active {
                    transform: scale(0.96) translateY(0);
                }

                /* Music Bars Visualizer Container */
                .music-visualizer {
                    display: flex;
                    align-items: flex-end;
                    gap: 3.5px;
                    width: 22px;
                    height: 18px;
                    overflow: hidden;
                }

                /* Visualizer Bars with a gorgeous Rose Gold Gradient */
                .visualizer-bar {
                    width: 3px;
                    height: 4px;
                    background: linear-gradient(to top, #B5935B, #6B2D37);
                    border-radius: 20px;
                    transition: height 0.3s ease;
                }

                /* When playing, animate bars */
                .music-player-widget.playing .visualizer-bar {
                    animation: barBounce 0.8s ease-in-out infinite alternate;
                }

                .music-player-widget.playing .visualizer-bar:nth-child(1) { animation-delay: 0.15s; animation-duration: 0.75s; }
                .music-player-widget.playing .visualizer-bar:nth-child(2) { animation-delay: 0.35s; animation-duration: 0.95s; }
                .music-player-widget.playing .visualizer-bar:nth-child(3) { animation-delay: 0.0s; animation-duration: 0.65s; }
                .music-player-widget.playing .visualizer-bar:nth-child(4) { animation-delay: 0.5s; animation-duration: 0.85s; }

                @keyframes barBounce {
                    0% { height: 4px; }
                    100% { height: 18px; }
                }

                /* Elegant label for details */
                .music-label {
                    font-size: 0.72rem;
                    font-weight: 500;
                    color: #6B2D37;
                    letter-spacing: 0.8px;
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                    white-space: nowrap;
                    transition: max-width 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
                    text-transform: uppercase;
                }

                .music-player-widget:hover .music-label {
                    max-width: 90px;
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);

            // Create Player Widget UI
            const widget = document.createElement('div');
            widget.className = 'music-player-widget';
            widget.innerHTML = `
                <div class="music-visualizer">
                    <div class="visualizer-bar"></div>
                    <div class="visualizer-bar"></div>
                    <div class="visualizer-bar"></div>
                    <div class="visualizer-bar"></div>
                </div>
                <span class="music-label">Musik • ON</span>
            `;
            document.body.appendChild(widget);

            // Playback Functions
            function playAudio() {
                audio.play().then(() => {
                    localStorage.setItem(BGM_PLAYING_KEY, 'true');
                    widget.classList.add('playing');
                    widget.querySelector('.music-label').textContent = 'Musik • ON';
                    removeInteractionListeners();
                }).catch(err => {
                    console.log("Autoplay blocked. Awaiting user interaction inside the shell.", err);
                    widget.classList.remove('playing');
                    widget.querySelector('.music-label').textContent = 'Mulai Musik';
                });
            }

            function pauseAudio() {
                audio.pause();
                localStorage.setItem(BGM_PLAYING_KEY, 'false');
                widget.classList.remove('playing');
                widget.querySelector('.music-label').textContent = 'Musik • OFF';
            }

            function togglePlay(e) {
                if (e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (audio.paused) {
                    playAudio();
                } else {
                    pauseAudio();
                }
            }

            widget.addEventListener('click', togglePlay);

            // Interaction listeners for top window
            function handleUserGesture() {
                if (localStorage.getItem(BGM_PLAYING_KEY) === 'true') {
                    playAudio();
                }
            }

            function addInteractionListeners() {
                window.addEventListener('click', handleUserGesture, { once: true });
                window.addEventListener('touchstart', handleUserGesture, { once: true });
                window.addEventListener('keydown', handleUserGesture, { once: true });
            }

            function removeInteractionListeners() {
                window.removeEventListener('click', handleUserGesture);
                window.removeEventListener('touchstart', handleUserGesture);
                window.removeEventListener('keydown', handleUserGesture);
            }

            // Initial Playback Action
            const isPlayingSaved = localStorage.getItem(BGM_PLAYING_KEY) === 'true';
            if (isPlayingSaved) {
                playAudio();
                if (audio.paused) {
                    addInteractionListeners();
                }
            } else {
                widget.classList.remove('playing');
                widget.querySelector('.music-label').textContent = 'Mulai Musik';
            }

            // Secure postMessage communication channel
            window.addEventListener('message', (e) => {
                if (!e.data) return;

                if (e.data.type === 'play') {
                    playAudio();
                } else if (e.data.type === 'pause') {
                    pauseAudio();
                } else if (e.data.type === 'user_gesture') {
                    // Unlock audio on any child page click if BGM is enabled but paused
                    if (localStorage.getItem(BGM_PLAYING_KEY) === 'true' && audio.paused) {
                        playAudio();
                    }
                } else if (e.data.type === 'page_change') {
                    // Sync Document Title
                    if (e.data.title) {
                        document.title = e.data.title;
                    }
                    // Sync Browser Hash for dynamic refresh resilience
                    if (e.data.pageName) {
                        const newHash = '#' + e.data.pageName;
                        if (window.location.hash !== newHash) {
                            history.replaceState(null, '', newHash);
                        }
                    }
                }
            });

            return; // Terminate script in top window to prevent double execution
        }
    }

    // =========================================================================
    // 2. CHILD IFRAME WINDOW LOGIC (CONTENT ENHANCER)
    // =========================================================================
    if (IS_IFRAME) {
        // Inject a premium, super clean fade-in style for child pages
        const fadeStyle = document.createElement('style');
        fadeStyle.id = 'bgm-iframe-fade-style';
        fadeStyle.innerHTML = `
            body {
                opacity: 0 !important;
                transition: opacity 0.5s ease-in-out !important;
            }
            body.bgm-loaded {
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(fadeStyle);

        // Add class to body once DOM is interactive
        function triggerFadeIn() {
            document.body.classList.add('bgm-loaded');
        }

        window.addEventListener('DOMContentLoaded', triggerFadeIn);
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            triggerFadeIn();
        }

        // Report page change, path name and document title to Shell parent
        function reportPageToParent() {
            const path = window.location.pathname;
            const pageName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            window.parent.postMessage({
                type: 'page_change',
                pageName: pageName,
                title: document.title
            }, '*');
        }

        window.addEventListener('DOMContentLoaded', reportPageToParent);
        window.addEventListener('load', reportPageToParent);
        if (document.readyState === 'complete') {
            reportPageToParent();
        }

        // Bridge User Gesture click to BGM Shell to bypass autoplay blocks
        window.addEventListener('click', () => {
            window.parent.postMessage({ type: 'user_gesture' }, '*');
        }, { once: true });

        window.addEventListener('touchstart', () => {
            window.parent.postMessage({ type: 'user_gesture' }, '*');
        }, { once: true });

        // Event delegation for index.html "Buka Kunci" trigger
        document.addEventListener('click', (e) => {
            const unlockBtn = e.target.closest('#unlock-btn');
            if (unlockBtn) {
                const inputVal = document.getElementById('code-input')?.value;
                if (inputVal === "230503") {
                    localStorage.setItem('bgm_playing', 'true');
                    // Instruct parent BGM shell to play audio immediately
                    window.parent.postMessage({ type: 'play' }, '*');
                }
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'code-input' && e.key === 'Enter') {
                const inputVal = e.target.value;
                if (inputVal === "230503") {
                    localStorage.setItem('bgm_playing', 'true');
                    // Instruct parent BGM shell to play audio immediately
                    window.parent.postMessage({ type: 'play' }, '*');
                }
            }
        });
    }

})();
