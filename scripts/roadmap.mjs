#!/usr/bin/env node

/**
 * PureTools Roadmap CLI
 * Node.js script to manage the development roadmap
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const DATA_PATH = path.join(PROJECT_ROOT, 'roadmap-data.json');
const ROADMAP_PATH = path.join(PROJECT_ROOT, 'ROADMAP.md');

const PROGRESS_BAR_LENGTH = 20;

// Helper: Generate progress bar
function generateProgressBar(percentage) {
  const filled = Math.round((percentage / 100) * PROGRESS_BAR_LENGTH);
  const empty = PROGRESS_BAR_LENGTH - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

// Helper: Get current date
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Load roadmap data
function loadData() {
  if (fs.existsSync(DATA_PATH)) {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }
  throw new Error('roadmap-data.json not found');
}

// Save roadmap data
function saveData(data) {
  data.lastUpdated = getCurrentDate();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Calculate phase progress
function calculatePhaseProgress(phase) {
  const total = phase.tasks.length;
  if (total === 0) return 0;

  const done = phase.tasks.filter(t => t.status === 'done').length;
  const inProgress = phase.tasks.filter(t => t.status === 'in_progress').length;

  return Math.round(((done + inProgress * 0.5) / total) * 100);
}

// Calculate overall progress
function calculateOverallProgress(data) {
  const totalTasks = data.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const doneTasks = data.phases.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.status === 'done').length,
    0
  );
  const inProgressTasks = data.phases.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.status === 'in_progress').length,
    0
  );

  return Math.round(((doneTasks + inProgressTasks * 0.5) / totalTasks) * 100);
}

// Update task status
function updateTask(taskName, status) {
  const data = loadData();

  for (const phase of data.phases) {
    const task = phase.tasks.find(
      t => t.name.toLowerCase().includes(taskName.toLowerCase())
    );
    if (task) {
      const oldStatus = task.status;
      task.status = status;
      phase.progress = calculatePhaseProgress(phase);
      data.overallProgress = calculateOverallProgress(data);

      if (status === 'in_progress') {
        data.currentPhase = phase.number;
      }

      saveData(data);
      generateRoadmap(data);

      console.log(`\u2705 Updated "${task.name}"`);
      console.log(`   Status: ${oldStatus} \u2192 ${status}`);
      console.log(`   Phase ${phase.number} Progress: ${phase.progress}%`);
      console.log(`   Overall Progress: ${data.overallProgress}%`);
      return true;
    }
  }

  console.log(`\u274C Task not found: "${taskName}"`);
  return false;
}

// Add new task
function addTask(name, phaseNumber, priority = null) {
  const data = loadData();
  const phase = data.phases.find(p => p.number === phaseNumber);

  if (!phase) {
    console.log(`\u274C Phase ${phaseNumber} not found`);
    return;
  }

  const task = { name, status: 'pending', phase: phaseNumber };
  if (priority) task.priority = priority;

  phase.tasks.push(task);
  phase.progress = calculatePhaseProgress(phase);
  data.overallProgress = calculateOverallProgress(data);

  saveData(data);
  generateRoadmap(data);

  console.log(`\u2705 Added "${name}" to Phase ${phaseNumber}: ${phase.name}`);
}

// Generate progress report
function generateReport() {
  const data = loadData();

  console.log(`
\u{1F4CA} PureTools Development Report
${'═'.repeat(45)}

\u{1F4C5} Date: ${data.lastUpdated}
\u{1F3AF} Current Phase: Phase ${data.currentPhase} - ${data.phases[data.currentPhase - 1]?.name}
\u{1F4C8} Overall Progress: ${data.overallProgress}%

Phase Progress:
`);

  for (const phase of data.phases) {
    console.log(`  Phase ${phase.number}: ${phase.name}`);
    console.log(`  [${generateProgressBar(phase.progress)}] ${phase.progress}%`);

    const done = phase.tasks.filter(t => t.status === 'done').length;
    const inProgress = phase.tasks.filter(t => t.status === 'in_progress').length;
    const pending = phase.tasks.filter(t => t.status === 'pending').length;

    console.log(`  \u2705 ${done} done | \u{1F504} ${inProgress} in progress | \u23F3 ${pending} pending\n`);
  }

  const nextTasks = data.phases
    .flatMap(p => p.tasks.map(t => ({ ...t, phaseName: p.name })))
    .filter(t => t.status === 'pending' && t.priority === 'high')
    .slice(0, 5);

  console.log(`\u{1F51C} Next Priority Tasks:`);
  for (const task of nextTasks) {
    console.log(`  \u2022 ${task.name} (Phase ${task.phase})`);
  }
}

// Quick status
function showStatus() {
  const data = loadData();
  const currentPhase = data.phases[data.currentPhase - 1];

  const nextTasks = data.phases
    .flatMap(p => p.tasks)
    .filter(t => t.status === 'pending')
    .slice(0, 5);

  console.log(`
\u{1F4CA} PureTools Quick Status
${'═'.repeat(30)}
\u{1F3AF} Phase ${data.currentPhase}: ${currentPhase?.name}
\u{1F4C8} Overall Progress: ${data.overallProgress}%

\u{1F51C} Next Tasks:
${nextTasks.map(t => `   \u2022 ${t.name}`).join('\n')}
`);
}

// Generate ROADMAP.md
function generateRoadmap(data) {
  if (!data) data = loadData();

  let md = `# PureTools AI - Development Roadmap

> **Last Updated:** ${getCurrentDate()}
> **Current Phase:** Phase ${data.currentPhase} - ${data.phases[data.currentPhase - 1]?.name || 'Foundation'}
> **Overall Progress:** ${data.overallProgress}%

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

  for (const phase of data.phases) {
    const paddedName = `Phase ${phase.number}: ${phase.name}`.padEnd(25);
    md += `${paddedName}[${generateProgressBar(phase.progress)}] ${phase.progress.toString().padStart(3)}%\n`;
  }

  md += `${'─'.repeat(53)}
Total Progress             [${generateProgressBar(data.overallProgress)}] ${data.overallProgress.toString().padStart(3)}%
\`\`\`

---

`;

  // Generate phase sections
  for (const phase of data.phases) {
    const statusLabel = phase.progress === 100 ? 'Completed' :
                        phase.progress > 0 ? 'In Progress' : 'Not Started';

    md += `## Phase ${phase.number}: ${phase.name}

> **Status:** ${statusLabel}
> **Progress:** ${phase.progress}%

`;

    const doneTasks = phase.tasks.filter(t => t.status === 'done');
    const inProgressTasks = phase.tasks.filter(t => t.status === 'in_progress');
    const pendingTasks = phase.tasks.filter(t => t.status === 'pending');

    if (doneTasks.length > 0) {
      md += `### Completed\n\n`;
      for (const task of doneTasks) {
        md += `- [x] ${task.name}\n`;
      }
      md += `\n`;
    }

    if (inProgressTasks.length > 0) {
      md += `### In Progress\n\n`;
      for (const task of inProgressTasks) {
        md += `- [ ] \u{1F504} ${task.name}\n`;
      }
      md += `\n`;
    }

    if (pendingTasks.length > 0) {
      md += `### Pending\n\n`;
      for (const task of pendingTasks) {
        const priority = task.priority ? ` [${task.priority.toUpperCase()}]` : '';
        md += `- [ ] ${task.name}${priority}\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  // Add next steps
  const nextTasks = data.phases
    .flatMap(p => p.tasks.map(t => ({ ...t, phaseName: p.name })))
    .filter(t => t.status === 'pending' && t.priority === 'high')
    .slice(0, 5);

  md += `## Next Priority Tasks\n\n`;
  let i = 1;
  for (const task of nextTasks) {
    md += `${i}. **${task.name}** - Phase ${task.phase}: ${task.phaseName}\n`;
    i++;
  }

  md += `
---

## Roadmap Agent Usage

\`\`\`bash
# Update task status
npm run roadmap:update "Task Name" done

# Add new task
npm run roadmap:add "New Task" 2 high

# Generate report
npm run roadmap:report

# Show quick status
npm run roadmap:status

# Regenerate ROADMAP.md
npm run roadmap:sync
\`\`\`

---

*This roadmap is automatically maintained by the PureTools Roadmap Agent.*
`;

  fs.writeFileSync(ROADMAP_PATH, md);
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'update':
    if (args[1] && args[2]) {
      updateTask(args[1], args[2]);
    } else {
      console.log('Usage: npm run roadmap:update "Task Name" <status>');
      console.log('Status: done | in_progress | pending | blocked');
    }
    break;

  case 'add':
    if (args[1] && args[2]) {
      addTask(args[1], parseInt(args[2]), args[3] || null);
    } else {
      console.log('Usage: npm run roadmap:add "Task Name" <phase> [priority]');
    }
    break;

  case 'report':
    generateReport();
    break;

  case 'sync':
    generateRoadmap();
    console.log('\u2705 ROADMAP.md regenerated');
    break;

  case 'status':
    showStatus();
    break;

  default:
    console.log(`
\u2554${'═'.repeat(60)}\u2557
\u2551             PureTools Roadmap Agent v1.0                     \u2551
\u255A${'═'.repeat(60)}\u255D

Usage:
  npm run roadmap <command> [args]

Commands:
  update <task> <status>    Update task status
                            Status: done | in_progress | pending | blocked

  add <task> <phase> [prio] Add a new task to a phase

  report                    Generate a progress report

  status                    Show quick status overview

  sync                      Regenerate ROADMAP.md

Examples:
  npm run roadmap update "Image Compressor" in_progress
  npm run roadmap add "Dark Mode Toggle" 1 high
  npm run roadmap report
`);
}
