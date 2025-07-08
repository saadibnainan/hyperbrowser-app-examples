import { SelectorConfig } from './selectors';

export interface CodegenOptions {
  slug: string;
  url: string;
  title: string;
  selectors: SelectorConfig[];
  baseUrl: string;
  sampleData: any;
}

export interface CodegenResult {
  openapi: string;
  sdk: string;
  postman: string;
}

export function generateOpenAPISpec(options: CodegenOptions): string {
  const { slug, url, title, selectors, baseUrl, sampleData } = options;
  
  // Generate schema from selectors and sample data
  const properties: any = {};
  const requiredFields: string[] = [];
  
  selectors.forEach(selector => {
    const sampleValue = sampleData[selector.name];
    let type = 'string';
    let format: string | undefined;
    
    if (selector.multiple) {
      properties[selector.name] = {
        type: 'array',
        items: { type: 'string' },
        description: `Data extracted from: ${selector.selector}`
      };
    } else {
      // Infer type from sample data
      if (sampleValue !== null && sampleValue !== undefined) {
        if (typeof sampleValue === 'number') {
          type = 'number';
        } else if (typeof sampleValue === 'boolean') {
          type = 'boolean';
        } else if (selector.attribute === 'href' || selector.attribute === 'src') {
          type = 'string';
          format = 'uri';
        }
      }
      
      properties[selector.name] = {
        type,
        ...(format && { format }),
        description: `Data extracted from: ${selector.selector}`,
        example: sampleValue
      };
    }
    
    if (sampleValue !== null && sampleValue !== undefined) {
      requiredFields.push(selector.name);
    }
  });
  
  const spec = {
    openapi: '3.0.0',
    info: {
      title: `${title} API`,
      version: '1.0.0',
      description: `Auto-generated API for scraping data from ${url}`,
      contact: {
        name: 'Scrape2API',
        url: 'https://github.com/hyperbrowser/scrape2api'
      }
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production server'
      }
    ],
    paths: {
      [`/api/data/${slug}`]: {
        get: {
          summary: `Get data from ${title}`,
          description: `Retrieve scraped data from ${url}`,
          operationId: `getData${slug.replace(/[^a-zA-Z0-9]/g, '')}`,
          tags: ['Data'],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties,
                        required: requiredFields
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          url: { type: 'string', format: 'uri' },
                          lastUpdated: { type: 'string', format: 'date-time' },
                          slug: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Data not found'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  };
  
  return JSON.stringify(spec, null, 2);
}

export function generateTypeScriptSDK(options: CodegenOptions): string {
  const { slug, url, title, selectors, baseUrl, sampleData } = options;
  
  // Generate TypeScript interface
  const interfaceFields = selectors.map(selector => {
    const sampleValue = sampleData[selector.name];
    let type = 'string';
    
    if (selector.multiple) {
      type = 'string[]';
    } else if (sampleValue !== null && sampleValue !== undefined) {
      if (typeof sampleValue === 'number') {
        type = 'number';
      } else if (typeof sampleValue === 'boolean') {
        type = 'boolean';
      }
    }
    
    const optional = sampleValue === null || sampleValue === undefined ? '?' : '';
    return `  ${selector.name}${optional}: ${type};`;
  }).join('\n');
  
  const className = `${slug.replace(/[^a-zA-Z0-9]/g, '')}Client`;
  
  return `// Auto-generated TypeScript SDK for ${title}
// Source: ${url}
// Generated: ${new Date().toISOString()}

export interface ${className}Data {
${interfaceFields}
}

export interface ${className}Response {
  data: ${className}Data;
  meta: {
    url: string;
    lastUpdated: string;
    slug: string;
  };
}

export class ${className} {
  private baseUrl: string;
  
  constructor(baseUrl: string = '${baseUrl}') {
    this.baseUrl = baseUrl.replace(/\\/$/, '');
  }
  
  async getData(): Promise<${className}Response> {
    const response = await fetch(\`\${this.baseUrl}/api/data/${slug}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    return response.json();
  }
}

// Usage example:
// const client = new ${className}();
// const data = await client.getData();
// console.log(data.data.${selectors[0]?.name || 'field'});
`;
}

export function generatePostmanCollection(options: CodegenOptions): string {
  const { slug, url, title, baseUrl } = options;
  
  const collection = {
    info: {
      name: `${title} API`,
      description: `Auto-generated Postman collection for scraping ${url}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [
      {
        name: 'Get Data',
        request: {
          method: 'GET',
          header: [
            {
              key: 'Accept',
              value: 'application/json'
            }
          ],
          url: {
            raw: `${baseUrl}/api/data/${slug}`,
            host: [baseUrl.replace(/^https?:\/\//, '').split('/')[0]],
            path: ['api', 'data', slug]
          },
          description: `Retrieve scraped data from ${url}`
        },
        response: []
      }
    ],
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
        type: 'string'
      }
    ]
  };
  
  return JSON.stringify(collection, null, 2);
}

export function generateCodeFiles(options: CodegenOptions): CodegenResult {
  return {
    openapi: generateOpenAPISpec(options),
    sdk: generateTypeScriptSDK(options),
    postman: generatePostmanCollection(options)
  };
} 