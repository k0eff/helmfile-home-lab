(function () {
    try {
        function injectBrand() {
            var d = document;

            // Skip if already injected
            if (d.getElementById('koeff-brand')) return;

            var style = d.createElement("style");
            style.textContent = "#koeff-brand{display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid #e8e8e8;background:linear-gradient(90deg,#f7fbff 0%,#ffffff 35%,#f9f7ff 100%);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;}#koeff-brand .koeff-logo{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#0b1f3a;box-shadow:0 6px 16px rgba(11,31,58,.18);}#koeff-brand .koeff-logo svg{width:28px;height:28px;}#koeff-brand .koeff-text{display:flex;flex-direction:column;line-height:1;}#koeff-brand .koeff-domain{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7a90;margin-bottom:6px;}#koeff-brand .koeff-title{font-size:20px;font-weight:700;color:#0b1f3a;}#koeff-brand .koeff-title span{color:#2a5bd7;}";
            d.head.appendChild(style);

            var brand = d.createElement("div");
            brand.id = "koeff-brand";
            brand.innerHTML = "<div class=\"koeff-logo\"><img src=\"https://raw.githubusercontent.com/k0eff/helmfile-home-lab/main/assets/share.koeff.com-logo-blurred.webp\" style=\"width:100%;height:100%;object-fit:contain;\" /></div><div class=\"koeff-text\"><div class=\"koeff-domain\">share.koeff.com</div><div class=\"koeff-title\">Koeff <span>family</span> share</div></div>";

            if (d.body) {
                d.body.prepend(brand);

                // Hide existing logos
                var selectors = ["img[alt*=\"QuMagie\" i]", "svg[aria-label*=\"QuMagie\" i]", "[class*=\"logo\" i]", "[class*=\"branding\" i]", "[id*=\"logo\" i]"];
                selectors.forEach(function (s) {
                    d.querySelectorAll(s).forEach(function (el) {
                        el.style.display = "none";
                    });
                });
            }
        }

        // Try immediately
        injectBrand();

        // Also try on DOMContentLoaded if body wasn't ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectBrand);
        }
    } catch (e) { }
})();
