// src/pages/demo/Home.tsx
import ChatbotWidget from "../../components/chat/ChatbotWidget";

function ExodusCodeLogo() {
  return (
    <svg
      className="exodus-chat-logo"
      viewBox="0 0 420 150"
      role="img"
      aria-label="Exodus"
    >
      <defs>
        <linearGradient id="exodusLogoChrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5F7FF" />
          <stop offset="45%" stopColor="#98A2C6" />
          <stop offset="72%" stopColor="#F5F7FF" />
          <stop offset="100%" stopColor="#5B8CFF" />
        </linearGradient>
        <linearGradient id="exodusLogoBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="100%" stopColor="#7EF9FF" />
        </linearGradient>
        <filter id="exodusLogoGlow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#7EF9FF" floodOpacity="0.45" />
        </filter>
      </defs>

      <g fill="none" stroke="url(#exodusLogoBlue)" strokeLinecap="round" strokeLinejoin="round">
        <path d="M129 63 175 13 221 63" strokeWidth="1.7" opacity="0.75" />
        <path d="M175 13v-8" strokeWidth="1.4" opacity="0.75" />
        <circle cx="175" cy="4" r="3" strokeWidth="1.3" opacity="0.85" />
        <path d="M62 76H18m356 0h28M47 93H10m322 0h62" strokeWidth="2" opacity="0.65" />
        <path d="M89 104H66m270 0h22M99 48H71m216 0h54" strokeWidth="1.4" opacity="0.45" />
        <circle cx="29" cy="76" r="2" strokeWidth="1.4" opacity="0.7" />
        <circle cx="384" cy="76" r="2" strokeWidth="1.4" opacity="0.7" />
      </g>

      <g filter="url(#exodusLogoGlow)">
        <path
          d="M175 42 151 86h48L175 42Z"
          fill="#0B1020"
          stroke="url(#exodusLogoChrome)"
          strokeWidth="2"
        />
        <path
          d="M154 66c12-13 31-13 43 0-12 13-31 13-43 0Z"
          fill="#F5F7FF"
          opacity="0.95"
        />
        <circle cx="175.5" cy="66" r="8.5" fill="#0B1020" stroke="#7EF9FF" strokeWidth="1.6" />
        <circle cx="175.5" cy="66" r="3.2" fill="#F5F7FF" />
      </g>

      <g
        fill="url(#exodusLogoChrome)"
        stroke="#F5F7FF"
        strokeWidth="1.4"
        strokeLinejoin="round"
        paintOrder="stroke"
        filter="url(#exodusLogoGlow)"
      >
        <path d="M15 56h54v14H34v12h31v13H34v13h37v14H15z" />
        <path d="M83 56h21l19 24 19-24h22l-30 38 32 40h-22l-21-26-21 26H80l32-40z" />
        <path d="M173 56h54c21 0 36 14 36 33s-15 33-36 33h-54zm20 16v34h31c11 0 19-7 19-17s-8-17-19-17z" />
        <path d="M273 56h20v39c0 9 7 15 18 15s18-6 18-15V56h20v40c0 23-16 38-38 38s-38-15-38-38z" />
        <path d="M362 56h43v15h-39c-7 0-10 3-10 7s3 7 10 7h19c19 0 30 9 30 24 0 16-12 25-32 25h-46v-15h45c8 0 12-3 12-8s-4-8-12-8h-18c-18 0-29-9-29-23 0-15 11-24 27-24z" />
      </g>

      <g fill="#7EF9FF" opacity="0.65">
        {Array.from({ length: 8 }).map((_, index) => (
          <rect key={index} x={254 + index * 9} y="45" width="4" height="4" rx="1" />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <rect key={index} x={234 + index * 8} y="119" width="4" height="4" rx="1" />
        ))}
      </g>
    </svg>
  );
}

export default function DemoHome() {
  return (
    <main className="exodus-chat-entry" aria-label="Exodus Assistant">
      <section className="exodus-chat-window">
        <header className="exodus-chat-header">
          <div className="exodus-chat-mark" aria-hidden="true">
            EX
          </div>
          <div className="exodus-chat-title">
            <h1>Exodus Assistant</h1>
            <p>Online now</p>
          </div>
          <ExodusCodeLogo />
        </header>

        <div className="exodus-chat-body">
          <ChatbotWidget
            hideDisclosure
            initialGreetingOverride="How can I help with Exodus today?"
          />
        </div>
      </section>
    </main>
  );
}
