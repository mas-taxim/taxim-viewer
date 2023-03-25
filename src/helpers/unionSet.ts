export interface Node {
  lat: number
  lng: number
}

export interface Edge {
  from: number
  to: number
}

class UnionSet {
  nodes: Node[]
  parentIdx: Map<string | number, string | number>

  constructor(nodes: Node[]) {
    this.nodes = nodes

    this.parentIdx = new Map()
  }

  hasKey(id: string | number): boolean {
    return id in this.parentIdx
  }

  find(id: string | number): string | number {
    const parent = this.parentIdx.get(id)
    if (!parent || id === parent) {
      this.parentIdx.set(id, id)
      return id
    } else {
      const president = this.find(parent)
      this.parentIdx.set(id, president)
      return president
    }
  }

  merge(a: string | number, b: string | number): void {
    const ga = this.find(a)
    const gb = this.find(b)
    this.parentIdx.set(ga, gb)
  }

  keys(): Array<string | number> {
    return Array.from(this.parentIdx.keys())
  }
}

export default UnionSet
