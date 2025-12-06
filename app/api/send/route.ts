import { AssistantUIWelcomeEmail } from '@/emails/assistant-ui';
import * as React from 'react';

export const maxDuration = 30;
export const runtime = 'nodejs';

// Check if we should use Resend or the email worker
const useResend = () => {
  return !!process.env.RESEND_API_KEY;
};

const getResendClient = async () => {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
};

const getEmailWorkerUrl = () => {
  // Use custom worker URL or default shared proxy
  return process.env.EMAIL_WORKER_URL || "https://mail.tsai.assistant-ui.com";
};

export async function POST(req: Request) {
  try {
    const { to, subject, userName } = await req.json();

    // Define email props once to avoid duplication
    const emailProps = {
      userName: userName || 'there',
      steps: [
        {
          id: 1,
          Description: React.createElement('li', { className: "mb-20 text-gray-700", key: 1 },
            React.createElement('strong', null, 'Install assistant-ui.'),
            ' Get started in seconds with ',
            React.createElement('a', {
              href: "https://assistant-ui.com/docs/getting-started",
              className: "text-brand"
            }, 'npm install assistant-ui'),
            ' and create your first chat interface.'
          ),
        },
        {
          id: 2,
          Description: React.createElement('li', { className: "mb-20 text-gray-700", key: 2 },
            React.createElement('strong', null, 'Explore our components.'),
            ' From simple chat bubbles to complex tool UIs, ',
            React.createElement('a', {
              href: "https://assistant-ui.com/docs/components",
              className: "text-brand"
            }, 'browse our component library'),
            ' and see live examples.'
          ),
        },
      ],
      resources: [
        {
          title: 'Documentation',
          description: 'Complete guides and API reference',
          href: 'https://assistant-ui.com/docs',
          icon: '📖',
        },
        {
          title: 'Interactive Examples',
          description: 'Live demos with source code',
          href: 'https://assistant-ui.com/examples',
          icon: '🎨',
        },
      ],
    };

    // Use Resend if API key is provided, otherwise use worker
    if (useResend()) {
      const resend = await getResendClient();
      const { data, error } = await resend.emails.send({
        from: 'Assistant UI <onboarding@resend.dev>',
        to: [to],
        subject: subject || 'Welcome to Assistant UI',
        react: React.createElement(AssistantUIWelcomeEmail, emailProps),
      });

      if (error) {
        return Response.json({ error }, { status: 500 });
      }

      return Response.json(data);
    } else {
      // For email worker, we'll send a simple text version since we can't render React components to HTML here
      const workerUrl = getEmailWorkerUrl();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Assistant UI</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0ea5e9;">Welcome to assistant-ui</h1>
          <p>Hi ${emailProps.userName}!</p>
          <p>Thanks for choosing <strong>assistant-ui</strong>. You're now equipped with the most flexible React framework for building production-ready AI chat interfaces.</p>
          
          <h2>Here's how to get started:</h2>
          <ol>
            <li style="margin-bottom: 10px;">
              <strong>Install assistant-ui.</strong> Get started in seconds with 
              <a href="https://assistant-ui.com/docs/getting-started" style="color: #0ea5e9;">npm install assistant-ui</a>
              and create your first chat interface.
            </li>
            <li style="margin-bottom: 10px;">
              <strong>Explore our components.</strong> From simple chat bubbles to complex tool UIs, 
              <a href="https://assistant-ui.com/docs/components" style="color: #0ea5e9;">browse our component library</a>
              and see live examples.
            </li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://assistant-ui.com/docs/getting-started" 
               style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started →
            </a>
          </div>
          
          <p style="color: #64748b; text-align: center; margin-top: 40px; font-size: 14px;">
            Made with ❤️ by the assistant-ui team
          </p>
        </body>
        </html>
      `;

      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject: subject || 'Welcome to Assistant UI',
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return Response.json({ error }, { status: 500 });
      }

      const data = await response.json();
      return Response.json(data);
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}