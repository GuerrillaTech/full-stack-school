import { PrismaClient } from '@prisma/client';
import * as d3 from 'd3';
import { OpenAI } from 'openai';

export interface PartnershipVisualizationConfig {
  type: 'NETWORK' | 'SANKEY' | 'HEATMAP' | 'TIMELINE' | 'RADAR';
  dimensions: string[];
  metrics: string[];
}

export class PartnershipVisualizationService {
  private prisma: PrismaClient;
  private openai: OpenAI;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });
  }

  // Network Graph of Collaborations
  async generatePartnershipNetworkGraph(
    organizationId: string, 
    config: PartnershipVisualizationConfig
  ) {
    const collaborations = await this.prisma.collaboration.findMany({
      where: {
        partners: {
          some: { id: organizationId }
        }
      },
      include: {
        partners: true,
        projects: true
      }
    });

    // Transform collaboration data into network graph format
    const nodes = new Set();
    const links = [];

    collaborations.forEach(collab => {
      collab.partners.forEach(partner => {
        nodes.add(partner.id);
      });

      // Create links between partners
      for (let i = 0; i < collab.partners.length; i++) {
        for (let j = i + 1; j < collab.partners.length; j++) {
          links.push({
            source: collab.partners[i].id,
            target: collab.partners[j].id,
            strength: collab.projects.length
          });
        }
      }
    });

    return {
      nodes: Array.from(nodes),
      links: links
    };
  }

  // Sankey Diagram for Knowledge Transfer
  async generateKnowledgeTransferSankeyDiagram(
    organizationId: string
  ) {
    const collaborationProjects = await this.prisma.collaborationProject.findMany({
      where: {
        collaboration: {
          partners: {
            some: { id: organizationId }
          }
        }
      },
      include: {
        collaboration: {
          include: { partners: true }
        },
        researchOutputs: true,
        publications: true
      }
    });

    // Transform data for Sankey diagram
    const sankeyData = {
      nodes: [],
      links: []
    };

    collaborationProjects.forEach(project => {
      project.collaboration.partners.forEach(partner => {
        sankeyData.nodes.push(partner.name);
      });

      // Create knowledge transfer links
      project.researchOutputs.forEach(output => {
        sankeyData.links.push({
          source: project.collaboration.partners[0].name,
          target: project.collaboration.partners[1].name,
          value: output.citations || 1
        });
      });
    });

    return sankeyData;
  }

  // Collaboration Performance Heatmap
  async generateCollaborationPerformanceHeatmap(
    organizationId: string
  ) {
    const collaborations = await this.prisma.collaboration.findMany({
      where: {
        partners: {
          some: { id: organizationId }
        }
      },
      include: {
        partners: true,
        projects: true,
        outcomes: true
      }
    });

    // Create performance heatmap matrix
    const heatmapData = collaborations.map(collab => ({
      collaborationName: collab.name,
      partners: collab.partners.map(p => p.name),
      performanceScore: collab.performanceScore,
      projectCount: collab.projects.length,
      outcomeImpact: collab.outcomes.reduce(
        (sum, outcome) => sum + outcome.quantitativeImpact, 
        0
      )
    }));

    return heatmapData;
  }

  // Collaboration Timeline Visualization
  async generateCollaborationTimeline(
    organizationId: string
  ) {
    const collaborations = await this.prisma.collaboration.findMany({
      where: {
        partners: {
          some: { id: organizationId }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    // Transform collaborations into timeline events
    const timelineEvents = collaborations.map(collab => ({
      id: collab.id,
      title: collab.name,
      startDate: collab.startDate,
      endDate: collab.actualEndDate || collab.expectedEndDate,
      status: collab.status,
      partners: collab.partners.map(p => p.name)
    }));

    return timelineEvents;
  }

  // Radar Chart for Multi-Dimensional Partnership Assessment
  async generatePartnershipRadarChart(
    organizationId: string
  ) {
    const partners = await this.prisma.partner.findMany({
      where: {
        collaborations: {
          some: {
            partners: {
              some: { id: organizationId }
            }
          }
        }
      }
    });

    // Compute multi-dimensional partner scores
    const radarData = partners.map(partner => ({
      partnerName: partner.name,
      dimensions: {
        innovationScore: partner.innovationScore,
        researchImpactScore: partner.researchImpactScore,
        collaborationFrequency: partner.collaborations.length,
        domainExpertise: this.computeDomainExpertiseScore(partner)
      }
    }));

    return radarData;
  }

  // AI-Enhanced Visualization Insights
  async generateVisualizationInsights(
    visualizationType: string,
    data: any
  ) {
    const insightsPrompt = `
      Analyze ${visualizationType} visualization data:
      
      Data Overview:
      ${JSON.stringify(data, null, 2)}
      
      Generate:
      - Key observations
      - Unexpected patterns
      - Strategic recommendations
      - Potential areas of improvement
    `;

    const aiInsights = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert data visualization and partnership analytics analyst.'
        },
        {
          role: 'user',
          content: insightsPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    return JSON.parse(
      aiInsights.choices[0].message.content || '{}'
    );
  }

  // Helper method to compute domain expertise score
  private computeDomainExpertiseScore(partner: any): number {
    // Implement complex domain expertise calculation
    const projectDiversity = new Set(
      partner.collaborations.map((c: any) => c.type)
    ).size;
    
    const publicationImpact = partner.publications?.reduce(
      (sum: number, pub: any) => sum + (pub.impactFactor || 0), 
      0
    ) || 0;

    return (projectDiversity * 0.5) + (publicationImpact * 0.5);
  }
}
