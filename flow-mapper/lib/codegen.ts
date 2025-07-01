import { FlowGraph, FlowNode } from './graph';
import { ApiEndpoint } from './crawl';
import * as ejs from 'ejs';

export interface CodegenResult {
  playwrightCode: string;
  reactCode: string;
  postmanCollection: any;
}

const PLAYWRIGHT_TEMPLATE = `import { test, expect, Page } from '@playwright/test';

/**
 * Generated Playwright test from FlowMapper
 * Website: <%= baseUrl %>
 * Generated: <%= timestamp %>
 */

test.describe('User Flow Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

<% nodes.forEach((node, index) => { %>
  <% if (node.type === 'page') { %>
  test('Navigate to <%= node.label %>', async () => {
    // Navigate to <%= node.url || 'page' %>
    await page.goto('<%= node.url || baseUrl %>');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'screenshots/<%= node.id %>-<%= index %>.png',
      fullPage: true 
    });
    
    // Verify page loaded correctly
    await expect(page).toHaveTitle(/<%= node.label.replace(/[^a-zA-Z0-9\s]/g, '') %>/i);
  });
  <% } %>

  <% if (node.type === 'form') { %>
  test('Fill and submit <%= node.label %>', async () => {
    <% if (node.payload && Array.isArray(node.payload)) { %>
    <% node.payload.forEach(field => { %>
    // Fill <%= field %> field
    await page.fill('[name="<%= field %>"]', 'test-value');
    <% }); %>
    <% } %>
    
    // Submit form
    await page.click('button[type="submit"], input[type="submit"]');
    
    // Wait for response
    await page.waitForLoadState('networkidle');
    
    // Take screenshot after form submission
    await page.screenshot({ 
      path: 'screenshots/<%= node.id %>-submitted.png',
      fullPage: true 
    });
  });
  <% } %>

  <% if (node.type === 'api') { %>
  test('Verify API call: <%= node.method %> <%= node.url %>', async () => {
    // Set up network interception
    const apiResponse = page.waitForResponse(response => 
      response.url().includes('<%= node.url %>') && 
      response.request().method() === '<%= node.method %>'
    );
    
    <% if (node.method === 'POST' || node.method === 'PUT') { %>
    // Trigger the API call (usually through form submission or button click)
    await page.click('button[data-testid="submit"], .submit-btn');
    <% } else { %>
    // Trigger the API call (usually through navigation or page load)
    await page.reload();
    <% } %>
    
    // Wait for and verify API response
    const response = await apiResponse;
    expect(response.status()).toBe(200);
    
    <% if (node.response) { %>
    // Verify response content
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
    <% } %>
  });
  <% } %>
<% }); %>

  test('Complete user flow', async () => {
    <% nodes.filter(n => n.type === 'page').forEach((node, index) => { %>
    // Step <%= index + 1 %>: <%= node.label %>
    await page.goto('<%= node.url || baseUrl %>');
    await page.waitForLoadState('networkidle');
    
    <% if (index < nodes.filter(n => n.type === 'page').length - 1) { %>
    // Continue to next step
    await page.waitForTimeout(1000);
    <% } %>
    <% }); %>
    
    // Final verification
    await page.screenshot({ 
      path: 'screenshots/complete-flow.png',
      fullPage: true 
    });
  });
});`;

const REACT_XSTATE_TEMPLATE = `import React from 'react';
import { createMachine, interpret } from 'xstate';
import { useMachine } from '@xstate/react';

/**
 * Generated XState React component from FlowMapper
 * Generated: <%= timestamp %>
 */

// XState Machine Definition
const userFlowMachine = createMachine({
  id: 'userFlow',
  initial: '<%= initialState %>',
  context: {
    userData: {},
    apiResponses: {},
    currentUrl: '',
  },
  states: {
    <% Object.entries(states).forEach(([stateName, state]) => { %>
    <%= stateName %>: {
      meta: {
        label: '<%= state.label %>',
        <% if (state.url) { %>url: '<%= state.url %>',<% } %>
        <% if (state.screenshot) { %>screenshot: '<%= state.screenshot %>',<% } %>
      },
      entry: ['log<%= stateName.charAt(0).toUpperCase() + stateName.slice(1) %>Entry'],
      on: {
        <% Object.entries(state.transitions || {}).forEach(([event, target]) => { %>
        <%= event %>: {
          target: '<%= typeof target === 'string' ? target : target.target %>',
          <% if (typeof target === 'object' && target.actions) { %>
          actions: ['<%= target.actions.join("', '") %>'],
          <% } %>
        },
        <% }); %>
      },
    },
    <% }); %>
  },
}, {
  actions: {
    <% Object.entries(states).forEach(([stateName, state]) => { %>
    log<%= stateName.charAt(0).toUpperCase() + stateName.slice(1) %>Entry: (context, event) => {
      console.log('Entered <%= stateName %>', { context, event });
    },
    <% }); %>
  },
});

// React Component
export const UserFlowComponent: React.FC = () => {
  const [state, send] = useMachine(userFlowMachine);

  const currentStateConfig = state.meta?.['userFlow.<%= initialState %>'] || {};

  return (
    <div className="user-flow-container">
      <div className="state-indicator">
        <h2>Current State: {state.value}</h2>
        <p>Label: {currentStateConfig.label}</p>
        {currentStateConfig.url && (
          <p>URL: <a href={currentStateConfig.url} target="_blank" rel="noopener noreferrer">
            {currentStateConfig.url}
          </a></p>
        )}
      </div>

      <div className="controls">
        <h3>Available Actions:</h3>
        {Object.keys(state.nextEvents || {}).map(event => (
          <button
            key={event}
            onClick={() => send(event)}
            className="action-button"
          >
            {event.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {currentStateConfig.screenshot && (
        <div className="screenshot-preview">
          <h4>Page Screenshot:</h4>
          <img 
            src={currentStateConfig.screenshot} 
            alt="Page screenshot"
            style={{ maxWidth: '100%', border: '1px solid #ccc' }}
          />
        </div>
      )}

      <div className="state-data">
        <h4>State Context:</h4>
        <pre>{JSON.stringify(state.context, null, 2)}</pre>
      </div>

      <style jsx>{\`
        .user-flow-container {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .state-indicator {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .controls {
          margin-bottom: 20px;
        }
        
        .action-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          margin: 4px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .action-button:hover {
          background: #0056b3;
        }
        
        .screenshot-preview {
          margin-bottom: 20px;
        }
        
        .state-data {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }
        
        pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
        }
      \`}</style>
    </div>
  );
};

export default UserFlowComponent;`;

export class CodeGenerator {
  generateCode(graph: FlowGraph, endpoints: ApiEndpoint[], baseUrl: string): CodegenResult {
    const playwrightCode = this.generatePlaywrightCode(graph, baseUrl);
    const reactCode = this.generateReactCode(graph);
    const postmanCollection = this.generatePostmanCollection(endpoints, baseUrl);

    return {
      playwrightCode,
      reactCode,
      postmanCollection,
    };
  }

  private generatePlaywrightCode(graph: FlowGraph, baseUrl: string): string {
    const templateData = {
      nodes: graph.nodes,
      edges: graph.edges,
      baseUrl,
      timestamp: new Date().toISOString(),
    };

    return ejs.render(PLAYWRIGHT_TEMPLATE, templateData);
  }

  private generateReactCode(graph: FlowGraph): string {
    const states: Record<string, any> = {};
    const pageNodes = graph.nodes.filter(n => n.type === 'page');
    
    // Convert graph nodes to XState states
    graph.nodes.forEach(node => {
      const stateName = node.id;
      const outgoingEdges = graph.edges.filter(e => e.source === node.id);
      const transitions: Record<string, any> = {};

      outgoingEdges.forEach(edge => {
        const eventName = this.sanitizeEventName(edge.label || 'NEXT');
        transitions[eventName] = edge.target;
      });

      states[stateName] = {
        label: node.label,
        url: node.url,
        screenshot: node.screenshot,
        transitions,
      };
    });

    // Add a default state if no nodes exist
    if (Object.keys(states).length === 0) {
      states['initial'] = {
        label: 'No pages found',
        url: '',
        screenshot: '',
        transitions: {},
      };
    }

    const templateData = {
      states,
      initialState: pageNodes[0]?.id || 'initial',
      timestamp: new Date().toISOString(),
    };

    return ejs.render(REACT_XSTATE_TEMPLATE, templateData);
  }

  private generatePostmanCollection(endpoints: ApiEndpoint[], baseUrl: string): any {
    const collection = {
      info: {
        name: 'FlowMapper Generated API Collection',
        description: 'Generated from FlowMapper crawl',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: endpoints.map((endpoint, index) => ({
        name: `${endpoint.method} ${this.extractPathFromUrl(endpoint.url)}`,
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'pm.test("Status code is success", function () {',
                '    pm.response.to.have.status(200) || pm.response.to.have.status(201) || pm.response.to.have.status(204);',
                '});',
                '',
                'pm.test("Response time is less than 2000ms", function () {',
                '    pm.expect(pm.response.responseTime).to.be.below(2000);',
                '});',
              ],
            },
          },
        ],
        request: {
          method: endpoint.method,
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Accept', value: 'application/json' }
          ],
          body: {
            mode: 'raw',
            raw: endpoint.payload ? JSON.stringify(endpoint.payload, null, 2) : ''
          },
          url: {
            raw: endpoint.url,
            protocol: this.extractProtocol(endpoint.url),
            host: this.extractHost(endpoint.url).split('.'),
            path: this.extractPath(endpoint.url).split('/').filter(Boolean)
          }
        },
        response: endpoint.response ? [{
          name: 'Default',
          originalRequest: {
            method: endpoint.method,
            url: endpoint.url
          },
          status: 'OK',
          code: 200,
          _postman_previewlanguage: 'json',
          header: [
            { key: 'Content-Type', value: 'application/json' }
          ],
          body: JSON.stringify(endpoint.response, null, 2)
        }] : []
      })),
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl,
          type: 'string',
        },
      ],
    };

    return collection;
  }

  private extractPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  }

  private sanitizeEventName(label: string): string {
    return label
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private extractProtocol(url: string): string {
    const urlObj = new URL(url);
    return urlObj.protocol.replace(':', '');
  }

  private extractHost(url: string): string {
    const urlObj = new URL(url);
    return urlObj.hostname;
  }

  private extractPath(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  }
} 