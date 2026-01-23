"use client";

import { Navbar } from "@/components/Navbar";
import { KnowledgeManagement } from "@/components/KnowledgeManagement";

// Mock 数据作为降级方案
const mockKOLs = [
  {
    name: "Ansem",
    handle: "blknoiz06",
  },
  {
    name: "Toly",
    handle: "aeyakovenko",
  },
  {
    name: "CryptoWendyO",
    handle: "CryptoWendyO",
  },
];

export default function KnowledgePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Knowledge Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Knowledge Sync</h1>
            <p className="text-muted-foreground">Manage vector databases and RAG memory for your agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockKOLs.map((kol) => (
              <KnowledgeManagement key={kol.handle} kolHandle={kol.handle} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
