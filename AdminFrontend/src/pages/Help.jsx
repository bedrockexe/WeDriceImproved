import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const faqs = [
  {
    id: "1",
    question: "What documents are required to rent a car?",
    answer: "Lorem ipsum dolor sit amet consectetur. Curabitur molestie vitae a auctor pellentesque enim.\n\nUltrices nunc egestas sed felis. Magna massa vulputate enim nec diam nisi. Aenean mattis faucibus viverra netus."
  },
  {
    id: "2",
    question: "Is there a minimum age requirement to rent a car?",
    answer: "Lorem ipsum dolor sit amet consectetur. Curabitur molestie vitae a auctor pellentesque enim.\n\nUltrices nunc egestas sed felis. Magna massa vulputate enim nec diam nisi. Aenean mattis faucibus viverra netus."
  },
  {
    id: "3",
    question: "How do I rent?",
    answer: "Lorem ipsum dolor sit amet consectetur. Curabitur molestie vitae a auctor pellentesque enim.\n\nUltrices nunc egestas sed felis. Magna massa vulputate enim nec diam nisi. Aenean mattis faucibus viverra netus."
  },
];

export default function Help() {
  const [selectedFaq, setSelectedFaq] = useState(faqs[0]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">FAQ's</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[450px_1fr] gap-4 md:gap-6">
        {/* Questions List */}
        <Card className="bg-muted/50 border-border h-fit sticky top-4">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="space-y-1">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setSelectedFaq(faq)}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 flex items-center justify-between group ${
                    selectedFaq.id === faq.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  }`}
                >
                  <span className="flex-1 pr-2">{faq.question}</span>
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform ${
                    selectedFaq.id === faq.id ? "text-primary" : "opacity-0 group-hover:opacity-100"
                  }`} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Answer Display */}
        <Card className="bg-card border-border min-h-[300px]">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              {selectedFaq.question}
            </h2>
            <div className="text-foreground space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
              {selectedFaq.answer.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
