(function () {
    try {
        function injectBrand() {
            var d = document;

            // Skip if already injected
            if (d.getElementById('koeff-brand')) return;

            // Target the header container
            var header = d.querySelector("[class*='Header-sc-']");
            if (!header) return;

            var style = d.createElement("style");
            style.id = "koeff-brand-styles";
            style.textContent = [
                "#koeff-brand { display: flex !important; align-items: center !important; height: 40px !important; margin: 0 13px !important; padding: 0 !important; border-bottom: none !important; background: transparent !important; z-index: 9999 !important; visibility: visible !important; opacity: 1 !important; }",
                "#koeff-brand img { height: 36px !important; width: auto !important; object-fit: contain !important; display: block !important; border-radius: 8px !important; box-shadow: 0 4px 12px rgba(11,31,58,0.15) !important; visibility: visible !important; opacity: 1 !important; }",

                /* SURGICAL HIDING: Target logo icons only when they are direct children of the Header */
                "[class*='Header-sc-'] > .Icon__StyledIconComponent-loi9hp-0:not(#koeff-brand *):not(button *),",
                "[class*='Header-sc-'] > .dAbISF:not(#koeff-brand *):not(button *),",
                "img[alt*='QuMagie' i]:not(#koeff-brand *):not(button *),",
                "svg[aria-label*='QuMagie' i]:not(#koeff-brand *):not(button *) {",
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
            brand.innerHTML = '<img src="https://raw.githubusercontent.com/k0eff/helmfile-home-lab/main/assets/share.koeff.com-logo-blurred.webp" />';

            header.prepend(brand);
        }

        injectBrand();

        if (typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function () {
                var header = document.querySelector("[class*='Header-sc-']");
                if (header && !document.getElementById('koeff-brand')) {
                    injectBrand();
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }
    } catch (e) { }
})();
