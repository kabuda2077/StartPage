# Preset engine icons

These favicon assets are bundled to avoid network requests when displaying preset search engines. They retain their original branding and are used to identify the corresponding services.

| Asset | Source |
| --- | --- |
| google.ico | https://www.google.com/favicon.ico |
| duckduckgo.ico | https://duckduckgo.com/favicon.ico |
| baidu.ico | https://www.baidu.com/favicon.ico |
| bing.ico | https://www.microsoft.com/favicon.ico |
| yahoo.ico | https://s.yimg.com/rz/l/favicon.ico |
| yandex.ico | https://yandex.com/favicon.ico |
| bilibili.ico | https://www.bilibili.com/favicon.ico |
| github.svg | https://github.githubassets.com/favicons/favicon.svg |
| zhihu.ico | https://static.zhihu.com/heifetz/favicon.ico |

`build.sh` embeds these assets as data URLs in `StartPage.html`. Update the source files to refresh the bundled icons.
