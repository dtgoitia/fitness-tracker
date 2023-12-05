type Results = { success: true; hash: string } | { success: false; reason: string };

export function findVersionHash(): Results {
  const headElements = document.getElementsByTagName("head")[0].children;

  const jsBundleUrls = [...headElements]
    .filter((element) => element.tagName === "SCRIPT")
    .map((element) => element as HTMLScriptElement)
    .map((element) => element.src)
    .filter((src) => src.includes("assets/index-"));

  switch (jsBundleUrls.length) {
    case 0:
      return {
        success: false,
        reason: "version not found: no JS bundle found in HTML <head>",
      };
    case 1:
      break;
    default:
      return {
        success: false,
        reason: `version not determined: ${jsBundleUrls.length} JS bundle found in HTML <head>`,
      };
  }

  const jsBundleUrl = jsBundleUrls[0];
  // "https://davidtorralba.com/fitness-tracker/assets/index-H0pKw_7l.js"

  const hash = jsBundleUrl.replace(/.*index-(.+)\.js/, "$1");
  return { success: true, hash };
}
