import { NextRequest, NextResponse } from "next/server";
import { driver } from "gremlin";

const ENV_KEY = process.env.COSMOSDB_GREMLIN_KEY;
const ENV_DB = process.env.COSMOSDB_DATABASE;
const ENV_COLL = process.env.COSMOSDB_COLLECTION;

export async function POST(req: NextRequest) {
  const { query, connectionString, cosmosKey, cosmosDatabase, cosmosCollection } = await req.json();
  if (!query || !connectionString) {
    return NextResponse.json({ error: "Missing query or connection string" }, { status: 400 });
  }

  try {
    let client: any;
    let serverUrl = connectionString;
    if (!/^wss?:\/\//.test(serverUrl)) {
      serverUrl = 'wss://' + serverUrl.replace(/^\/*/, '');
    }

    if (serverUrl.includes('cosmos')) {
      const key = cosmosKey || ENV_KEY;
      const db = cosmosDatabase || ENV_DB;
      const coll = cosmosCollection || ENV_COLL;
      if (!key || !db || !coll) {
        return NextResponse.json({ error: 'Missing Cosmos DB credentials.' }, { status: 400 });
      }
      const resourcePath = `/dbs/${db}/colls/${coll}`;
      client = new driver.Client(serverUrl, {
        authenticator: new driver.auth.PlainTextSaslAuthenticator(
          resourcePath,
          key
        ),
        traversalSource: 'g',
        rejectUnauthorized: true,
        mimeType: 'application/vnd.gremlin-v2.0+json',
      });
    } else {
      client = new driver.Client(serverUrl, { traversalSource: "g" });
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000);
    });
    const queryPromise = client.submit(query).then((result: any) => result.toArray());
    const items = await Promise.race([queryPromise, timeoutPromise]);
    await client.close();
    return NextResponse.json({ raw: items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to execute query" }, { status: 500 });
  }
} 