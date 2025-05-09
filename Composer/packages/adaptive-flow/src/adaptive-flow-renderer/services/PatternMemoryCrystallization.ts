// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// The Pattern Memory Crystallization system remembers successful dialog patterns
// across sessions, creating a growing library of effective dialog strategies

import { LocalStorage } from './storage/LocalStorage';

// A dialog pattern that has proven effective
export interface CrystalPattern {
  id: string;
  name: string;
  description: string;
  patternType: string;
  dialogStructure: any;
  effectiveness: number; // 0-1 scale of how effective this pattern has been
  usageCount: number;
  firstDetected: string; // ISO date string
  lastUsed: string; // ISO date string
}

// Connection between patterns
export interface PatternConnection {
  sourceId: string;
  targetId: string;
  connectionStrength: number;
  connectionType: string;
}

// The crystallization process gradually refines raw patterns into reliable templates
class PatternCrystallization {
  private storage: LocalStorage;
  private patterns: Map<string, CrystalPattern> = new Map();
  private connections: PatternConnection[] = [];
  private isInitialized = false;

  // Initialize with local storage
  constructor() {
    this.storage = new LocalStorage('deep-tree-echo-patterns');
  }

  // Load patterns from persistent storage
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load patterns
      const storedPatterns = await this.storage.getItem('patterns');
      if (storedPatterns) {
        const parsedPatterns = JSON.parse(storedPatterns);

        // Restore the Map structure
        Object.entries(parsedPatterns).forEach(([id, pattern]) => {
          this.patterns.set(id, pattern as CrystalPattern);
        });
      }

      // Load connections
      const storedConnections = await this.storage.getItem('connections');
      if (storedConnections) {
        this.connections = JSON.parse(storedConnections);
      }

      this.isInitialized = true;
      console.log(`Pattern Memory Crystallization initialized with ${this.patterns.size} patterns`);
    } catch (err) {
      console.error('Error initializing Pattern Memory:', err);
    }
  }

  // Save the current state to persistent storage
  private async persistState(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // Convert Map to object for storage
      const patternsObj = Object.fromEntries(this.patterns.entries());

      // Save to storage
      await this.storage.setItem('patterns', JSON.stringify(patternsObj));
      await this.storage.setItem('connections', JSON.stringify(this.connections));
    } catch (err) {
      console.error('Error persisting pattern memory:', err);
    }
  }

  // Register a new pattern or update an existing one
  async registerPattern(pattern: Omit<CrystalPattern, 'firstDetected' | 'lastUsed' | 'usageCount' | 'effectiveness'>): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const now = new Date().toISOString();

    if (this.patterns.has(pattern.id)) {
      // Update existing pattern
      const existingPattern = this.patterns.get(pattern.id)!;

      this.patterns.set(pattern.id, {
        ...existingPattern,
        ...pattern,
        effectiveness: existingPattern.effectiveness,
        usageCount: existingPattern.usageCount + 1,
        lastUsed: now
      });
    } else {
      // Create new pattern
      this.patterns.set(pattern.id, {
        ...pattern,
        effectiveness: 0.5, // Start with neutral effectiveness
        usageCount: 1,
        firstDetected: now,
        lastUsed: now
      });
    }

    // Persist the updated state
    await this.persistState();
  }

  // Record a successful use of a pattern
  async recordSuccess(patternId: string, successLevel: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.patterns.has(patternId)) return;

    const pattern = this.patterns.get(patternId)!;

    // Update the effectiveness (weighted average)
    const newEffectiveness = (pattern.effectiveness * pattern.usageCount + successLevel) / (pattern.usageCount + 1);

    // Update the pattern
    this.patterns.set(patternId, {
      ...pattern,
      effectiveness: newEffectiveness,
      usageCount: pattern.usageCount + 1,
      lastUsed: new Date().toISOString()
    });

    // Persist the updated state
    await this.persistState();
  }

  // Connect two patterns
  async connectPatterns(sourceId: string, targetId: string, strength: number, type: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if both patterns exist
    if (!this.patterns.has(sourceId) || !this.patterns.has(targetId)) {
      return;
    }

    // Check if connection already exists
    const existingConnection = this.connections.find(
      c => c.sourceId === sourceId && c.targetId === targetId
    );

    if (existingConnection) {
      // Update existing connection
      existingConnection.connectionStrength = (existingConnection.connectionStrength + strength) / 2;
      existingConnection.connectionType = type;
    } else {
      // Create new connection
      this.connections.push({
        sourceId,
        targetId,
        connectionStrength: strength,
        connectionType: type
      });
    }

    // Persist the updated state
    await this.persistState();
  }

  // Get most effective patterns of a specific type
  async getEffectivePatterns(patternType: string, limit = 5): Promise<CrystalPattern[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Filter by type and sort by effectiveness
    return Array.from(this.patterns.values())
      .filter(p => p.patternType === patternType && p.effectiveness > 0.6)
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, limit);
  }

  // Get patterns connected to a specific pattern
  async getConnectedPatterns(patternId: string): Promise<Array<CrystalPattern & { connectionStrength: number }>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Find all connections for this pattern
    const relatedConnections = this.connections.filter(
      c => c.sourceId === patternId || c.targetId === patternId
    );

    // Get the related patterns
    return relatedConnections.map(conn => {
      const relatedId = conn.sourceId === patternId ? conn.targetId : conn.sourceId;
      const pattern = this.patterns.get(relatedId);

      if (!pattern) return null;

      return {
        ...pattern,
        connectionStrength: conn.connectionStrength
      };
    }).filter(p => p !== null) as Array<CrystalPattern & { connectionStrength: number }>;
  }
}

// Create local storage implementation for the pattern memory
class LocalStorage {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async getItem(key: string): Promise<string | null> {
    const fullKey = `${this.prefix}.${key}`;

    try {
      // Try to use browser localStorage if available
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(fullKey);
      }

      // Fallback to memory storage
      return (global as any).__memoryStorage?.[fullKey] || null;
    } catch (err) {
      console.error('Storage access error:', err);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const fullKey = `${this.prefix}.${key}`;

    try {
      // Try to use browser localStorage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(fullKey, value);
        return;
      }

      // Fallback to memory storage
      if (!(global as any).__memoryStorage) {
        (global as any).__memoryStorage = {};
      }

      (global as any).__memoryStorage[fullKey] = value;
    } catch (err) {
      console.error('Storage access error:', err);
    }
  }
}

// Singleton instance
export const patternMemory = new PatternCrystallization();
