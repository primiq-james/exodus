// src/pages/demo/Home.tsx
import ChatbotWidget from "../../components/chat/ChatbotWidget";
import exodusLogo from "../../assets/exodus-logo-wordmark.jpg";

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
          <img
            src={exodusLogo}
            alt="Exodus"
            className="exodus-chat-logo"
          />
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
