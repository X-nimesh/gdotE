// Parses Cosmos DB and local Gremlin API results into nodes and edges for react-force-graph
export function parseGremlinResults(result: any) {
  // Try to find the array of items in the result
  let items = result;
  if (Array.isArray(result)) {
    items = result;
  } else if (result?._items) {
    items = result._items;
  } else if (result?.result?.data) {
    items = result.result.data;
  } else if (result?.result) {
    items = result.result;
  }

  const nodes: any[] = [];
  const edges: any[] = [];
  const nodeMap = new Map();

  for (const item of items) {
    // Cosmos DB vertex
    if (item["type"] === "vertex" || item["@type"] === "g:Vertex" || (item.id && item.label && item.properties)) {
      const id = item.id || item["@value"]?.id || item["_id"];
      const label = item.label || item["@value"]?.label;
      const properties = item.properties || item["@value"]?.properties || {};
      const node = { id, label, ...properties };
      nodes.push(node);
      nodeMap.set(id, node);
    }
    // Cosmos DB edge
    else if (item["type"] === "edge" || item["@type"] === "g:Edge" || (item.id && item.label && item.inV && item.outV)) {
      const id = item.id || item["@value"]?.id || item["_id"];
      const label = item.label || item["@value"]?.label;
      const source = item.outV || item["@value"]?.outV;
      const target = item.inV || item["@value"]?.inV;
      const inVLabel = item.inVLabel || item["@value"]?.inVLabel;
      const outVLabel = item.outVLabel || item["@value"]?.outVLabel;
      const edge = { id, label, source, target, ...item.properties, inVLabel, outVLabel };
      edges.push(edge);
    }
    // Local Gremlin TinkerPop vertex
    else if (item["id"] && item["label"] && item["type"] === undefined && item["inV"] === undefined && item["outV"] === undefined) {
      nodes.push(item);
      nodeMap.set(item.id, item);
    }
    // Local Gremlin TinkerPop edge
    else if (item["id"] && item["label"] && item["inV"] && item["outV"]) {
      edges.push(item);
    }
  }

  // If only nodes or only edges, try to infer the other from the data
  if (nodes.length === 0 && edges.length > 0) {
    // Add nodes from edges
    const seen = new Set();
    for (const edge of edges) {
      if (edge.source && !nodeMap.has(edge.source) && !seen.has(edge.source)) {
        console.log({edge});
        
        nodes.push({ id: edge.source, label: edge.outVLabel || "" });
        seen.add(edge.source);
      }
      if (edge.target && !nodeMap.has(edge.target) && !seen.has(edge.target)) {
        nodes.push({ id: edge.target, label: edge.inVLabel || "" });
        seen.add(edge.target);
      }
    }
  }

  return { nodes, edges };
}
