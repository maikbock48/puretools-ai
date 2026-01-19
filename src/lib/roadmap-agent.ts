/**
 * PureTools Roadmap Agent
 *
 * Automatically maintains and updates the ROADMAP.md file.
 * Tracks development progress, task completion, and generates reports.
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
export interface Task {
  name: string;
  status: 'done' | 'in_progress' | 'pending' | 'blocked';
  phase: number;
  priority?: 'high' | 'medium' | 'low';
  complexity?: 'low' | 'medium' | 'high';
}

export interface Phase {
  number: number;
  name: string;
  progress: number;
  tasks: Task[];
}

export interface RoadmapData {
  lastUpdated: string;
  currentPhase: number;
  overallProgress: number;
  phases: Phase[];
}

// Status icons
const STATUS_ICONS = {
  done: '✅',
  in_progress: '🔄',
  pending: '⏳',
  blocked: '❌',
};

const PROGRESS_BAR_LENGTH = 20;

// Helper: Generate progress bar
function generateProgressBar(percentage: number): string {
  const filled = Math.round((percentage / 100) * PROGRESS_BAR_LENGTH);
  const empty = PROGRESS_BAR_LENGTH - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Helper: Get current date in YYYY-MM-DD format
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Phase definitions with tasks
const PHASES: Phase[] = [
  {
    number: 1,
    name: 'Foundation',
    progress: 40,
    tasks: [
      { name: 'Project Setup (Next.js, TypeScript, Tailwind)', status: 'done', phase: 1 },
      { name: 'i18n Configuration (DE/EN)', status: 'done', phase: 1 },
      { name: 'Core Layout (Navbar, Footer, Theme)', status: 'done', phase: 1 },
      { name: 'Dashboard/Homepage', status: 'done', phase: 1 },
      { name: 'SEO Module', status: 'done', phase: 1 },
      { name: 'QR Generator Tool', status: 'done', phase: 1 },
      { name: 'AI Service Layer', status: 'done', phase: 1 },
      { name: 'Pricing Page', status: 'pending', phase: 1 },
      { name: 'About Page', status: 'pending', phase: 1 },
      { name: 'Privacy Policy', status: 'pending', phase: 1 },
      { name: 'Terms of Service', status: 'pending', phase: 1 },
      { name: 'Contact Page', status: 'pending', phase: 1 },
      { name: 'Testing Setup', status: 'pending', phase: 1 },
    ],
  },
  {
    number: 2,
    name: 'Local Tools',
    progress: 0,
    tasks: [
      { name: 'Image Compressor', status: 'pending', phase: 2, priority: 'high', complexity: 'medium' },
      { name: 'HEIC to JPG Converter', status: 'pending', phase: 2, priority: 'high', complexity: 'low' },
      { name: 'PDF Toolkit (Merge/Split)', status: 'pending', phase: 2, priority: 'high', complexity: 'medium' },
      { name: 'Privacy OCR', status: 'pending', phase: 2, priority: 'medium', complexity: 'high' },
      { name: 'Audio Cutter', status: 'pending', phase: 2, priority: 'medium', complexity: 'medium' },
      { name: 'Background Remover', status: 'pending', phase: 2, priority: 'medium', complexity: 'high' },
      { name: 'JSON Formatter', status: 'pending', phase: 2, priority: 'low', complexity: 'low' },
      { name: 'Code Beautifier', status: 'pending', phase: 2, priority: 'low', complexity: 'low' },
      { name: 'CSV to Excel', status: 'pending', phase: 2, priority: 'low', complexity: 'medium' },
    ],
  },
  {
    number: 3,
    name: 'AI Tools',
    progress: 0,
    tasks: [
      { name: 'AI Document Translator', status: 'pending', phase: 3, priority: 'high' },
      { name: 'AI Transcriber', status: 'pending', phase: 3, priority: 'high' },
      { name: 'AI Summarizer', status: 'pending', phase: 3, priority: 'medium' },
      { name: 'API Routes Setup', status: 'pending', phase: 3 },
      { name: 'File Upload Handling', status: 'pending', phase: 3 },
      { name: 'Progress Indicators', status: 'pending', phase: 3 },
    ],
  },
  {
    number: 4,
    name: 'User System',
    progress: 0,
    tasks: [
      { name: 'NextAuth.js Integration', status: 'pending', phase: 4 },
      { name: 'OAuth Providers (Google, GitHub)', status: 'pending', phase: 4 },
      { name: 'Credit System', status: 'pending', phase: 4 },
      { name: 'Stripe Integration', status: 'pending', phase: 4 },
      { name: 'User Dashboard', status: 'pending', phase: 4 },
      { name: 'Subscription Management', status: 'pending', phase: 4 },
    ],
  },
  {
    number: 5,
    name: 'Polish & Launch',
    progress: 0,
    tasks: [
      { name: 'Performance Optimization', status: 'pending', phase: 5 },
      { name: 'PWA Setup', status: 'pending', phase: 5 },
      { name: 'SEO Finalization', status: 'pending', phase: 5 },
      { name: 'Analytics Integration', status: 'pending', phase: 5 },
      { name: 'Security Audit', status: 'pending', phase: 5 },
      { name: 'Accessibility Audit', status: 'pending', phase: 5 },
      { name: 'Production Deployment', status: 'pending', phase: 5 },
    ],
  },
];

// Roadmap Agent Class
export class RoadmapAgent {
  private dataPath: string;
  private roadmapPath: string;
  private data: RoadmapData;

  constructor(projectRoot: string = process.cwd()) {
    this.dataPath = path.join(projectRoot, 'roadmap-data.json');
    this.roadmapPath = path.join(projectRoot, 'ROADMAP.md');
    this.data = this.loadData();
  }

  // Load or initialize data
  private loadData(): RoadmapData {
    if (fs.existsSync(this.dataPath)) {
      const raw = fs.readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(raw);
    }

    // Initialize with default phases
    return {
      lastUpdated: getCurrentDate(),
      currentPhase: 1,
      overallProgress: 15,
      phases: PHASES,
    };
  }

  // Save data to JSON file
  private saveData(): void {
    this.data.lastUpdated = getCurrentDate();
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  // Calculate phase progress
  private calculatePhaseProgress(phase: Phase): number {
    const total = phase.tasks.length;
    if (total === 0) return 0;

    const done = phase.tasks.filter(t => t.status === 'done').length;
    const inProgress = phase.tasks.filter(t => t.status === 'in_progress').length;

    return Math.round(((done + inProgress * 0.5) / total) * 100);
  }

  // Calculate overall progress
  private calculateOverallProgress(): number {
    const totalTasks = this.data.phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const doneTasks = this.data.phases.reduce(
      (sum, p) => sum + p.tasks.filter(t => t.status === 'done').length,
      0
    );
    const inProgressTasks = this.data.phases.reduce(
      (sum, p) => sum + p.tasks.filter(t => t.status === 'in_progress').length,
      0
    );

    return Math.round(((doneTasks + inProgressTasks * 0.5) / totalTasks) * 100);
  }

  // Update task status
  updateTask(taskName: string, status: Task['status']): boolean {
    for (const phase of this.data.phases) {
      const task = phase.tasks.find(
        t => t.name.toLowerCase().includes(taskName.toLowerCase())
      );
      if (task) {
        task.status = status;
        phase.progress = this.calculatePhaseProgress(phase);
        this.data.overallProgress = this.calculateOverallProgress();

        // Update current phase if needed
        if (status === 'in_progress') {
          this.data.currentPhase = phase.number;
        }

        this.saveData();
        this.generateRoadmap();
        return true;
      }
    }
    return false;
  }

  // Add new task
  addTask(task: Omit<Task, 'status'> & { status?: Task['status'] }): void {
    const phase = this.data.phases.find(p => p.number === task.phase);
    if (phase) {
      phase.tasks.push({
        ...task,
        status: task.status || 'pending',
      });
      phase.progress = this.calculatePhaseProgress(phase);
      this.data.overallProgress = this.calculateOverallProgress();
      this.saveData();
      this.generateRoadmap();
    }
  }

  // Get current status
  getStatus(): {
    currentPhase: string;
    overallProgress: number;
    nextTasks: Task[];
  } {
    const currentPhase = this.data.phases.find(p => p.number === this.data.currentPhase);
    const nextTasks = this.data.phases
      .flatMap(p => p.tasks)
      .filter(t => t.status === 'pending')
      .slice(0, 5);

    return {
      currentPhase: currentPhase ? `Phase ${currentPhase.number}: ${currentPhase.name}` : 'Unknown',
      overallProgress: this.data.overallProgress,
      nextTasks,
    };
  }

  // Generate progress report
  generateReport(): string {
    const status = this.getStatus();
    let report = `\n📊 PureTools Development Report\n`;
    report += `${'═'.repeat(40)}\n\n`;
    report += `📅 Date: ${getCurrentDate()}\n`;
    report += `🎯 Current Phase: ${status.currentPhase}\n`;
    report += `📈 Overall Progress: ${status.overallProgress}%\n\n`;

    report += `Phase Progress:\n`;
    for (const phase of this.data.phases) {
      report += `  Phase ${phase.number}: ${phase.name}\n`;
      report += `  [${generateProgressBar(phase.progress)}] ${phase.progress}%\n\n`;
    }

    report += `\n🔜 Next Priority Tasks:\n`;
    for (const task of status.nextTasks) {
      report += `  • ${task.name} (Phase ${task.phase})\n`;
    }

    return report;
  }

  // Generate ROADMAP.md content
  generateRoadmap(): void {
    const content = this.buildRoadmapContent();
    fs.writeFileSync(this.roadmapPath, content);
  }

  private buildRoadmapContent(): string {
    const phases = this.data.phases;

    let md = `# PureTools AI - Development Roadmap

> **Last Updated:** ${getCurrentDate()}
> **Current Phase:** Phase ${this.data.currentPhase} - ${phases[this.data.currentPhase - 1]?.name || 'Foundation'}
> **Overall Progress:** ${this.data.overallProgress}%

---

## Vision

PureTools AI ist eine minimalistische, hochperformante Web-App mit Fokus auf:
- **Privacy-First:** Lokale Tools laufen 100% im Browser
- **AI-Power:** High-End Features via Gemini 1.5 Pro & OpenAI Whisper
- **SEO-Traffic:** Optimiert für organisches Wachstum
- **Multi-Language:** Deutsch (DE) und Englisch (EN)

---

## Progress Overview

\`\`\`
`;

    for (const phase of phases) {
      const paddedName = `Phase ${phase.number}: ${phase.name}`.padEnd(25);
      md += `${paddedName}[${generateProgressBar(phase.progress)}] ${phase.progress.toString().padStart(3)}%\n`;
    }

    md += `${'─'.repeat(53)}
Total Progress             [${generateProgressBar(this.data.overallProgress)}] ${this.data.overallProgress.toString().padStart(3)}%
\`\`\`

---

`;

    // Generate sections for each phase
    for (const phase of phases) {
      md += this.buildPhaseSection(phase);
    }

    // Add changelog
    md += this.buildChangelog();

    // Add next steps
    md += this.buildNextSteps();

    // Add usage instructions
    md += `
---

## Roadmap Agent Usage

\`\`\`bash
# Update task status
npx ts-node scripts/roadmap.ts update "Task Name" done

# Add new task
npx ts-node scripts/roadmap.ts add "New Task" --phase 2 --priority high

# Generate report
npx ts-node scripts/roadmap.ts report

# Regenerate ROADMAP.md
npx ts-node scripts/roadmap.ts sync
\`\`\`

---

*This roadmap is automatically maintained by the PureTools Roadmap Agent.*
`;

    return md;
  }

  private buildPhaseSection(phase: Phase): string {
    const statusLabel = phase.progress === 100 ? 'Completed' :
                        phase.progress > 0 ? 'In Progress' : 'Not Started';

    let section = `## Phase ${phase.number}: ${phase.name}

> **Status:** ${statusLabel}
> **Progress:** ${phase.progress}%

`;

    const doneTasks = phase.tasks.filter(t => t.status === 'done');
    const inProgressTasks = phase.tasks.filter(t => t.status === 'in_progress');
    const pendingTasks = phase.tasks.filter(t => t.status === 'pending');
    const blockedTasks = phase.tasks.filter(t => t.status === 'blocked');

    if (doneTasks.length > 0) {
      section += `### Completed\n\n`;
      for (const task of doneTasks) {
        section += `- [x] ${task.name}\n`;
      }
      section += `\n`;
    }

    if (inProgressTasks.length > 0) {
      section += `### In Progress\n\n`;
      for (const task of inProgressTasks) {
        section += `- [ ] 🔄 ${task.name}\n`;
      }
      section += `\n`;
    }

    if (pendingTasks.length > 0) {
      section += `### Pending\n\n`;
      for (const task of pendingTasks) {
        const priority = task.priority ? ` [${task.priority.toUpperCase()}]` : '';
        section += `- [ ] ${task.name}${priority}\n`;
      }
      section += `\n`;
    }

    if (blockedTasks.length > 0) {
      section += `### Blocked\n\n`;
      for (const task of blockedTasks) {
        section += `- [ ] ❌ ${task.name}\n`;
      }
      section += `\n`;
    }

    section += `---\n\n`;
    return section;
  }

  private buildChangelog(): string {
    return `## Changelog

### ${getCurrentDate()}
- Roadmap automatically updated by Roadmap Agent
- Current progress: ${this.data.overallProgress}%

`;
  }

  private buildNextSteps(): string {
    const nextTasks = this.data.phases
      .flatMap(p => p.tasks.map(t => ({ ...t, phaseName: p.name })))
      .filter(t => t.status === 'pending' && t.priority === 'high')
      .slice(0, 5);

    let section = `## Next Priority Tasks

`;

    let i = 1;
    for (const task of nextTasks) {
      section += `${i}. **${task.name}** - Phase ${task.phase}: ${task.phaseName}\n`;
      i++;
    }

    return section + `\n`;
  }
}

// CLI Interface
export function runCLI(args: string[]): void {
  const agent = new RoadmapAgent();
  const command = args[0];

  switch (command) {
    case 'update':
      const taskName = args[1];
      const status = args[2] as Task['status'];
      if (taskName && status) {
        const success = agent.updateTask(taskName, status);
        console.log(success ? `✅ Updated "${taskName}" to ${status}` : `❌ Task not found`);
      }
      break;

    case 'add':
      const name = args[1];
      const phaseArg = args.indexOf('--phase');
      const phase = phaseArg !== -1 ? parseInt(args[phaseArg + 1]) : 1;
      if (name) {
        agent.addTask({ name, phase });
        console.log(`✅ Added "${name}" to Phase ${phase}`);
      }
      break;

    case 'report':
      console.log(agent.generateReport());
      break;

    case 'sync':
      agent.generateRoadmap();
      console.log('✅ ROADMAP.md regenerated');
      break;

    default:
      console.log(`
PureTools Roadmap Agent

Commands:
  update <task> <status>  Update task status (done|in_progress|pending|blocked)
  add <task> --phase N    Add new task to phase N
  report                  Generate progress report
  sync                    Regenerate ROADMAP.md
      `);
  }
}

// Export for direct usage
export default RoadmapAgent;
