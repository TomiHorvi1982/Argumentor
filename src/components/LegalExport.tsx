import { useState } from "react";
import { Download, FileText, Printer, ArrowLeft, ShieldCheck, CheckSquare, Calendar, Trash2 } from "lucide-react";
import { CommunicationLog } from "../types.ts";

interface LegalExportProps {
  logs: CommunicationLog[];
  onBack: () => void;
  onDeleteLog: (id: string) => void;
}

export default function LegalExport({ logs, onBack, onDeleteLog }: LegalExportProps) {
  // Client and adversary details for the report (only stored in state, never saved anywhere permanently to guarantee maximum privacy)
  const [clientName, setClientName] = useState("");
  const [adversaryName, setAdversaryName] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [lawyerName, setLawyerName] = useState("");
  const [customTitle, setCustomTitle] = useState("Přehled komunikace a analýza nátlaku");

  const [filterThreat, setFilterThreat] = useState("VŠE");
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>(logs.map(l => l.id));

  const filteredLogs = logs.filter(log => {
    if (filterThreat === "VŠE") return true;
    return log.analysis.threatLevel === filterThreat;
  });

  const handleToggleSelect = (id: string) => {
    if (selectedLogIds.includes(id)) {
      setSelectedLogIds(selectedLogIds.filter(item => item !== id));
    } else {
      setSelectedLogIds([...selectedLogIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLogIds.length === filteredLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportLogs = logs.filter(l => selectedLogIds.includes(l.id));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" id="legal-export-section">
      {/* Print-only CSS block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 font-medium self-start"
          id="back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět na přehled</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            disabled={exportLogs.length === 0}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-350 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            id="print-evidence-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Tisknout / Uložit jako PDF</span>
          </button>
        </div>
      </div>

      {/* Configuration Box */}
      <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 mb-6 no-print" id="export-configuration-panel">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Nastavení exportu pro právní účely</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" id="metadata-inputs-grid">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="client-name-input">
              Jméno klienta (Vás)
            </label>
            <input
              id="client-name-input"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Např. Mgr. Lucie Novotná"
              className="w-full text-sm bg-white border border-gray-250 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="adversary-name-input">
              Protistrana (Ex-partner/ka)
            </label>
            <input
              id="adversary-name-input"
              type="text"
              value={adversaryName}
              onChange={(e) => setAdversaryName(e.target.value)}
              placeholder="Např. Jan Novotný"
              className="w-full text-sm bg-white border border-gray-250 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="lawyer-name-input">
              Váš právní zástupce / advokát
            </label>
            <input
              id="lawyer-name-input"
              type="text"
              value={lawyerName}
              onChange={(e) => setLawyerName(e.target.value)}
              placeholder="Např. JUDr. Pavel Dvořák"
              className="w-full text-sm bg-white border border-gray-250 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="case-number-input">
              Číslo jednací / spisová značka (pokud existuje)
            </label>
            <input
              id="case-number-input"
              type="text"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="Např. 12 C 45/2026"
              className="w-full text-sm bg-white border border-gray-250 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="report-title-input">
            Název dokumentu
          </label>
          <input
            id="report-title-input"
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full text-sm bg-white border border-gray-250 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Filters and Selector */}
        <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-gray-500">Filtr nebezpečí:</span>
            <div className="flex rounded-md bg-gray-150 p-0.5">
              {["VŠE", "NÍZKÉ", "STŘEDNÍ", "VYSOKÉ"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterThreat(level)}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    filterThreat === level
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {selectedLogIds.length === filteredLogs.length ? "Zrušit výběr" : "Vybrat všechny zobrazené"}
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Vybráno {selectedLogIds.length} z {logs.length} zpráv</span>
          </div>
        </div>
      </div>

      {/* Select Logs list for Export - UI version */}
      <div className="mb-8 no-print" id="logs-selection-list">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Výběr zpráv do tisku:</h4>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-gray-500 text-sm">
            Žádné zprávy neodpovídají vybranému filtru nebezpečí.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {filteredLogs.map((log) => {
              const isSelected = selectedLogIds.includes(log.id);
              const isHigh = log.analysis.threatLevel === "VYSOKÉ";
              const isMed = log.analysis.threatLevel === "STŘEDNÍ";

              return (
                <div
                  key={log.id}
                  onClick={() => handleToggleSelect(log.id)}
                  className={`p-3 border rounded-lg cursor-pointer flex items-start space-x-3 transition-colors ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by div click
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(log.timestamp).toLocaleString("cs-CZ")}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isHigh
                          ? "bg-red-100 text-red-800"
                          : isMed
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        Nebezpečí: {log.analysis.threatLevel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-2 italic font-serif">
                      "{log.originalMessage}"
                    </p>
                    {log.userNotes && (
                      <p className="text-xs text-indigo-700 font-medium mt-1">
                        Poznámka: {log.userNotes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Opravdu chcete tuto zprávu trvale odstranit z archivu?")) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 transition-colors shrink-0 self-center"
                    title="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* THE ACTUAL PRINT AREA (Highly polished for lawyers and judges) */}
      <div className="border border-gray-200 rounded-xl p-8 bg-white shadow-2xs" id="print-area">
        {/* Document Header */}
        <div className="border-b-2 border-gray-900 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{customTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Generováno dne {new Date().toLocaleDateString("cs-CZ")} v {new Date().toLocaleTimeString("cs-CZ")}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2.5 py-1 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dokladová komunikace</span>
              </div>
            </div>
          </div>

          {/* Legal Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 text-sm">
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase">Klient / Oznamovatel:</span>
              <span className="font-semibold text-gray-900">{clientName || "________________________"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase">Protistrana / Odesílatel:</span>
              <span className="font-semibold text-gray-900">{adversaryName || "________________________"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase">Právní zástupce klienta:</span>
              <span className="font-semibold text-gray-900">{lawyerName || "________________________"}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase">Spisová značka / Číslo jednací:</span>
              <span className="font-semibold text-gray-900">{caseNumber || "Nepřiděleno"}</span>
            </div>
          </div>
        </div>

        {/* Methodology explanation (crucial for showing objective communication strategy to a judge) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-xs text-gray-700 leading-relaxed">
          <h4 className="font-bold text-gray-900 mb-1 text-sm uppercase">Metodologická poznámka: Objektivizace komunikace (Metoda Gray Rock)</h4>
          <p className="mb-2">
            Tento přehled obsahuje texty původních zpráv odesílaných protistranou a jejich odbornou analýzu. Za účelem eliminace psychického nátlaku,
            deeskalace napětí a ochraně dětí před rodičovskými konflikty se příjemce drží asertivní metody <strong>Gray Rock (šedá skála)</strong>.
          </p>
          <p>
            <strong>Cíl metody:</strong> Komunikace ze strany příjemce je udržována striktně věcná, stručná, bez emocí a bez poskytování subjektivních informací. 
            Tento přístup prokazatelně minimalizuje prostor pro nátlak, manipulaci a chrání zájmy nezletilých dětí tím, že zamezuje protistraně vytvářet záminky k eskalaci sporů.
          </p>
        </div>

        {/* Chronological Table Index */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">I. Chronologický přehled incidentů</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                <th className="py-2 px-3 w-10">Č.</th>
                <th className="py-2 px-3 w-32">Datum a čas</th>
                <th className="py-2 px-3 w-24">Úroveň rizik</th>
                <th className="py-2 px-3">Identifikované formy manipulace / nátlaku</th>
                <th className="py-2 px-3 text-right">Záznam poznámky</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exportLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400 italic">
                    Nebyly vybrány žádné incidenty do tištěné verze.
                  </td>
                </tr>
              ) : (
                exportLogs.map((log, index) => {
                  const isHigh = log.analysis.threatLevel === "VYSOKÉ";
                  const isMed = log.analysis.threatLevel === "STŘEDNÍ";
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{index + 1}.</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("cs-CZ")}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold uppercase ${
                          isHigh ? "text-red-600" : isMed ? "text-amber-600" : "text-green-600"
                        }`}>
                          {log.analysis.threatLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800">
                        {log.analysis.manipulationTechniques.join(", ") || "Standardní komunikace"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-600">
                        {log.userNotes ? "✅ Ano" : "❌ Ne"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed Logs Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">II. Detailní rozbor jednotlivých incidentů</h3>
          
          {exportLogs.map((log, index) => {
            const isHigh = log.analysis.threatLevel === "VYSOKÉ";
            const isMed = log.analysis.threatLevel === "STŘEDNÍ";

            return (
              <div key={log.id} className="border border-gray-200 rounded-lg p-5 mb-6 bg-white page-break-inside-avoid">
                {/* Header of Incident */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-150 pb-3 mb-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">Incident #{index + 1}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-semibold text-gray-600">
                      Přijato: {new Date(log.timestamp).toLocaleString("cs-CZ")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Míra nátlaku:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase ${
                      isHigh
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : isMed
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      {log.analysis.threatLevel}
                    </span>
                  </div>
                </div>

                {/* Original Message */}
                <div className="mb-4">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Doslovný text příchozí zprávy:</span>
                  <div className="bg-gray-50 border-l-4 border-gray-400 px-4 py-3 font-serif italic text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
                    "{log.originalMessage}"
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Psychologická analýza / Manipulace:</span>
                    <div className="space-y-1.5">
                      <p className="text-gray-800">
                        <strong>Techniky: </strong> 
                        {log.analysis.manipulationTechniques.length > 0 
                          ? log.analysis.manipulationTechniques.join(", ") 
                          : "Žádné specifické zneužívající techniky nebyly detekovány."
                        }
                      </p>
                      <p className="text-gray-800">
                        <strong>Emoční náboj: </strong>
                        {log.analysis.detectedEmotions.join(", ") || "Neutrální"}
                      </p>
                      {log.analysis.threatDetails && (
                        <p className="text-red-700 font-medium">
                          <strong>Detaily ohrožení: </strong> {log.analysis.threatDetails}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Odborné doporučení krizového specialisty:</span>
                    <p className="text-gray-700 leading-relaxed bg-indigo-50/20 border border-indigo-100 p-2 rounded">
                      {log.analysis.advice}
                    </p>
                  </div>
                </div>

                {/* Gray Rock Response & User Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Generovaná odpověď (Gray Rock):</span>
                    <div className="bg-gray-50 border border-gray-150 p-2.5 rounded italic font-mono text-gray-800">
                      {log.analysis.grayRockResponse || "[Doporučeno neodpovídat]"}
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Fakta & Kontext klienta k incidentu:</span>
                    <div className="bg-amber-50/30 border border-amber-100 p-2.5 rounded text-gray-800">
                      {log.userNotes ? (
                        <p className="whitespace-pre-wrap">{log.userNotes}</p>
                      ) : (
                        <p className="text-gray-400 italic">Klient k tomuto incidentu nepřipojil žádné doplňující poznámky.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Signature */}
        <div className="mt-12 pt-8 border-t-2 border-gray-900 flex justify-between text-xs text-gray-500 page-break-inside-avoid">
          <div>
            <p><strong>Vyhotovil/a:</strong> {clientName || "_________________________"}</p>
            <p className="mt-1">Dne: .......................................</p>
          </div>
          <div className="text-right">
            <p><strong>Podpis:</strong> .....................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
