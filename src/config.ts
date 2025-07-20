import type { Site, SocialObjects } from "./types"

export const SITE: Site = {
  website: "https://www.ziye.dev", // replace this with your deployed domain
  author: "Ziye",
  profile: "https://github.com/iucario",
  desc: "Ziye's Blog",
  title: "Ziye's Blog",
  ogImage: undefined,
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/iucario/blog/edit/main/src/content/blog",
    text: "Suggest Edit",
    appendFilePath: true,
  },
}

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN", "zh-CN", "ja-JP"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
}

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/iucario",
    linkTitle: "Ziye on Github",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "www.linkedin.com/in/ziye-r-3a7553236",
    linkTitle: "Ziye on LinkedIn",
    active: true,
  }
]
