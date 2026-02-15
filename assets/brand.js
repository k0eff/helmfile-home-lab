(function () {
    try {
        function injectBrand() {
            var d = document;

            // Skip if already injected
            if (d.getElementById('koeff-brand')) return;

            var style = d.createElement("style");
            // Use !important on everything to win against the app's styles
            style.textContent = [
                "#koeff-brand { display: flex !important; align-items: center !important; gap: 12px !important; padding: 16px 24px !important; border-bottom: 1px solid #e8e8e8 !important; background: linear-gradient(90deg,#f7fbff 0%,#ffffff 35%,#f9f7ff 100%) !important; font-family: Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif !important; position: relative !important; z-index: 9999 !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-logo-container { width: 44px !important; height: 44px !important; display: grid !important; place-items: center !important; border-radius: 12px !important; background: #0b1f3a !important; box-shadow: 0 6px 16px rgba(11,31,58,0.18) !important; visibility: visible !important; opacity: 1 !important; overflow: hidden !important; }",
                "#koeff-brand .koeff-logo-container img { width: 100% !important; height: 100% !important; object-fit: contain !important; display: block !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-text { display: flex !important; flex-direction: column !important; line-height: 1 !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-domain { font-size: 12px !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #6b7a90 !important; margin-bottom: 6px !important; }",
                "#koeff-brand .koeff-title { font-size: 20px !important; font-weight: 700 !important; color: #0b1f3a !important; }",
                "#koeff-brand .koeff-title span { color: #2a5bd7 !important; }"
            ].join("\n");
            d.head.appendChild(style);

            var brand = d.createElement("div");
            brand.id = "koeff-brand";
            brand.innerHTML = '<div class="koeff-logo-container"><img src="https://raw.githubusercontent.com/k0eff/helmfile-home-lab/main/assets/share.koeff.com-logo-blurred.webp" /></div><div class="koeff-text"><div class="koeff-domain">share.koeff.com</div><div class="koeff-title">Koeff <span>family</span> share</div></div>';

            if (d.body) {
                d.body.prepend(brand);

                // Surgical hiding of the QuMagie logo fragments provided by user
                // Targeted exactly at the QuMagie icon component classes
                var targetClasses = [
                    ".Icon__StyledIconComponent-loi9hp-0",
                    ".dAbISF",
                    "img[alt*='QuMagie' i]",
                    "svg[class*='Icon__StyledIconComponent']"
                ];

                targetClasses.forEach(function (selector) {
                    d.querySelectorAll(selector).forEach(function (el) {
                        // CRITICAL: Ensure we never hide anything inside our own container
                        if (el.id === 'koeff-brand' || el.closest('#koeff-brand')) {
                            // If it's our own, make sure it's visible (counter-act any broad rules)
                            el.style.setProperty("display", selector.includes("img") ? "block" : "flex", "important");
                            return;
                        }
                        // Hide QuMagie elements
                        el.style.setProperty("display", "none", "important");
                    });
                });
            }
        }

        // Initialize
        injectBrand();

        // Use MutationObserver to keep QuMagie logo hidden if the React app re-renders it
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                injectBrand();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }

        // Safety triggers
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectBrand);
        }
        window.addEventListener('load', injectBrand);

    } catch (e) { }
})();
