import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { z } from 'zod';
import { OpenAI } from 'openai';

// Credential Types
export enum CredentialType {
  DEGREE = 'DEGREE',
  CERTIFICATE = 'CERTIFICATE',
  PROFESSIONAL_CERTIFICATION = 'PROFESSIONAL_CERTIFICATION',
  ACADEMIC_ACHIEVEMENT = 'ACADEMIC_ACHIEVEMENT'
}

// Verification Status
export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  REVOKED = 'REVOKED'
}

// Blockchain Network Configuration
const BLOCKCHAIN_NETWORKS = {
  ETHEREUM_MAINNET: 'https://mainnet.infura.io/v3/',
  POLYGON: 'https://polygon-rpc.com',
  OPTIMISM: 'https://mainnet.optimism.io',
  ACADEMIC_CREDENTIAL_NETWORK: 'custom-academic-credential-network'
};

// Credential Schema
const CredentialSchema = z.object({
  holderDid: z.string(), // Decentralized Identifier
  institutionDid: z.string(),
  credentialType: z.nativeEnum(CredentialType),
  title: z.string(),
  issuedDate: z.date(),
  expirationDate: z.date().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING)
});

export class BlockchainCredentialVerificationService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private blockchainProvider: ethers.providers.JsonRpcProvider;
  private credentialVerificationContract: ethers.Contract;

  constructor() {
    this.prisma = new PrismaClient();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    });

    // Initialize Blockchain Provider
    this.blockchainProvider = new ethers.providers.JsonRpcProvider(
      BLOCKCHAIN_NETWORKS.ACADEMIC_CREDENTIAL_NETWORK
    );

    // Load Credential Verification Smart Contract
    const contractAddress = process.env.CREDENTIAL_VERIFICATION_CONTRACT_ADDRESS;
    const contractABI = require('./CredentialVerificationContract.json');
    this.credentialVerificationContract = new ethers.Contract(
      contractAddress, 
      contractABI, 
      this.blockchainProvider
    );
  }

  // Issue Academic Credential on Blockchain
  async issueCredential(credentialData: z.infer<typeof CredentialSchema>) {
    const validatedCredential = CredentialSchema.parse(credentialData);

    // Generate Unique Credential Hash
    const credentialHash = this.generateCredentialHash(validatedCredential);

    // Store Credential Metadata in Database
    const credential = await this.prisma.academicCredential.create({
      data: {
        ...validatedCredential,
        credentialHash,
        blockchainTransactionHash: null
      }
    });

    try {
      // Issue Credential on Blockchain
      const wallet = new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY, 
        this.blockchainProvider
      );

      const transaction = await this.credentialVerificationContract
        .connect(wallet)
        .issueCredential(
          credential.holderDid,
          credential.institutionDid,
          credentialHash,
          validatedCredential.issuedDate.toISOString(),
          validatedCredential.expirationDate?.toISOString() || ''
        );

      // Update Credential with Blockchain Transaction Hash
      await this.prisma.academicCredential.update({
        where: { id: credential.id },
        data: { 
          blockchainTransactionHash: transaction.hash,
          verificationStatus: VerificationStatus.VERIFIED
        }
      });

      return {
        credential,
        blockchainTransaction: transaction
      };
    } catch (error) {
      // Handle Blockchain Issuance Error
      await this.prisma.academicCredential.update({
        where: { id: credential.id },
        data: { verificationStatus: VerificationStatus.REJECTED }
      });

      throw new Error('Failed to issue credential on blockchain');
    }
  }

  // Verify Academic Credential
  async verifyCredential(credentialId: string) {
    const credential = await this.prisma.academicCredential.findUnique({
      where: { id: credentialId }
    });

    if (!credential) {
      throw new Error('Credential not found');
    }

    try {
      // Blockchain Verification
      const isVerified = await this.credentialVerificationContract.verifyCredential(
        credential.holderDid,
        credential.credentialHash
      );

      // AI-Enhanced Verification Analysis
      const verificationAnalysis = await this.performAIVerificationAnalysis(credential);

      // Update Verification Status
      const updatedCredential = await this.prisma.academicCredential.update({
        where: { id: credentialId },
        data: {
          verificationStatus: isVerified 
            ? VerificationStatus.VERIFIED 
            : VerificationStatus.REJECTED,
          verificationAnalysis: JSON.stringify(verificationAnalysis)
        }
      });

      return {
        credential: updatedCredential,
        blockchainVerification: isVerified,
        aiVerificationAnalysis: verificationAnalysis
      };
    } catch (error) {
      throw new Error('Credential verification failed');
    }
  }

  // Revoke Academic Credential
  async revokeCredential(credentialId: string, reason: string) {
    const credential = await this.prisma.academicCredential.findUnique({
      where: { id: credentialId }
    });

    if (!credential) {
      throw new Error('Credential not found');
    }

    try {
      const wallet = new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY, 
        this.blockchainProvider
      );

      // Revoke Credential on Blockchain
      const transaction = await this.credentialVerificationContract
        .connect(wallet)
        .revokeCredential(
          credential.holderDid,
          credential.credentialHash,
          reason
        );

      // Update Credential Status
      const revokedCredential = await this.prisma.academicCredential.update({
        where: { id: credentialId },
        data: {
          verificationStatus: VerificationStatus.REVOKED,
          revocationReason: reason,
          revokedAt: new Date()
        }
      });

      return {
        credential: revokedCredential,
        blockchainTransaction: transaction
      };
    } catch (error) {
      throw new Error('Credential revocation failed');
    }
  }

  // Generate Unique Credential Hash
  private generateCredentialHash(credential: any): string {
    const hashInput = JSON.stringify({
      holderDid: credential.holderDid,
      institutionDid: credential.institutionDid,
      credentialType: credential.credentialType,
      title: credential.title,
      issuedDate: credential.issuedDate.toISOString()
    });

    return crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex');
  }

  // AI-Enhanced Verification Analysis
  private async performAIVerificationAnalysis(credential: any) {
    const verificationPrompt = `
      Perform comprehensive academic credential verification analysis:

      Credential Details:
      - Holder: ${credential.holderDid}
      - Institution: ${credential.institutionDid}
      - Type: ${credential.credentialType}
      - Title: ${credential.title}
      - Issued: ${credential.issuedDate}

      Verification Objectives:
      - Credential authenticity assessment
      - Institutional credibility verification
      - Potential fraud detection
      - Contextual credential validation
      - Comprehensive risk analysis
    `;

    const aiVerificationAnalysis = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic credential verification and fraud detection specialist.'
        },
        {
          role: 'user',
          content: verificationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    return JSON.parse(
      aiVerificationAnalysis.choices[0].message.content || '{}'
    );
  }

  // Comprehensive Credential Audit Trail
  async generateCredentialAuditTrail(credentialId: string) {
    const credential = await this.prisma.academicCredential.findUnique({
      where: { id: credentialId },
      include: {
        verificationEvents: true
      }
    });

    if (!credential) {
      throw new Error('Credential not found');
    }

    // Retrieve Blockchain Transaction History
    const transactionHistory = await this.credentialVerificationContract.getCredentialTransactionHistory(
      credential.holderDid,
      credential.credentialHash
    );

    // AI-Enhanced Audit Trail Analysis
    const auditTrailAnalysisPrompt = `
      Generate comprehensive credential audit trail analysis:

      Credential Details:
      ${JSON.stringify(credential, null, 2)}

      Transaction History:
      ${JSON.stringify(transactionHistory, null, 2)}

      Analyze:
      - Verification event patterns
      - Potential anomalies
      - Comprehensive credential lifecycle
      - Security and integrity assessment
    `;

    const aiAuditTrailAnalysis = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in credential audit trail analysis and forensic verification.'
        },
        {
          role: 'user',
          content: auditTrailAnalysisPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    });

    const auditTrailAnalysis = JSON.parse(
      aiAuditTrailAnalysis.choices[0].message.content || '{}'
    );

    return {
      credential,
      transactionHistory,
      auditTrailAnalysis
    };
  }

  // Cross-Institutional Credential Verification Network
  async establishCredentialVerificationNetwork(
    participatingInstitutions: string[]
  ) {
    try {
      const wallet = new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY, 
        this.blockchainProvider
      );

      // Register Participating Institutions
      const networkRegistrationTransaction = await this.credentialVerificationContract
        .connect(wallet)
        .registerCredentialVerificationNetwork(participatingInstitutions);

      return {
        registeredInstitutions: participatingInstitutions,
        networkRegistrationTransaction: networkRegistrationTransaction
      };
    } catch (error) {
      throw new Error('Failed to establish credential verification network');
    }
  }
}
