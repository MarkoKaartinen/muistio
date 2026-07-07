import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { ConditionalRender } from "./quartz/components"
import * as Plugin from "./quartz/plugins"
import { Breadcrumbs } from "./.quartz/plugins/breadcrumbs"
import { ArticleTitle } from "./.quartz/plugins/article-title"
import { TableOfContents } from "./.quartz/plugins/table-of-contents"
import { Backlinks } from "./.quartz/plugins/backlinks"
import { TagList } from "./.quartz/plugins/tag-list"
import LocalFolderContent from "./components/LocalFolderContent"
import LocalRecentNotes from "./components/LocalRecentNotes"
import LocalTagContent from "./components/LocalTagContent"
import LinksOnlyFooter from "./components/LinksOnlyFooter"
import PublishedModifiedMeta from "./components/PublishedModifiedMeta"
import SidebarThemeTweaks from "./components/SidebarThemeTweaks"

const config = await loadQuartzConfig()
const layout = await loadQuartzLayout({
  byPageType: {
    content: {
      beforeBody: [
        ConditionalRender({
          component: Breadcrumbs({ rootName: "Muistio" }),
          condition: ({ fileData }) => fileData.slug !== "index",
        }),
        ArticleTitle(),
        SidebarThemeTweaks,
      ],
      afterBody: [PublishedModifiedMeta, TagList()],
      right: [
        ConditionalRender({
          component: TableOfContents(),
          condition: ({ fileData }) => Array.isArray((fileData as Record<string, unknown>).toc),
        }),
        Backlinks({}),
        ConditionalRender({
          component: LocalRecentNotes({ limit: 5 }),
          condition: ({ fileData }) => fileData.slug === "index",
        }),
      ],
    },
  },
  defaults: {
    footer: LinksOnlyFooter,
  },
})

config.plugins.emitters = config.plugins.emitters.map((emitter) =>
  emitter.name === "PageTypeDispatcher"
    ? Plugin.PageTypes.PageTypeDispatcher({
        defaults: layout.defaults,
        byPageType: layout.byPageType,
      })
    : emitter,
)

config.plugins.pageTypes = (config.plugins.pageTypes ?? []).map((pageType) => {
  if (pageType.name === "FolderPage") {
    return {
      ...pageType,
      body: LocalFolderContent,
    }
  }

  if (pageType.name === "TagPage") {
    return {
      ...pageType,
      body: LocalTagContent,
    }
  }

  return pageType
})

export default config
export { layout }
