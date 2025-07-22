// 🧠 Purpose: Reconnect service for handling expired match reconnections
import { firestore } from '@/firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import logger from '@/utils/Logger';

export interface ReconnectRequest {
  id: string;
  matchId: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface ReconnectService {
  sendReconnectRequest(matchId: string, requesterId: string, recipientId: string, message?: string): Promise<string>;
  acceptReconnectRequest(requestId: string): Promise<void>;
  rejectReconnectRequest(requestId: string): Promise<void>;
  getPendingRequests(userId: string): Promise<ReconnectRequest[]>;
  getReconnectRequest(requestId: string): Promise<ReconnectRequest | null>;
}

class FirebaseReconnectService implements ReconnectService {
  private readonly COLLECTION = 'reconnectRequests';

  async sendReconnectRequest(
    matchId: string, 
    requesterId: string, 
    recipientId: string, 
    message?: string
  ): Promise<string> {
    try {
      // Validate that the original match exists
      const matchDoc = await getDoc(doc(firestore, 'matches', matchId));
      if (!matchDoc.exists()) {
        throw new Error('Original match not found');
      }

      // Check if a request already exists
      const existingQuery = query(
        collection(firestore, this.COLLECTION),
        where('matchId', '==', matchId),
        where('requesterId', '==', requesterId),
        where('status', '==', 'pending')
      );
      
      const existingRequests = await getDocs(existingQuery);
      if (!existingRequests.empty) {
        throw new Error('Reconnect request already exists');
      }

      // Create new reconnect request
      const requestData = {
        matchId,
        requesterId,
        recipientId,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: message || '',
      };

      const docRef = await addDoc(collection(firestore, this.COLLECTION), requestData);
      
      logger.info('Reconnect request sent', { requestId: docRef.id, matchId, requesterId });
      
      return docRef.id;
    } catch (error) {
      logger.error('Failed to send reconnect request', error, { matchId, requesterId });
      throw error;
    }
  }

  async acceptReconnectRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(firestore, this.COLLECTION, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Reconnect request not found');
      }

      const requestData = requestDoc.data() as ReconnectRequest;
      
      if (requestData.status !== 'pending') {
        throw new Error('Request is no longer pending');
      }

      // Update request status
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });

      // Create new match from the original match data
      const originalMatchDoc = await getDoc(doc(firestore, 'matches', requestData.matchId));
      if (originalMatchDoc.exists()) {
        const originalMatch = originalMatchDoc.data();
        
        // Create new match with reconnected status
        await addDoc(collection(firestore, 'matches'), {
          userId1: requestData.requesterId,
          userId2: requestData.recipientId,
          timestamp: serverTimestamp(),
          status: 'reconnected',
          originalMatchId: requestData.matchId,
          reconnectedAt: serverTimestamp(),
        });
      }

      logger.info('Reconnect request accepted', { requestId });
    } catch (error) {
      logger.error('Failed to accept reconnect request', error, { requestId });
      throw error;
    }
  }

  async rejectReconnectRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(firestore, this.COLLECTION, requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Reconnect request not found');
      }

      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });

      logger.info('Reconnect request rejected', { requestId });
    } catch (error) {
      logger.error('Failed to reject reconnect request', error, { requestId });
      throw error;
    }
  }

  async getPendingRequests(userId: string): Promise<ReconnectRequest[]> {
    try {
      const requestsQuery = query(
        collection(firestore, this.COLLECTION),
        where('recipientId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(requestsQuery);
      const requests: ReconnectRequest[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          matchId: data.matchId,
          requesterId: data.requesterId,
          recipientId: data.recipientId,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date(),
          message: data.message,
        });
      });
      
      return requests;
    } catch (error) {
      logger.error('Failed to get pending requests', error, { userId });
      throw error;
    }
  }

  async getReconnectRequest(requestId: string): Promise<ReconnectRequest | null> {
    try {
      const requestDoc = await getDoc(doc(firestore, this.COLLECTION, requestId));
      
      if (!requestDoc.exists()) {
        return null;
      }

      const data = requestDoc.data();
      return {
        id: requestDoc.id,
        matchId: data.matchId,
        requesterId: data.requesterId,
        recipientId: data.recipientId,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
        message: data.message,
      };
    } catch (error) {
      logger.error('Failed to get reconnect request', error, { requestId });
      throw error;
    }
  }
}

// Mock implementation for development
class MockReconnectService implements ReconnectService {
  private requests: Map<string, ReconnectRequest> = new Map();

  async sendReconnectRequest(
    matchId: string, 
    requesterId: string, 
    recipientId: string, 
    message?: string
  ): Promise<string> {
    const requestId = `reconnect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: ReconnectRequest = {
      id: requestId,
      matchId,
      requesterId,
      recipientId,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      message: message || '',
    };
    
    this.requests.set(requestId, request);
    logger.info('Mock reconnect request sent', { requestId, matchId });
    
    return requestId;
  }

  async acceptReconnectRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Reconnect request not found');
    }
    
    request.status = 'accepted';
    this.requests.set(requestId, request);
    logger.info('Mock reconnect request accepted', { requestId });
  }

  async rejectReconnectRequest(requestId: string): Promise<void> {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error('Reconnect request not found');
    }
    
    request.status = 'rejected';
    this.requests.set(requestId, request);
    logger.info('Mock reconnect request rejected', { requestId });
  }

  async getPendingRequests(userId: string): Promise<ReconnectRequest[]> {
    return Array.from(this.requests.values()).filter(
      request => request.recipientId === userId && request.status === 'pending'
    );
  }

  async getReconnectRequest(requestId: string): Promise<ReconnectRequest | null> {
    return this.requests.get(requestId) || null;
  }
}

export default FirebaseReconnectService;
export { MockReconnectService }; 