import logger from '@/utils/Logger';

// Reconnect service for handling match reconnection requests
class ReconnectService {
  private reconnectRequests: Map<string, ReconnectRequest> = new Map();

  /**
   * Send a reconnect request
   */
  async sendReconnectRequest(fromUserId: string, toUserId: string, matchId: string): Promise<string> {
    try {
      const requestId = `reconnect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request: ReconnectRequest = {
        id: requestId,
        fromUserId,
        toUserId,
        matchId,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      this.reconnectRequests.set(requestId, request);
      logger.info('Reconnect request sent', { requestId, fromUserId, toUserId, matchId });
      
      return requestId;
    } catch (error) {
      logger.error('Error sending reconnect request:', error);
      throw new Error('Failed to send reconnect request');
    }
  }

  /**
   * Accept a reconnect request
   */
  async acceptReconnectRequest(requestId: string): Promise<void> {
    try {
      const request = this.reconnectRequests.get(requestId);
      if (!request) {
        throw new Error('Reconnect request not found');
      }
      
      if (request.status !== 'pending') {
        throw new Error('Reconnect request is no longer pending');
      }
      
      request.status = 'accepted';
      request.acceptedAt = new Date();
      
      this.reconnectRequests.set(requestId, request);
      logger.info('Reconnect request accepted', { requestId });
    } catch (error) {
      logger.error('Error accepting reconnect request:', error);
      throw new Error('Failed to accept reconnect request');
    }
  }

  /**
   * Reject a reconnect request
   */
  async rejectReconnectRequest(requestId: string): Promise<void> {
    try {
      const request = this.reconnectRequests.get(requestId);
      if (!request) {
        throw new Error('Reconnect request not found');
      }
      
      if (request.status !== 'pending') {
        throw new Error('Reconnect request is no longer pending');
      }
      
      request.status = 'rejected';
      request.rejectedAt = new Date();
      
      this.reconnectRequests.set(requestId, request);
      logger.info('Reconnect request rejected', { requestId });
    } catch (error) {
      logger.error('Error rejecting reconnect request:', error);
      throw new Error('Failed to reject reconnect request');
    }
  }

  /**
   * Get reconnect requests for a user
   */
  async getReconnectRequests(userId: string): Promise<ReconnectRequest[]> {
    try {
      const requests: ReconnectRequest[] = [];
      
      for (const request of this.reconnectRequests.values()) {
        if (request.toUserId === userId && request.status === 'pending') {
          requests.push(request);
        }
      }
      
      return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('Error getting reconnect requests:', error);
      throw new Error('Failed to get reconnect requests');
    }
  }

  /**
   * Get a specific reconnect request
   */
  async getReconnectRequest(requestId: string): Promise<ReconnectRequest | null> {
    try {
      return this.reconnectRequests.get(requestId) || null;
    } catch (error) {
      logger.error('Error getting reconnect request:', error);
      throw new Error('Failed to get reconnect request');
    }
  }
}

interface ReconnectRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

export default new ReconnectService(); 