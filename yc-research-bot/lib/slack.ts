import axios from 'axios';
import { CompanyWithSummary, SlackMessage } from '@/types/company';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;

export async function sendToSlack(company: CompanyWithSummary): Promise<boolean> {
  try {
    if (!SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL not configured');
    }

    const message: SlackMessage = {
      text: `New YC Company Research: ${company.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚀 ${company.name} (${company.batch})`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:* ${company.description}`,
          },
        },
        ...(company.aiSummary ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*AI Summary:* ${company.aiSummary}`,
          },
        }] : []),
        ...(company.website ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Website:* <${company.website}|${company.website}>`,
          },
        }] : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `YC Batch: ${company.batch} | Added: ${new Date().toLocaleDateString()}`,
            },
          ],
        },
      ],
    };

    await axios.post(SLACK_WEBHOOK_URL, message);
    return true;
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return false;
  }
}

// New function for sending custom Slack messages (like digests)
export async function sendCustomSlackMessage(message: SlackMessage): Promise<boolean> {
  try {
    if (!SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL not configured');
    }

    await axios.post(SLACK_WEBHOOK_URL, message);
    return true;
  } catch (error) {
    console.error('Error sending message to Slack:', error);
    return false;
  }
}

export async function sendBatchSummaryToSlack(companies: CompanyWithSummary[], batch: string): Promise<boolean> {
  try {
    if (!SLACK_WEBHOOK_URL) {
      throw new Error('SLACK_WEBHOOK_URL not configured');
    }

    const message: SlackMessage = {
      text: `YC ${batch} Batch Research Summary - ${companies.length} companies analyzed`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 YC ${batch} Research Summary`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Found and analyzed *${companies.length} companies* from batch ${batch}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: companies.slice(0, 5).map(c => `• *${c.name}* - ${c.description.slice(0, 80)}...`).join('\n'),
          },
        },
        ...(companies.length > 5 ? [{
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `... and ${companies.length - 5} more companies`,
            },
          ],
        }] : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Generated: ${new Date().toLocaleString()}`,
            },
          ],
        },
      ],
    };

    await axios.post(SLACK_WEBHOOK_URL, message);
    return true;
  } catch (error) {
    console.error('Error sending batch summary to Slack:', error);
    return false;
  }
} 