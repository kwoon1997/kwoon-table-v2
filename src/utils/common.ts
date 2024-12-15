export function getLeafNodesFromArray<T extends { children?: T[] }>(
  treeArray: T[]
) {
  let leafNodes: T[] = [];
  function traverse(node: T) {
    if (!node.children || node.children.length === 0) {
      leafNodes.push(node);
    } else {
      node.children.forEach((child) => traverse(child));
    }
  }
  treeArray.forEach((rootNode) => traverse(rootNode));
  return leafNodes;
}
