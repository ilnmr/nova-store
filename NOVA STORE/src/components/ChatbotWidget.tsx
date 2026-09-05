"use client"

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

type Message = { role: 'bot' | 'user'; text: string };

const FAQ: Record<string, string> = {
  'كيف أشحن': 'اختار اللعبة من قسم الألعاب، حدد الباقة، أدخل رقم اللاعب الخاص بك، وأتمم الدفع. سيتم الشحن خلال دقائق بعد تأكيد الدفع.',
  'وين ألاقي رقم اللاعب': 'في Free Fire: افتح اللعبة واضغط على صورتك الشخصية — رقم الـ ID يظهر تحت اسمك. في Mobile Legends: اضغط على صورتك ثم "Edit Profile"، هتلاقي الـ User ID والـ Zone ID.',
  'mobile legends': 'في موبايل ليجيندز محتاج رقمين: User ID (الرقم الطويل) و Zone ID (الرقم القصير اللي جوا القوسين). ادخلهم في الخانتين المنفصلتين.',
  'zone id': 'في موبايل ليجيندز: افتح اللعبة → اضغط على صورتك → Edit Profile. هتلاقي User ID وجنبه بين قوسين Zone ID زي: (1234)',
  'طلبي': 'عشان تتابع طلبك، افتح صفحة "طلباتي" من القائمة. لو عندك مشكلة تواصل معنا على واتساب 01556723459.',
  'steam': 'لشحن ستيم: افتح قسم Steam، اختار الباقة، أدخل إيميل ستيم الخاص بيك وهنتواصل معاك بالسعر والتفاصيل.',
  'فودافون': 'الدفع عن طريق فودافون كاش على الرقم اللي هيظهر في الطلب. بعد الدفع، ارفع صورة الإيصال وهنشحن حسابك.',
  'default': 'شكراً على تواصلك! للمساعدة الفورية تواصل معنا:\n📞 01038344909\n💬 واتساب: 01556723459'
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(FAQ)) {
    if (lower.includes(key)) return reply;
  }
  return FAQ['default'];
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'أهلاً بك في NOVA STORE! كيف أقدر أساعدك؟ اسألني عن الشحن، رقم اللاعب، أو حالة طلبك.' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: getBotReply(userMsg) }]);
    }, 600);
  };

  return (
    <>
      {/* Toggle button — bottom-right, above WhatsApp button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 end-6 z-50 bg-primary text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Open support chatbot"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-40 end-6 z-50 w-80 bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="font-semibold text-sm">خدمة عملاء NOVA STORE</p>
              <p className="text-xs opacity-80">متاح الآن</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="اكتب سؤالك..."
              className="flex-1 text-sm px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={send}
              className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
