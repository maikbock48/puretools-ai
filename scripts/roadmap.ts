#!/usr/bin/env npx ts-node

/**
 * PureTools Roadmap CLI
 *
 * Usage:
 *   npx ts-node scripts/roadmap.ts <command> [args]
 *
 * Commands:
 *   update <task> <status>  - Update task status
 *   add <task> --phase N    - Add new task
 *   report                  - Show progress report
 *   sync                    - Regenerate ROADMAP.md
 */

import { RoadmapAgent, runCLI } from '../src/lib/roadmap-agent';

// Run CLI with arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║             PureTools Roadmap Agent v1.0                       ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  npx ts-node scripts/roadmap.ts <command> [options]

Commands:
  update <task> <status>    Update task status
                            Status: done | in_progress | pending | blocked
                            Example: npx ts-node scripts/roadmap.ts update "Image Compressor" in_progress

  add <task> --phase <N>    Add a new task to a phase
                            Example: npx ts-node scripts/roadmap.ts add "Dark Mode Toggle" --phase 1

  report                    Generate a progress report
                            Example: npx ts-node scripts/roadmap.ts report

  sync                      Regenerate ROADMAP.md from current data
                            Example: npx ts-node scripts/roadmap.ts sync

  status                    Show quick status overview
                            Example: npx ts-node scripts/roadmap.ts status

Examples:
  # Mark Image Compressor as in progress
  npx ts-node scripts/roadmap.ts update "Image Compressor" in_progress

  # Add a new feature task
  npx ts-node scripts/roadmap.ts add "Email Notifications" --phase 4

  # Check current status
  npx ts-node scripts/roadmap.ts report
`);
  process.exit(0);
}

// Handle 'status' command separately for quick overview
if (args[0] === 'status') {
  const agent = new RoadmapAgent();
  const status = agent.getStatus();

  console.log(`
📊 PureTools Quick Status
═════════════════════════
🎯 ${status.currentPhase}
📈 Overall Progress: ${status.overallProgress}%

🔜 Next Tasks:
${status.nextTasks.map(t => `   • ${t.name}`).join('\n')}
`);
  process.exit(0);
}

// Run the main CLI
runCLI(args);
