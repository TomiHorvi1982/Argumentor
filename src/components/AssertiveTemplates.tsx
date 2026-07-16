import { useState } from "react";
import { BookOpen, Copy, Check, MessageSquare, AlertCircle } from "lucide-react";
import { SafeTemplate } from "../types.ts";

interface AssertiveTemplatesProps {
  onSelectTemplate: (text: string) => void;
}

const TEMPLATES: SafeTemplate[] = [
  {
    id: "predani-deti",
    category: "Předání dětí a styk",
    title: "Potvrzení času vyzvednutí",
    description: "Krátké, věcné potvrzení času a místa předání dětí bez zbytečného rozvádění.",
    templateText: "Potvrzuji vyzvednutí dětí v [DEN] v [ČAS] na dohodnutém místě: [MÍSTO]. Děkuji.",
    placeholders: ["DEN", "ČAS", "MÍSTO"]
  },
  {
    id: "zmena-planu",
    category: "Předání dětí a styk",
    title: "Změna termínu (odmítnutí)",
    description: "Odmítnutí nátlakové změny plánu na poslední chvíli s odkazem na dohodu.",
    templateText: "Z důvodu již naplánovaného programu trvám na termínu, který je stanoven v platné dohodě / soudním rozhodnutí. Změna bohužel není možná.",
    placeholders: []
  },
  {
    id: "osocovani",
    category: "Urážky a osočování",
    title: "Hranice vůči osobním útokům",
    description: "Reakce na urážky, která dává jasnou hranici, že budete komunikovat pouze věcně.",
    templateText: "Na osobní útoky a urážky nebudu reagovat. Pokud máte organizační dotaz ohledně dětí nebo majetku, ráda jej zodpovím v čistě věcné rovině.",
    placeholders: []
  },
  {
    id: "finance",
    category: "Finanční záležitosti",
    title: "Požadavek na doložení nákladů",
    description: "Odpověď na nároky ohledně peněz, která vyžaduje písemné doložení bez emocí.",
    templateText: "Tento požadavek beru na vědomí. Prosím o zaslání příslušných faktur a dokladů na můj e-mail. Jakmile je prostuduji, vyjádřím se.",
    placeholders: []
  },
  {
    id: "nepravda",
    category: "Urážky a osočování",
    title: "Odmítnutí nepravdivých tvrzení",
    description: "Jednoduché popření lží bez zabřednutí do hádek (nesouhlasí se, ale nediskutuje se).",
    templateText: "S vaším popisem situace nesouhlasím. Skutečnosti jsou jiné. Další diskuzi na toto téma nepovažuji za produktivní a nebudu v ní pokračovat.",
    placeholders: []
  },
  {
    id: "pravni-zastupce",
    category: "Právní nátlak",
    title: "Odkaz na právního zástupce",
    description: "Vhodné při stupňujícím se vyhrožování soudem nebo exekucemi.",
    templateText: "Tuto záležitost předávám svému právnímu zástupci. Veškeré další dotazy v této věci prosím směřujte přímo na něj.",
    placeholders: []
  }
];

export default function AssertiveTemplates({ onSelectTemplate }: AssertiveTemplatesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Vše");

  const categories = ["Vše", ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

  const filteredTemplates = activeCategory === "Vše"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6" id="templates-section">
      <div className="flex items-center space-x-2.5 mb-5">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900" id="templates-section-title">
          Knihovna asertivních šablon (Gray Rock)
        </h2>
      </div>

      {/* JADE Method Explanation */}
      <div className="bg-indigo-50/50 rounded-lg p-4 mb-6 border border-indigo-100/50 text-sm" id="jade-rule-card">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-indigo-900">Zlaté komunikační pravidlo: Metoda J.A.D.E.</h4>
            <p className="text-gray-600 mt-1">
              Při komunikaci s vysoce konfliktní osobou se držte zásady <strong>NEOBHAJOVAT SE</strong>. 
              Zkratka <strong>J.A.D.E.</strong> označuje to, co <strong>NIKDY</strong> nesmíte v odpovědi dělat:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-medium text-xs">
              <li className="bg-white px-2 py-1.5 rounded border border-indigo-100 text-indigo-900 text-center shadow-2xs">
                ❌ J - Justify (Obhajovat se)
              </li>
              <li className="bg-white px-2 py-1.5 rounded border border-indigo-100 text-indigo-900 text-center shadow-2xs">
                ❌ A - Argue (Přít se / Hádat se)
              </li>
              <li className="bg-white px-2 py-1.5 rounded border border-indigo-100 text-indigo-900 text-center shadow-2xs">
                ❌ D - Defend (Bránit se)
              </li>
              <li className="bg-white px-2 py-1.5 rounded border border-indigo-100 text-indigo-900 text-center shadow-2xs">
                ❌ E - Explain (Vysvětlovat)
              </li>
            </ul>
            <p className="text-gray-500 text-xs mt-2 italic">
              Jakékoli vysvětlení či obhajoba dává manipulátorovi další materiál k překroucení a útokům. Odpověď musí být suchá a hladká jako šedý kámen (šedá skála).
            </p>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-4" id="template-categories-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="templates-grid">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-gray-150 rounded-lg p-4 hover:border-indigo-200 transition-all flex flex-col justify-between bg-gray-50/30"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  {template.category}
                </span>
                {template.placeholders.length > 0 && (
                  <span className="text-[10px] bg-amber-105 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    K úpravě
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{template.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{template.description}</p>
              
              <div className="bg-white border border-gray-100 rounded p-2.5 mb-3 font-mono text-xs text-gray-700 leading-relaxed select-all">
                {template.templateText}
              </div>
            </div>

            <div className="flex space-x-2 mt-auto pt-2 border-t border-gray-100/50">
              <button
                onClick={() => onSelectTemplate(template.templateText)}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center space-x-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Použít jako vzor</span>
              </button>
              <button
                onClick={() => handleCopy(template.templateText, template.id)}
                className="bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 p-1.5 rounded transition-colors"
                title="Kopírovat do schránky"
              >
                {copiedId === template.id ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
