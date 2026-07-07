import type { Root, Element } from "hast"
import { visit } from "unist-util-visit"
import type { QuartzTransformerPlugin } from "../quartz/plugins/types"

function getClassNames(node: Element): string[] {
  const value = node.properties?.className
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string")
  }

  if (typeof value === "string") {
    return value.split(/\s+/).filter(Boolean)
  }

  return []
}

const NoBrokenLinks: QuartzTransformerPlugin = () => ({
  name: "NoBrokenLinks",
  htmlPlugins() {
    return [
      () => {
        return (tree: Root) => {
          visit(tree, "element", (node: Element) => {
            if (node.tagName !== "a" || typeof node.properties?.href !== "string") {
              return
            }

            const classNames = getClassNames(node)
            if (!classNames.includes("internal") || !classNames.includes("broken")) {
              return
            }

            node.tagName = "span"
            delete node.properties.href
            delete node.properties.target
            delete node.properties.rel
            delete node.properties["data-slug"]
          })
        }
      },
    ]
  },
})

export default NoBrokenLinks
