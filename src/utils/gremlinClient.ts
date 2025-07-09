import { driver } from "gremlin";

export interface GremlinConnection {
  connectionString: string;
  cosmosKey?: string;
  cosmosDatabase?: string;
  cosmosCollection?: string;
}

export interface GremlinClient {
  connect(connection: GremlinConnection): Promise<void>;
  disconnect(): Promise<void>;
  executeQuery(query: string): Promise<any>;
  testConnection(connection: GremlinConnection): Promise<{ success: boolean; message?: string; error?: string; data?: any }>;
}

class GremlinClientImpl implements GremlinClient {
  private client: any = null;

  async connect(connection: GremlinConnection): Promise<void> {
    if (this.client) {
      await this.disconnect();
    }

    let serverUrl = connection.connectionString;
    if (!/^wss?:\/\//.test(serverUrl)) {
      serverUrl = 'wss://' + serverUrl.replace(/^\/*/, '');
    }

    if (serverUrl.includes('cosmos')) {
      const { cosmosKey, cosmosDatabase, cosmosCollection } = connection;
      if (!cosmosKey || !cosmosDatabase || !cosmosCollection) {
        throw new Error('Missing Cosmos DB credentials.');
      }
      const resourcePath = `/dbs/${cosmosDatabase}/colls/${cosmosCollection}`;
      this.client = new driver.Client(serverUrl, {
        authenticator: new driver.auth.PlainTextSaslAuthenticator(
          resourcePath,
          cosmosKey
        ),
        traversalSource: 'g',
        rejectUnauthorized: true,
        mimeType: 'application/vnd.gremlin-v2.0+json',
      });
    } else {
      this.client = new driver.Client(serverUrl, { traversalSource: "g" });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  async executeQuery(query: string): Promise<any> {
    if (!this.client) {
      throw new Error("Not connected to Gremlin server");
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000);
    });
    
    const queryPromise = this.client.submit(query).then((result: any) => result.toArray());
    const items = await Promise.race([queryPromise, timeoutPromise]);
    
    return items;
  }

  async testConnection(connection: GremlinConnection): Promise<{ success: boolean; message?: string; error?: string; data?: any }> {
    try {
      await this.connect(connection);
      const testQuery = "g.V().limit(1)";
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 5000);
      });
      
      const queryPromise = this.client.submit(testQuery).then((result: any) => result.toArray());
      const items = await Promise.race([queryPromise, timeoutPromise]);
      
      await this.disconnect();
      
      return {
        success: true,
        message: "Connection successful",
        data: items
      };
    } catch (e: any) {
      await this.disconnect();
      return {
        success: false,
        error: e.message || "Failed to connect"
      };
    }
  }
}

// Create a singleton instance
export const gremlinClient = new GremlinClientImpl(); 