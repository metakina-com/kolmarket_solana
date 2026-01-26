"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { RolePortals } from "@/components/RolePortals";
import { DocumentationSectionSimple } from "@/components/DocumentationSectionSimple";
import { FooterSimple } from "@/components/FooterSimple";


export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-cyan-500/20">
      <Navbar />

      {/* 1. Hero Entrance */}
      <div className="bg-background">
        <Hero />
      </div>

      {/* 2. Cyber Portals (Role Selector) */}
      <div id="portals" className="bg-background">
        <RolePortals />
      </div>

      {/* 3. Documentation Section - 使用简化组件 */}
      <DocumentationSectionSimple />

      {/* Footer - 使用简化组件 */}
      <FooterSimple />
    </main>
  );
}
