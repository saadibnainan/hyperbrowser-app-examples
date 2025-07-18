import { Hyperbrowser } from '@hyperbrowser/sdk';
import { OpenAI } from 'openai';
import { config } from 'dotenv';

config();
const chalk = require('chalk');
const yargs = require('yargs');
import { hideBin } from 'yargs/helpers';
const Table = require('cli-table3');
import * as readline from 'readline';

interface ChurnAnalysis {
  score: number;
  frictions: Array<{
    point: string;
    hint: string;
  }>;
}

interface StepEvent {
  timestamp: string;
  action: string;
  selector?: string;
  text?: string;
  url?: string;
  error?: string;
  screenshot?: string;
  [key: string]: any;
}

class ChurnHunter {
  private hbClient: Hyperbrowser;
  private openai: OpenAI;
  private events: StepEvent[] = [];

  constructor() {
    const hyperApiKey = process.env.HYPERBROWSER_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!hyperApiKey) {
      console.error(chalk.red('❌ HYPERBROWSER_API_KEY environment variable is required'));
      process.exit(2);
    }

    if (!openaiApiKey) {
      console.error(chalk.red('❌ OPENAI_API_KEY environment variable is required'));
      process.exit(2);
    }

    this.hbClient = new Hyperbrowser({ apiKey: hyperApiKey });
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  private async promptForUrl(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve, reject) => {
      rl.question(chalk.cyan('🌐 Enter the URL to analyze: '), (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      
      rl.on('error', (error) => {
        rl.close();
        reject(error);
      });
    });
  }

  private async performSignupCrawl(url: string): Promise<void> {
    if (!process.argv.includes('--json')) {
      console.log(chalk.blue('🚀 Starting HyperAgent session...'));
    }

    const task = `Navigate to ${url} and complete a typical user signup or demo flow. 
    Take actions like a new user would: look for signup buttons, fill forms, 
    navigate through onboarding steps, and explore key features. 
    Pay attention to any friction points, confusing UI elements, 
    slow loading times, or steps that might cause user drop-off.`;

    try {
      const result = await this.hbClient.agents.hyperAgent.startAndWait({
        task: task,
        maxSteps: 20,
        sessionOptions: {
          acceptCookies: true,
        }
      });

             // Convert the result to our events format for analysis
       this.events = [{
         timestamp: new Date().toISOString(),
         action: 'task_completed',
         url: url,
         result: result.data?.finalResult || 'Task completed'
       }];

       if (!process.argv.includes('--json')) {
         console.log(chalk.green(`✅ Task completed successfully`));
       }

    } catch (error) {
      console.error(chalk.red('❌ Error during HyperAgent execution:'), error);
      
      // Add error event for analysis
      this.events = [{
        timestamp: new Date().toISOString(),
        action: 'task_error',
        url: url,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }];
    }
  }

  private truncateEventsForGPT(events: StepEvent[]): string {
    const eventsJson = JSON.stringify(events, null, 2);
    const maxLength = 15000; // Keep under 16k chars for GPT

    if (eventsJson.length <= maxLength) {
      return eventsJson;
    }

    // Truncate from the middle, keep first and last events
    const firstEvents = events.slice(0, Math.floor(events.length * 0.3));
    const lastEvents = events.slice(-Math.floor(events.length * 0.3));
    const truncatedEvents = [...firstEvents, 
      { timestamp: new Date().toISOString(), action: '[events_truncated]', note: 'Middle events removed to fit GPT context' }, 
      ...lastEvents
    ];

    return JSON.stringify(truncatedEvents, null, 2);
  }

  private async analyzeWithGPT(events: StepEvent[]): Promise<ChurnAnalysis> {
    if (!process.argv.includes('--json')) {
      console.log(chalk.blue('🧠 Analyzing with GPT-4o...'));
    }

    const eventsJson = this.truncateEventsForGPT(events);

    const prompt = `You are a UX expert analyzing a user's signup/demo flow for churn risk. 

Based on the following browser automation events, provide a churn risk analysis:

${eventsJson}

Analyze the flow for:
- Friction points (slow loading, confusing UI, complex forms)
- User experience issues (too many steps, unclear navigation)
- Technical problems (errors, timeouts, broken features)
- Onboarding quality (guidance, value demonstration)

Respond with JSON in this exact format:
{
  "score": <0-100 integer, where 100 = highest churn risk>,
  "frictions": [
    {
      "point": "Brief description of friction point",
      "hint": "Actionable suggestion to fix it"
    }
  ]
}

Score guidelines:
- 0-30: Excellent UX, low churn risk
- 31-50: Good UX with minor issues
- 51-70: Moderate issues, some churn risk
- 71-100: High churn risk, significant problems`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content) as ChurnAnalysis;
    } catch (error) {
      console.error(chalk.red('❌ Error analyzing with GPT:'), error);
      throw error;
    }
  }

  private printColoredReport(analysis: ChurnAnalysis, url: string): void {
    console.log('\n' + chalk.bold.blue('🎯 ChurnHunter Analysis Report'));
    console.log(chalk.gray('═'.repeat(50)));
    
    console.log(`${chalk.bold('URL:')} ${chalk.underline(url)}`);
    
    // Score with color coding
    const scoreColor = analysis.score >= 70 ? 'red' : 
                      analysis.score >= 50 ? 'yellow' : 'green';
    console.log(`${chalk.bold('Churn Risk Score:')} ${chalk[scoreColor](analysis.score)}/100`);
    
    // Risk level
    const riskLevel = analysis.score >= 70 ? 'HIGH' : 
                     analysis.score >= 50 ? 'MODERATE' : 'LOW';
    const riskColor = analysis.score >= 70 ? 'red' : 
                     analysis.score >= 50 ? 'yellow' : 'green';
    console.log(`${chalk.bold('Risk Level:')} ${chalk[riskColor](riskLevel)}\n`);

    // Frictions table
    if (analysis.frictions.length > 0) {
      console.log(chalk.bold.yellow('⚠️  Friction Points:'));
      
      const table = new Table({
        head: [chalk.bold('Issue'), chalk.bold('Recommendation')],
        colWidths: [40, 60],
        wordWrap: true,
        style: {
          head: ['cyan'],
          border: ['gray']
        }
      });

      analysis.frictions.forEach(friction => {
        table.push([friction.point, friction.hint]);
      });

      console.log(table.toString());
    } else {
      console.log(chalk.green('✅ No significant friction points detected!'));
    }

    console.log(`\n${chalk.gray('Events captured:')} ${this.events.length}`);
    console.log(chalk.gray('═'.repeat(50)));
  }

  public async run(): Promise<void> {
    try {
      const argv = await yargs(hideBin(process.argv))
        .option('url', {
          alias: 'u',
          type: 'string',
          description: 'Target URL to analyze',
        })
        .option('json', {
          alias: 'j',
          type: 'boolean',
          description: 'Output results as JSON',
          default: false,
        })
        .help()
        .alias('help', 'h')
        .parse();

      let url = argv.url;
      if (!url) {
        url = await this.promptForUrl();
      }

      if (!url) {
        console.error(chalk.red('❌ URL is required'));
        process.exit(2);
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        console.error(chalk.red('❌ Invalid URL provided'));
        process.exit(2);
      }

      if (!argv.json) {
        console.log(chalk.bold.green('🎯 ChurnHunter - Signup Flow Analyzer'));
        console.log(chalk.gray(`Analyzing: ${url}\n`));
      }

      // Perform the crawl
      await this.performSignupCrawl(url);

      if (this.events.length === 0) {
        console.error(chalk.red('❌ No events captured during crawl'));
        process.exit(2);
      }

      // Analyze with GPT
      const analysis = await this.analyzeWithGPT(this.events);

      // Output results
      if (argv.json) {
        console.log(JSON.stringify({
          url,
          events_count: this.events.length,
          analysis
        }, null, 2));
      } else {
        this.printColoredReport(analysis, url);
        
        // Final message
        if (analysis.score >= 70) {
          console.log(chalk.red('\n⚠️  HIGH CHURN RISK DETECTED! Immediate action recommended.'));
        } else if (analysis.score >= 50) {
          console.log(chalk.yellow('\n💡 Moderate friction detected. Consider optimizing the user flow.'));
        } else {
          console.log(chalk.green('\n✨ Great user experience! Low churn risk.'));
        }
      }

      // Exit with appropriate code
      process.exit(analysis.score >= 70 ? 1 : 0);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(2);
    }
  }
}

// Main execution
if (require.main === module) {
  const churnHunter = new ChurnHunter();
  churnHunter.run().catch(error => {
    console.error(chalk.red('❌ Fatal error:'), error);
    process.exit(2);
  });
} 