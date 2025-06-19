import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyDigest } from '@/lib/digest-generator';
import { sendCustomSlackMessage } from '@/lib/slack';
import { sendEmail } from '@/lib/email';


export async function POST(request: NextRequest) {
  try {
    const { 
      activities, 
      sendSlack = false, 
      sendEmail: shouldSendEmail = false
    } = await request.json();
    
    console.log('Generating weekly digest...');
    console.log(`Processing ${activities?.length || 0} activities`);
    
    if (!activities || activities.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No activities provided for digest generation',
      });
    }
    
    const digest = await generateWeeklyDigest(activities);
    
    const results: any = {
      digest,
      notifications: {
        slack: null,
        email: null,
      }
    };
    
    // Send to Slack if requested
    if (sendSlack) {
      try {
        const slackResult = await sendCustomSlackMessage({
          text: `📊 Weekly YC Startup Digest - ${digest.weekOf}`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `📊 Weekly YC Startup Digest - ${digest.weekOf}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: digest.summary
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Total Activities:* ${digest.totalActivities}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Top Companies:* ${digest.topCompanies.join(', ')}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*🔥 Top Highlights:*'
              }
            },
            ...digest.highlights.slice(0, 5).map(activity => ({
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `• *${activity.companyName}*: ${activity.title}\n_${activity.summary}_\n<${activity.url}|View Source>`
              }
            }))
          ]
        });
        results.notifications.slack = slackResult;
      } catch (error) {
        console.error('Failed to send to Slack:', error);
        results.notifications.slack = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    // Send email if requested
    if (shouldSendEmail) {
      try {
        // Note: You'll need to specify the recipient email address
        const recipientEmail = process.env.DIGEST_EMAIL_RECIPIENT || 'admin@yourdomain.com';
        const emailResult = await sendEmail(
          recipientEmail,
          {
            subject: `📊 Weekly YC Startup Digest - ${digest.weekOf}`,
            body: `
              <h1>📊 Weekly YC Startup Digest</h1>
              <p><strong>Week of:</strong> ${digest.weekOf}</p>
              
              <h2>Summary</h2>
              <p>${digest.summary.replace(/\n/g, '<br>')}</p>
              
              <h2>Key Stats</h2>
              <ul>
                <li><strong>Total Activities:</strong> ${digest.totalActivities}</li>
                <li><strong>Top Companies:</strong> ${digest.topCompanies.join(', ')}</li>
              </ul>
              
              <h2>🔥 Top Highlights</h2>
              ${digest.highlights.slice(0, 10).map(activity => `
                <div style="border-left: 3px solid #007acc; padding-left: 15px; margin: 15px 0;">
                  <h3>${activity.companyName}</h3>
                  <h4>${activity.title}</h4>
                  <p>${activity.summary}</p>
                  <p><a href="${activity.url}" target="_blank">View Source</a> | ${activity.type.toUpperCase()}</p>
                </div>
              `).join('')}
            `
          }
        );
        results.notifications.email = emailResult;
      } catch (error) {
        console.error('Failed to send email:', error);
        results.notifications.email = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    

    
    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Error in generate-digest API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate weekly digest',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 