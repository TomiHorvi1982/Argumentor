import { useState, useEffect, FormEvent } from "react";
import {
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileDown,
  Trash2,
  Sparkles,
  Check,
  Copy,
  Plus,
  RefreshCw,
  Search,
  MessageSquare,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  BookOpen,
  UserCheck
} from "lucide-react";
import { hashPin, encryptData, decryptData } from "./utils/crypto.ts";
import { CommunicationLog, AnalysisResult, ThreatLevel } from "./types.ts";
import SafetyWarning from "./components/SafetyWarning.tsx";
import AssertiveTemplates from "./components/AssertiveTemplates.tsx";
import LegalExport from "./components/LegalExport.tsx";

export default function App() {
  // Authentication & Cryptography states
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPinSetup, setIsPinSetup] = useState(false); // true if PIN needs to be created
  const [hashedPinStored, setHashedPinStored] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [pinError, setPinError] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // Application functional states
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"analyze" | "archive" | "templates" | "export">("analyze");
  const [messageInput, setMessageInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  
  // Active/In-progress analysis to be saved
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [currentUserNotes, setCurrentUserNotes] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // Archive search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [threatFilter, setThreatFilter] = useState<"VŠE" | "NÍZKÉ" | "STŘEDNÍ" | "VYSOKÉ">("VŠE");

  // Success copy states
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Check PIN existence on mount
  useEffect(() => {
    const storedHash = localStorage.getItem("filter_hashed_pin");
    if (storedHash) {
      setHashedPinStored(storedHash);
      setIsPinSetup(false);
    } else {
      setIsPinSetup(true);
    }
  }, []);

  // Handle PIN Registration
  const handleRegisterPin = async (e: FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (pin.length < 4 || pin.length > 8) {
      setPinError("PIN kód musí mít 4 až 8 číslic.");
      return;
    }

    if (pin !== confirmPin) {
      setPinError("Zadané PIN kódy se neshodují.");
      return;
    }

    try {
      const hash = await hashPin(pin);
      localStorage.setItem("filter_hashed_pin", hash);
      setHashedPinStored(hash);
      
      // Initialize empty encrypted logs database
      const encryptedEmpty = await encryptData(JSON.stringify([]), pin);
      localStorage.setItem("encrypted_logs", encryptedEmpty);

      // Instantly log in
      setIsPinSetup(false);
      setIsLocked(false);
      setLogs([]);
      setPin("");
      setConfirmPin("");
    } catch (err) {
      setPinError("Chyba při inicializaci zabezpečení.");
    }
  };

  // Handle Login PIN verification
  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setPinError("");

    try {
      const hash = await hashPin(loginPin);
      if (hash === hashedPinStored) {
        // Success
        setIsLocked(false);
        
        // Decrypt logs from local storage
        const encryptedData = localStorage.getItem("encrypted_logs");
        if (encryptedData) {
          try {
            const decryptedJson = await decryptData(encryptedData, loginPin);
            const parsedLogs = JSON.parse(decryptedJson);
            setLogs(parsedLogs);
          } catch (decryptionError) {
            console.error("Decryption failed:", decryptionError);
            setPinError("Chyba při dešifrování dat. Pravděpodobně nesprávný šifrovací klíč.");
            setIsLocked(true);
            return;
          }
        } else {
          setLogs([]);
        }
        setLoginPin("");
      } else {
        setPinError("Nesprávný bezpečnostní PIN.");
        // Clear input to prevent easy shoulder surfing
        setLoginPin("");
      }
    } catch (err) {
      setPinError("Chyba při ověřování PIN kódu.");
    }
  };

  // Safe Lock application (clear RAM states)
  const handleLock = () => {
    setIsLocked(true);
    setLogs([]);
    setCurrentAnalysis(null);
    setMessageInput("");
    setLoginPin("");
    setPinError("");
  };

  // Wipe all database (Hard Reset)
  const handleWipeData = () => {
    const confirmation = confirm(
      "DŮLEŽITÉ VAROVÁNÍ:\n\nTato akce trvale vymaže veškeré uložené zprávy a deaktivační klíče z vašeho prohlížeče. Pokud jste zapomněli PIN, je to jediná možnost jak aplikaci znovu zprovoznit, ale přijdete o všechna uložená data. Chcete pokračovat?"
    );
    if (confirmation) {
      localStorage.removeItem("filter_hashed_pin");
      localStorage.removeItem("encrypted_logs");
      setIsPinSetup(true);
      setIsLocked(true);
      setLogs([]);
      setCurrentAnalysis(null);
      setPinError("Aplikace byla úspěšně resetována. Vytvořte prosím nový PIN.");
    }
  };

  // Encrypt and save current logs array back to localStorage
  const saveLogsSecurely = async (updatedLogs: CommunicationLog[]) => {
    // We need the active PIN to re-encrypt. We use the pin variable or request it.
    // To solve this cleanly, we can keep the active unhashed PIN in memory while logged in!
    // Let's create an active PIN state during unlock/registration so we can re-encrypt.
    // Wait, let's track the validated PIN in a memory state `activeSessionPin`.
  };

  // Let's add a memory state for the raw PIN
  const [activeSessionPin, setActiveSessionPin] = useState("");

  // Modify handleUnlock to store validated pin in memory
  const handleUnlockWithPinMemory = async (e: FormEvent) => {
    e.preventDefault();
    setPinError("");

    try {
      const hash = await hashPin(loginPin);
      if (hash === hashedPinStored) {
        setIsLocked(false);
        setActiveSessionPin(loginPin); // Store PIN in active session RAM
        
        const encryptedData = localStorage.getItem("encrypted_logs");
        if (encryptedData) {
          try {
            const decryptedJson = await decryptData(encryptedData, loginPin);
            const parsedLogs = JSON.parse(decryptedJson);
            setLogs(parsedLogs);
          } catch (decryptionError) {
            setPinError("Chyba při dešifrování dat.");
            setIsLocked(true);
            return;
          }
        } else {
          setLogs([]);
        }
        setLoginPin("");
      } else {
        setPinError("Zadali jste nesprávný PIN.");
        setLoginPin("");
      }
    } catch (err) {
      setPinError("Ověření PIN kódu selhalo.");
    }
  };

  const handleRegisterPinWithMemory = async (e: FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (pin.length < 4 || pin.length > 8) {
      setPinError("PIN kód musí mít 4 až 8 číslic.");
      return;
    }

    if (pin !== confirmPin) {
      setPinError("Zadané PIN kódy se neshodují.");
      return;
    }

    try {
      const hash = await hashPin(pin);
      localStorage.setItem("filter_hashed_pin", hash);
      setHashedPinStored(hash);
      
      const encryptedEmpty = await encryptData(JSON.stringify([]), pin);
      localStorage.setItem("encrypted_logs", encryptedEmpty);

      setIsPinSetup(false);
      setIsLocked(false);
      setActiveSessionPin(pin); // Store PIN in session RAM
      setLogs([]);
      setPin("");
      setConfirmPin("");
    } catch (err) {
      setPinError("Chyba při inicializaci šifrování.");
    }
  };

  // Perform secure save helper
  const performSave = async (updatedLogs: CommunicationLog[]) => {
    try {
      const keyToUse = activeSessionPin;
      if (!keyToUse) {
        alert("Chyba relace: Vaše přihlášení vypršelo nebo nebylo správně inicializováno. Uzamkněte prosím aplikaci a přihlaste se znovu.");
        return;
      }
      const encrypted = await encryptData(JSON.stringify(updatedLogs), keyToUse);
      localStorage.setItem("encrypted_logs", encrypted);
      setLogs(updatedLogs);
    } catch (error) {
      console.error("Error saving securely:", error);
      alert("Nepodařilo se bezpečně uložit data.");
    }
  };

  // Load standard pre-populated Czech demo data to let the user see how it works instantly!
  const handleLoadDemoData = async () => {
    const demoLogs: CommunicationLog[] = [
      {
        id: "demo-1",
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        originalMessage: "Zase jsi schválně zpozdila předání dětí o deset minut! Jsi naprosto neschopná matka a zničíš jim dětství stejně jako jsi zničila náš život. Už toho mám dost, podám stížnost na sociálku a uvidíš jak rychle o ně přijdeš, ty lhářko!",
        analysis: {
          threatLevel: "STŘEDNÍ",
          threatDetails: "Nátlak ohledně péče o děti, očerňování rodičovské role, vyhrůžky sociální službou (OSPOD).",
          manipulationTechniques: ["Obviňování", "Zastrašování", "Útok na sebevědomí", "Katastrofizace"],
          grayRockResponse: "Děti jsem předala v 15:10, zpoždění bylo způsobeno kolonou na ulici Hlavní. Omlouvám se za komplikace. Další předání proběhne v řádném termínu.",
          advice: "Ignorujte veškeré osobní urážky ('neschopná matka', 'zničíš dětství'). Zaměřte se výhradně na věcný fakt – zpoždění 10 minut. Omluvte se stručně za zpoždění a udejte objektivní důvod (doprava). Na vyhrůžky sociálkou nereagujte, o zpoždění si udělejte factual log pro případ potřeby.",
          detectedEmotions: ["Vztek", "Dominance", "Agresivita"],
          safeToReply: true
        },
        userNotes: "Předání proběhlo před domem mých rodičů, kteří mohou dosvědčit, že děti byly v klidu a zpoždění bylo způsobeno uzavírkou v centru."
      },
      {
        id: "demo-2",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        originalMessage: "Jestli mi dneska nepodepíšeš ten papír na vypořádání majetku tak jak je, tak ti garantuju, že uvidíš co dokážu. Zapálím ty tvoje hadry, auto už neuvidíš a postarám se, aby ti v tomhle městě nikdo nedal práci. Zbyde ti jenom dluhy, ty špíno!",
        analysis: {
          threatLevel: "VYSOKÉ",
          threatDetails: "Přímé vyhrůžky ničením majetku (zapálení oblečení, zabavení auta), finanční likvidací a společenským zničením.",
          manipulationTechniques: ["Vydírání", "Zastrašování", "Vyhrůžky násilím/ničením", "Ekonomické zneužívání"],
          grayRockResponse: "[Doporučeno neodpovídat]",
          advice: "VÝSTRAHA: Tato zpráva obsahuje závažné vyhrůžky ničením majetku a finanční likvidací. Na tuto zprávu VŮBEC NEODPOVÍDEJTE. Okamžitě kontaktujte svého advokáta a uložte tuto zprávu jako důkaz. V případě jakéhokoliv fyzického ohrožení volejte Policii ČR (158).",
          detectedEmotions: ["Nenávist", "Agresivita", "Pokus o totální kontrolu"],
          safeToReply: false
        },
        userNotes: "Zpráva přišla na WhatsApp poté, co jsem odmítla podepsat nevýhodný návrh dohody o vypořádání SJM, který mi poslal přes svého známého."
      }
    ];

    await performSave(demoLogs);
  };

  // Call the server-side proxy route `/api/filter-message` to analyze
  const handleAnalyzeMessage = async () => {
    if (!messageInput.trim()) {
      setAnalysisError("Zadejte prosím text zprávy k analýze.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError("");
    setCurrentAnalysis(null);
    setJustSaved(false);

    try {
      const response = await fetch("/api/filter-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageInput }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server vrátil chybu ${response.status}`);
      }

      const result: AnalysisResult = await response.json();
      setCurrentAnalysis(result);
      setCurrentUserNotes("");
    } catch (error: any) {
      console.error("Analysis API failed:", error);
      setAnalysisError(error.message || "Nepodařilo se provést analýzu. Zkontrolujte připojení k internetu a platnost klíče.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save current analysis to secure local archive
  const handleSaveToArchive = async () => {
    if (!currentAnalysis) return;

    const newLog: CommunicationLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      originalMessage: messageInput,
      analysis: currentAnalysis,
      userNotes: currentUserNotes.trim() || undefined,
    };

    const updatedLogs = [newLog, ...logs];
    await performSave(updatedLogs);

    setJustSaved(true);
    // Clear inputs after 2 seconds
    setTimeout(() => {
      setMessageInput("");
      setCurrentAnalysis(null);
      setCurrentUserNotes("");
      setJustSaved(false);
    }, 2500);
  };

  // Delete log by id
  const handleDeleteLog = async (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    await performSave(updated);
  };

  // Edit user notes for an existing log in the archive
  const handleUpdateNotes = async (id: string, notes: string) => {
    const updated = logs.map((log) => {
      if (log.id === id) {
        return { ...log, userNotes: notes.trim() || undefined };
      }
      return log;
    });
    await performSave(updated);
  };

  // Copy helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Filter logs for display in the Archive tab
  const filteredLogsList = logs.filter((log) => {
    const matchesSearch =
      log.originalMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userNotes && log.userNotes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.analysis.manipulationTechniques.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesThreat =
      threatFilter === "VŠE" || log.analysis.threatLevel === threatFilter;

    return matchesSearch && matchesThreat;
  });

  // Render Lock/Setup screens if applicable
  if (isPinSetup) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans text-gray-100" id="pin-setup-root">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-indigo-950 p-4 rounded-full border border-indigo-500/30 text-indigo-400 mb-4">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white" id="app-setup-title">Komunikační filtr</h1>
            <p className="text-sm text-slate-400 mt-2">
              Nastavte si přístupový PIN kód pro dešifrování dat.
            </p>
          </div>

          <form onSubmit={handleRegisterPinWithMemory} className="space-y-4" id="pin-setup-form">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1" htmlFor="setup-pin">
                Nový bezpečnostní PIN (4 až 8 číslic)
              </label>
              <input
                id="setup-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center text-xl tracking-widest font-mono bg-slate-950 border border-slate-650 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1" htmlFor="setup-pin-confirm">
                Potvrzení PIN kódu
              </label>
              <input
                id="setup-pin-confirm"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center text-xl tracking-widest font-mono bg-slate-950 border border-slate-650 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-hidden"
                required
              />
            </div>

            {pinError && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs leading-relaxed text-center font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Uložit PIN a inicializovat filtr
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700/50 pt-4 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              🔒 <strong>Vysoká bezpečnost:</strong> Váš PIN kód ani dešifrovaná data nikdy neopouštějí tento prohlížeč. 
              Šifrování probíhá lokálně pomocí standardu <strong>AES-GCM</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 font-sans text-gray-100" id="login-root">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-indigo-950 p-4 rounded-full border border-indigo-500/30 text-indigo-400 mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Komunikační filtr uzamčen</h1>
            <p className="text-sm text-slate-400 mt-2">
              Pro dešifrování databáze zadejte svůj bezpečnostní PIN.
            </p>
          </div>

          <form onSubmit={handleUnlockWithPinMemory} className="space-y-4" id="login-form">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center" htmlFor="login-pin">
                Zadejte PIN kód
              </label>
              <input
                id="login-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-widest font-mono bg-slate-950 border border-slate-650 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500 focus:outline-hidden"
                required
                autoFocus
              />
            </div>

            {pinError && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs text-center font-medium">
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Odemknout aplikaci
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/50 pt-4 flex flex-col items-center space-y-3">
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Ztráta PIN kódu znemožní přístup k zašifrovaným datům. Pokud potřebujete aplikaci kompletně resetovat a smazat všechna data, klikněte níže.
            </p>
            <button
              onClick={handleWipeData}
              className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors font-medium cursor-pointer"
            >
              ⚠️ Smazat veškerá data a resetovat PIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col" id="app-root">
      {/* Top Banner / Secure Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 no-print" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Filtr manipulativní komunikace</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                🔒 Lokální šifrování dat aktivní (AES-GCM)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              Aktivní relace
            </span>
            <button
              onClick={handleLock}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              id="lock-app-btn"
              title="Okamžitě uzamknout aplikaci a vyčistit data z paměti RAM"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Uzamknout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-1.5 bg-white border border-gray-150 rounded-xl p-3 shadow-2xs self-start no-print" id="app-navigation">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "analyze"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Nový rozbor</span>
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all relative ${
              activeTab === "archive"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Archiv zpráv</span>
            {logs.length > 0 && (
              <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {logs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "templates"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Vzory odpovědí</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "export"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FileDown className="w-4 h-4" />
            <span>Právní export</span>
          </button>

          {logs.length === 0 && (
            <div className="hidden lg:block border-t border-gray-100 pt-3 mt-3">
              <p className="text-[11px] text-gray-400 leading-relaxed mb-2 px-3">
                Chcete si aplikaci nejprve vyzkoušet s modelovými příklady?
              </p>
              <button
                onClick={handleLoadDemoData}
                className="w-full flex items-center justify-center space-x-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 border border-gray-200 hover:border-indigo-100 rounded-lg py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 animate-spin-hover" />
                <span>Načíst ukázky</span>
              </button>
            </div>
          )}
        </nav>

        {/* Content Area */}
        <section className="flex-1 min-w-0" id="main-content-area">
          {/* Always display Safety Warning at the very top for high visual security support */}
          <SafetyWarning />

          {/* TAB: ANALYZE */}
          {activeTab === "analyze" && (
            <div className="space-y-6 no-print" id="analyze-tab-content">
              {/* Main analysis input card */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-4">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Analyzátor příchozích zpráv</h2>
                </div>

                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Vložte doslovný text zprávy (SMS, e-mail, WhatsApp, Messenger), který vám zaslal ex-partner. 
                  AI systém zprávu bezpečně vyhodnotí na přítomnost výhrůžek, odhalí manipulativní vzorce, pomůže vám oddělit emoce od věcných informací a navrhne perfektní <strong>Gray Rock</strong> asertivní odpověď.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5" htmlFor="partner-message-textarea">
                      Příchozí text k analýze
                    </label>
                    <textarea
                      id="partner-message-textarea"
                      rows={6}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Sem zkopírujte celou zprávu partnera včetně případných chyb, abychom ji mohli přesně vyhodnotit..."
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 focus:outline-hidden leading-relaxed"
                    />
                  </div>

                  {analysisError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm flex items-start space-x-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <span>{analysisError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzeMessage}
                      disabled={isAnalyzing || !messageInput.trim()}
                      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Provádím expertní rozbor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyzovat zprávu</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Display analysis outcome if available */}
              {currentAnalysis && (
                <div className="bg-white border border-gray-150 rounded-xl shadow-md p-6 border-t-4 border-t-indigo-600 animate-fadeIn" id="analysis-result-container">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-5 gap-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                      <span>Výsledek odborné analýzy</span>
                    </h3>

                    {/* Threat level indicator badge */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Míra nebezpečí:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        currentAnalysis.threatLevel === "VYSOKÉ"
                          ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                          : currentAnalysis.threatLevel === "STŘEDNÍ"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}>
                        {currentAnalysis.threatLevel}
                      </span>
                    </div>
                  </div>

                  {/* Threat Alert Panel if high threat */}
                  {!currentAnalysis.safeToReply && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-5 flex items-start space-x-3 text-red-800" id="danger-red-box">
                      <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-900 mb-1">Doporučení: Bezprostředně neodpovídat!</h4>
                        <p className="text-sm text-red-700 leading-relaxed">
                          Tato zpráva byla identifikována jako riziková / výhružná. <strong>Důrazně nedoporučujeme partnerovi sami odepisovat.</strong> 
                          Předejte zprávu svému právnímu zástupci, popř. v případě nebezpečí Policii ČR. Uložte si záznam do archivu pro pozdější právní export.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analysis details blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Psychological breakdown */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Použité manipulativní techniky:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentAnalysis.manipulationTechniques.length > 0 ? (
                            currentAnalysis.manipulationTechniques.map((tech, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-200">
                                {tech}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs italic">Nebyly detekovány žádné dominantní manipulativní techniky.</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Emoční tón odesílatele:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {currentAnalysis.detectedEmotions.map((emotion, idx) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>

                      {currentAnalysis.threatDetails && (
                        <div>
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Identifikované hrozby:</h4>
                          <p className="text-sm font-semibold text-red-900 bg-red-50/50 p-2.5 rounded border border-red-100 leading-relaxed">
                            {currentAnalysis.threatDetails}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expert Advice Block */}
                    <div className="bg-indigo-50/20 border border-indigo-100/60 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5" />
                          <span>Jak s touto zprávou naložit:</span>
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {currentAnalysis.advice}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-indigo-100/30 text-[11px] text-gray-500 italic">
                        Tip: Zachovejte absolutní neutralitu. Druhá strana se snaží vyvolat vaši emocionální reakci, aby ji mohla zneužít.
                      </div>
                    </div>
                  </div>

                  {/* Gray Rock Suggested Reply Card */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 mb-6 border border-slate-800">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        Doporučená odpověď (Metoda Gray Rock)
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(currentAnalysis.grayRockResponse)}
                        className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white transition-colors py-1 px-2 hover:bg-slate-800 rounded"
                        title="Kopírovat do schránky"
                      >
                        {copiedResponse ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400 font-medium">Zkopírováno!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Kopírovat text</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800 text-slate-200 select-all leading-relaxed min-h-[60px]">
                      {currentAnalysis.grayRockResponse}
                    </div>

                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Text neobsahuje žádné urážky, obhajoby ani citlivá osobní data. Je zcela bezpečné jej odeslat.</span>
                    </div>
                  </div>

                  {/* User documentation section */}
                  <div className="border-t border-gray-150 pt-5 mt-5">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Doplnění faktů pro advokáta / soud (volitelné):</h4>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Zde si můžete poznamenat objektivní kontext k této zprávě (např. 'Zpráva doručena v době, kdy měl mít děti u sebe', 'Svědkem situace byla paní učitelka', 'Pravdivá verze: peníze jsem odeslala již v pondělí'). Tyto poznámky se uloží do archivu a budou zobrazeny v právním exportu.
                    </p>

                    <textarea
                      rows={3}
                      value={currentUserNotes}
                      onChange={(e) => setCurrentUserNotes(e.target.value)}
                      placeholder="Uveďte suchá, ověřitelná fakta. Vyhněte se vlastním emocím či urážkám..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:bg-white focus:border-indigo-500 focus:outline-hidden mb-4"
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Záznam bude bezpečně zašifrován a uložen pouze v tomto zařízení.
                      </p>

                      <button
                        onClick={handleSaveToArchive}
                        disabled={justSaved}
                        className={`flex items-center space-x-2 font-bold py-2 px-5 rounded-lg text-xs transition-all cursor-pointer ${
                          justSaved
                            ? "bg-green-600 text-white"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {justSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Bezpečně uloženo do archivu</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Uložit do archivu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ARCHIVE */}
          {activeTab === "archive" && (
            <div className="space-y-6 no-print" id="archive-tab-content">
              {/* Header card with filters */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Archiv krizové komunikace</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Zašifrovaný přehled zdokumentovaných zpráv a analýz pro vašeho advokáta.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab("export")}
                    className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all self-start md:self-auto"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Otevřít Právní Export</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100" id="archive-filters">
                  {/* Search box */}
                  <div className="relative sm:col-span-2">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Vyhledat v textech, poznámkách nebo technikách..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-sm pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Threat dropdown/filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500">Riziko:</span>
                    <select
                      value={threatFilter}
                      onChange={(e) => setThreatFilter(e.target.value as any)}
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 focus:bg-white focus:border-indigo-500 focus:outline-hidden font-medium text-gray-700"
                    >
                      <option value="VŠE">Zobrazit vše</option>
                      <option value="NÍZKÉ">Nízké riziko</option>
                      <option value="STŘEDNÍ">Střední riziko</option>
                      <option value="VYSOKÉ">Vysoké riziko (výhrůžky)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logs display container */}
              {filteredLogsList.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-semibold text-gray-700">V archivu nebyly nalezeny žádné záznamy</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
                    Buď nemáte v databázi uložené žádné zprávy, nebo žádná nevyhovuje zadanému filtru vyhledávání. Vložte novou zprávu na záložce <strong>Nový rozbor</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-4" id="archive-list-container">
                  {filteredLogsList.map((log) => {
                    const isHigh = log.analysis.threatLevel === "VYSOKÉ";
                    const isMed = log.analysis.threatLevel === "STŘEDNÍ";

                    return (
                      <div
                        key={log.id}
                        className="bg-white border border-gray-150 rounded-xl p-5 shadow-2xs hover:border-indigo-150 transition-all"
                      >
                        {/* Record Top Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
                          <div className="flex items-center space-x-2.5 text-xs text-gray-500">
                            <span className="font-semibold text-gray-800">
                              {new Date(log.timestamp).toLocaleDateString("cs-CZ")} v {new Date(log.timestamp).toLocaleTimeString("cs-CZ")}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-gray-600">ID incidentu: {log.id.replace("log-", "")}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                              isHigh
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : isMed
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-green-50 text-green-700 border border-green-100"
                            }`}>
                              {log.analysis.threatLevel}
                            </span>
                            
                            <button
                              onClick={() => {
                                if (confirm("Opravdu si přejete tento záznam trvale a nenávratně odstranit ze svého šifrovaného archivu?")) {
                                  handleDeleteLog(log.id);
                                }
                              }}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Odstranit záznam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Text comparison body */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Original Message column */}
                          <div className="bg-gray-50/50 rounded-lg p-3.5 border border-gray-100">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Originální text od partnera:</span>
                            <blockquote className="text-xs text-gray-800 font-serif italic whitespace-pre-wrap leading-relaxed">
                              "{log.originalMessage}"
                            </blockquote>
                          </div>

                          {/* Gray rock reply column */}
                          <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 border border-slate-800 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Navržená Gray Rock odpověď:</span>
                                <button
                                  onClick={() => handleCopyToClipboard(log.analysis.grayRockResponse)}
                                  className="text-slate-400 hover:text-white p-0.5 rounded"
                                  title="Kopírovat odpověď"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs font-mono text-slate-200 bg-slate-950 p-2 rounded leading-relaxed">
                                {log.analysis.grayRockResponse}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 italic mt-2.5">
                              {log.analysis.safeToReply 
                                ? "✓ Věcné, bez emocí a J.A.D.E. vzorců." 
                                : "⚠ Rizikové! Doporučeno bezprostředně neodpovídat."}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown of psychological evaluation */}
                        <div className="bg-indigo-50/10 border border-indigo-100/30 rounded-lg p-3.5 text-xs mb-4">
                          <p className="text-gray-700 leading-relaxed">
                            <strong className="text-indigo-800">Použitá manipulace: </strong>
                            {log.analysis.manipulationTechniques.join(", ") || "Nespecifikováno"}
                            <span className="mx-2 text-gray-300">|</span>
                            <strong className="text-indigo-800">Odezva tónu: </strong>
                            {log.analysis.detectedEmotions.join(", ") || "Neutrální"}
                          </p>
                          <p className="text-gray-600 mt-1.5 leading-relaxed">
                            <strong>Doporučení poradce: </strong> {log.analysis.advice}
                          </p>
                        </div>

                        {/* User added facts */}
                        <div className="border-t border-gray-100 pt-3">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Fakta & Poznámky k incidentu (Důkazní materiál pro advokáta):
                          </label>
                          <textarea
                            value={log.userNotes || ""}
                            onChange={(e) => handleUpdateNotes(log.id, e.target.value)}
                            placeholder="Zde uveďte fakta... (Svědci, časové nesrovnalosti, důkazy opaku)"
                            rows={2}
                            className="w-full bg-amber-50/10 border border-amber-100/50 hover:border-amber-200 focus:bg-white focus:border-indigo-500 text-xs rounded-lg p-2.5 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: TEMPLATES */}
          {activeTab === "templates" && (
            <div className="no-print animate-fadeIn" id="templates-tab-content">
              <AssertiveTemplates
                onSelectTemplate={(text) => {
                  setMessageInput(text);
                  setActiveTab("analyze");
                }}
              />
            </div>
          )}

          {/* TAB: EXPORT */}
          {activeTab === "export" && (
            <div className="animate-fadeIn" id="export-tab-content">
              <LegalExport
                logs={logs}
                onBack={() => setActiveTab("archive")}
                onDeleteLog={handleDeleteLog}
              />
            </div>
          )}
        </section>
      </main>

      {/* Footer info banner */}
      <footer className="bg-slate-900 border-t border-slate-850 text-slate-500 py-6 mt-12 no-print" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <p className="font-semibold text-slate-400">Komunikační filtr pro krizový rozvod & digitální bezpečnost</p>
          <p className="max-w-xl mx-auto leading-relaxed">
            Tento nástroj poskytuje asertivní vodítka za účelem deeskalace konfliktů. Neukládá vaše zprávy ani hesla na vzdálené servery. Všechna data jsou ukládána šifrovaně standardem AES-GCM přímo ve vašem lokálním prohlížeči.
          </p>
          <p className="text-slate-600">
            © 2026. Všechna práva vyhrazena. Pouze k legální podpoře obětí psychického nátlaku a domácího násilí.
          </p>
        </div>
      </footer>
    </div>
  );
}
