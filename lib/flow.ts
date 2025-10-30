import { readFile } from "fs/promises";
import path from "node:path";

export interface FlowNode {
  id: string;
  title: string;
  metadata?: Record<string, unknown>;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

type FlowMap = Record<string, FlowGraph>;

let cachedFlows: FlowMap | null = null;

async function readFlowFile(): Promise<FlowMap> {
  if (cachedFlows) {
    return cachedFlows;
  }

  const filePath = path.join(process.cwd(), "public", "flow.excalidraw");
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as { metadata?: Record<string, unknown> };
  const flows = (parsed.metadata?.flows as FlowMap | undefined) ?? {};
  cachedFlows = flows;
  return flows;
}

export async function loadFlowGraph(flowId: keyof FlowMap): Promise<FlowGraph | null> {
  const flows = await readFlowFile();
  return flows[flowId] ?? null;
}

export async function listFlowIds(): Promise<string[]> {
  const flows = await readFlowFile();
  return Object.keys(flows);
}
