export const SITE = {
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
  showBackButton: true, // show back button in post detail
  editPost: {
    url: "https://github.com/iucario/blog/edit/main/src/content/blog",
    text: "Edit Page",
    enabled: true,
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en",
  timezone: "Asia/Tokyo",
} as const


export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
}
