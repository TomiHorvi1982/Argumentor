import { ShieldAlert, Phone, ExternalLink, AlertTriangle } from "lucide-react";

export default function SafetyWarning() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm" id="safety-warning-box">
      <div className="flex items-start space-x-3">
        <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" id="safety-warning-icon" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 leading-tight mb-2" id="safety-warning-title">
            DŮLEŽITÉ UPOZORNĚNÍ & KRIZOVÁ POMOC
          </h3>
          <p className="text-sm text-red-700 leading-relaxed mb-4" id="safety-warning-desc">
            Tato aplikace <strong>nenahrazuje právní, psychologické ani policejní poradenství</strong>. Pokud čelíte
            bezprostředním výhrůžkám fyzickým násilím, sebepoškozováním, ničením majetku nebo únosem dětí,
            <strong> okamžitě kontaktujte Policii ČR (158)</strong>. Neodpovídejte na zprávy, které jsou nebezpečné.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="emergency-contacts-grid">
            <div className="bg-white border border-red-100 p-3 rounded-lg flex items-center justify-between" id="emergency-item-1">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tísňové volání (Policie ČR)</p>
                  <p className="text-sm font-bold text-gray-900">Linka 158</p>
                </div>
              </div>
              <a href="tel:158" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white border border-red-100 p-3 rounded-lg flex items-center justify-between" id="emergency-item-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Bílý kruh bezpečí (Domácí násilí - nonstop, zdarma)</p>
                  <p className="text-sm font-bold text-gray-900">Linka 116 006</p>
                </div>
              </div>
              <a href="tel:116006" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white border border-red-100 p-3 rounded-lg flex items-center justify-between" id="emergency-item-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Rosa (Krizová pomoc pro oběti násilí)</p>
                  <p className="text-sm font-bold text-gray-900">+420 602 244 108</p>
                </div>
              </div>
              <a href="tel:+420602244108" className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-md transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-white border border-red-100 p-3 rounded-lg flex items-center justify-between" id="emergency-item-4">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Asociace intervenčních center ČR</p>
                  <p className="text-sm font-bold text-gray-900">Pomoc v regionech</p>
                </div>
              </div>
              <a href="https://www.intervencnicentra.cz" target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-md transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-xs text-red-800" id="safety-legal-advice-warning">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Každá zpráva obsahující výhružky násilím by měla být uložena a předána policii a advokátovi jako klíčový důkaz.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
