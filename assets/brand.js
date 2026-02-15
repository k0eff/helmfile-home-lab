(function () {
    try {
        function injectBrand() {
            var d = document;

            // Skip if already injected
            if (d.getElementById('koeff-brand')) return;

            var style = d.createElement("style");
            style.id = "koeff-brand-styles";
            style.textContent = [
                /* Our brand styles */
                "#koeff-brand { display: flex !important; align-items: center !important; gap: 12px !important; padding: 16px 24px !important; border-bottom: 1px solid #e8e8e8 !important; background: linear-gradient(90deg,#f7fbff 0%,#ffffff 35%,#f9f7ff 100%) !important; font-family: Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif !important; position: relative !important; z-index: 9999 !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-logo-container { width: 44px !important; height: 44px !important; display: grid !important; place-items: center !important; border-radius: 12px !important; background: #0b1f3a !important; box-shadow: 0 6px 16px rgba(11,31,58,0.18) !important; visibility: visible !important; opacity: 1 !important; overflow: hidden !important; }",
                "#koeff-brand .koeff-logo-container img { width: 100% !important; height: 100% !important; object-fit: contain !important; display: block !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-text { display: flex !important; flex-direction: column !important; line-height: 1 !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand .koeff-domain { font-size: 12px !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #6b7a90 !important; margin-bottom: 6px !important; }",
                "#koeff-brand .koeff-title { font-size: 20px !important; font-weight: 700 !important; color: #0b1f3a !important; }",
                "#koeff-brand .koeff-title span { color: #2a5bd7 !important; }",

                /* Global hiding rules for QuMagie logo fragments - specifically targeting classes provided by user */
                /* The :not(#koeff-brand *) part ensures we don't hide our own logo if it uses similar classes */
                ".Icon__StyledIconComponent-loi9hp-0:not(#koeff-brand *),",
                ".dAbISF:not(#koeff-brand *),",
                "img[alt*='QuMagie' i]:not(#koeff-brand *),",
                "svg[class*='Icon__StyledIconComponent']:not(#koeff-brand *) {",
                "    display: none !important;",
                "    visibility: hidden !important;",
                "    width: 0 !important;",
                "    height: 0 !important;",
                "    padding: 0 !important;",
                "    margin: 0 !important;",
                "}"
            ].join("\n");
            d.head.appendChild(style);

            var brand = d.createElement("div");
            brand.id = "koeff-brand";
            brand.innerHTML = '<div class="koeff-logo-container"><img src="https://raw.githubusercontent.com/k0eff/helmfile-home-lab/main/assets/share.koeff.com-logo-blurred.webp" /></div><div class="koeff-text"><div class="koeff-domain">share.koeff.com</div><div class="koeff-title">Koeff <span>family</span> share</div></div>';

            if (d.body) {
                // Ensure header transition is smooth or hidden if it contains the logo
                d.body.prepend(brand);
            }
        }

        // Initialize early
        injectBrand();

        // Use MutationObserver to re-inject if needed (app might clear body or head)
        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                if (!document.getElementById('koeff-brand')) {
                    injectBrand();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }

        // Final safety
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectBrand);
        }
        window.addEventListener('load', injectBrand);

    } catch (e) { }
})();
