"use client";

import { Navbar } from "@/components/Navbar";
import { RolePortals } from "@/components/RolePortals";
import { motion } from "framer-motion";
import { Cpu, Zap, Network } from "lucide-react";

export default function NexusPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Nexus Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-6">
              <Network className="w-6 h-6 text-cyan-500" />
              <span className="text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Cyber Nexus
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              Choose Your Gateway
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              KOLMarket.ai adapts to your role in the decentralized ecosystem.
              Select a portal to enter the Cyber-Nexus.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <Cpu className="w-8 h-8 text-cyan-500 mb-3 mx-auto" />
                <div className="text-2xl font-bold text-foreground mb-1">4</div>
                <div className="text-sm text-muted-foreground">Role Portals</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <Zap className="w-8 h-8 text-purple-500 mb-3 mx-auto" />
                <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">AI Automation</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <Network className="w-8 h-8 text-green-500 mb-3 mx-auto" />
                <div className="text-2xl font-bold text-foreground mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Decentralized</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role Portals */}
      <div className="bg-background">
        <RolePortals />
      </div>
    </main>
  );
}
