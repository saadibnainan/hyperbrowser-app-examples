import { CrawlResult, ApiEndpoint } from './crawl';

export interface FlowNode {
  id: string;
  type: 'page' | 'form' | 'api' | 'decision';
  label: string;
  url?: string;
  method?: string;
  payload?: any;
  response?: any;
  screenshot?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export class FlowGraph {
  nodes: FlowNode[] = [];
  edges: FlowEdge[] = [];
  mermaidSyntax: string = '';
  xstateConfig: any = {};

  addNode(node: FlowNode) {
    this.nodes.push(node);
  }

  addEdge(source: string, target: string, label?: string) {
    this.edges.push({
      id: `${source}-${target}`,
      source,
      target,
      label
    });
  }

  generateMermaidSyntax() {
    let mermaid = 'graph TD\n';
    
    // Add nodes
    this.nodes.forEach(node => {
      const shape = this.getMermaidShape(node.type);
      mermaid += `    ${node.id}${shape.start}"${node.label}"${shape.end}\n`;
    });

    mermaid += '\n';

    // Add edges
    this.edges.forEach(edge => {
      const arrow = edge.label ? `-- "${edge.label}" -->` : '-->';
      mermaid += `    ${edge.source} ${arrow} ${edge.target}\n`;
    });

    // Add styling
    mermaid += '\n';
    mermaid += '    classDef pageNode fill:#1a1a1a,stroke:#FFFD39,stroke-width:2px,color:#fff\n';
    mermaid += '    classDef formNode fill:#0f1419,stroke:#FFFD39,stroke-width:2px,color:#fff\n';
    mermaid += '    classDef apiNode fill:#0a0f16,stroke:#FFFD39,stroke-width:2px,color:#fff\n';
    mermaid += '    classDef decisionNode fill:#16161a,stroke:#FFFD39,stroke-width:2px,color:#fff\n';

    this.mermaidSyntax = mermaid;
    return mermaid;
  }

  private getMermaidShape(nodeType: string): { start: string; end: string } {
    switch (nodeType) {
      case 'page':
        return { start: '((', end: '))' };
      case 'form':
        return { start: '[', end: ']' };
      case 'api':
        return { start: '{', end: '}' };
      case 'decision':
        return { start: '{', end: '}' };
      default:
        return { start: '[', end: ']' };
    }
  }
}

export class GraphBuilder {
  private nodeCounter = 0;

  buildGraph(crawlResult: any): FlowGraph {
    const graph = new FlowGraph();
    
    // Process pages
    if (crawlResult.dom) {
      crawlResult.dom.forEach((domContent: string, index: number) => {
        const pageNode: FlowNode = {
          id: this.generateNodeId('page'),
          type: 'page',
          label: `Page ${index + 1}`,
          screenshot: crawlResult.screenshots?.[index]
        };
        graph.addNode(pageNode);
      });
    }
    
    // Process API endpoints
    if (crawlResult.endpoints) {
      crawlResult.endpoints.forEach((endpoint: any) => {
        const apiNode: FlowNode = {
          id: this.generateNodeId('api'),
          type: 'api',
          label: `${endpoint.method} ${this.extractPathFromUrl(endpoint.url)}`,
          url: endpoint.url,
          method: endpoint.method,
          payload: endpoint.payload,
          response: endpoint.response
        };
        graph.addNode(apiNode);
      });
    }

    // Generate graph syntax
    graph.generateMermaidSyntax();
    
    return graph;
  }

  private generateNodeId(type: string): string {
    return `${type}_${++this.nodeCounter}`;
  }

  private extractPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }
} 