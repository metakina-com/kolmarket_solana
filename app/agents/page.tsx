"use client";

import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Agents Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">The Digital Cortex</h1>
            <p className="text-muted-foreground font-mono">Direct neural link to KOL digital twins.</p>
          </div>
          <ChatInterface />
        </div>
      </section>
    </main>
  );
}
