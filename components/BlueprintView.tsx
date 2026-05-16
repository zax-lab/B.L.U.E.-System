import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

export interface BlueprintStep {
  title: string;
  description: string;
  estimatedHours: number;
  actionItems: string[];
}

export interface Blueprint {
  goal: string;
  summary: string;
  steps: BlueprintStep[];
  motivationalClosing: string;
}

export default function BlueprintView({ blueprint }: { blueprint: Blueprint }) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleItem = (item: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const totalItems = blueprint.steps.reduce((acc, step) => acc + step.actionItems.length, 0);
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems.size / totalItems) * 100);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{blueprint.goal}</h2>
        <p className="text-zinc-400">{blueprint.summary}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-semibold text-zinc-300">Total Progress</span>
          <span className="text-sm font-bold text-indigo-400">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-zinc-800" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {blueprint.steps.map((step, index) => (
            <AccordionItem key={index} value={`step-${index}`} className="border-zinc-800 bg-zinc-900/50 rounded-2xl mb-4 overflow-hidden border px-1">
              <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col items-start text-left w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {index + 1}. {step.title}
                    </span>
                    <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md shrink-0">
                      ~{step.estimatedHours}h
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2">
                <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{step.description}</p>
                <div className="space-y-2">
                  {step.actionItems.map((item, itemIdx) => {
                    const isChecked = completedItems.has(item);
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => toggleItem(item)}
                        className={`flex items-start gap-3 w-full p-3 rounded-xl transition-all cursor-pointer ${
                          isChecked ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-zinc-800/40 hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <span className={`text-sm text-left ${isChecked ? 'text-zinc-300 line-through opacity-70' : 'text-zinc-200'}`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-800">
        <p className="text-sm italic text-zinc-500 text-center">"{blueprint.motivationalClosing}"</p>
      </div>
    </div>
  );
}
