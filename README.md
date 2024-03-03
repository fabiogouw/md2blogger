# md2blogger

md2blogger is a CLI tool that helps the maintanence of a blog hosted in [Blogger service](https://www.blogger.com/).

You can store yout blog posts in the [markdown](https://www.markdownguide.org/) format and leave to md2blogger the burden of converting them to HTML and posting them to your blog.

## Features

- Authentication with your Google account
- Integration with the Blogger API to automate the posting process
- Syntax highlighter for code samples
- Definition of the date of the blog post and its tags
- Generation of HTML divs with custom CSS classes


## How to use it

This tool depends on [NodeJS](https://nodejs.org/en/about) to be executed. Please follow the [instructions](https://nodejs.org/en/download/) to download it and install it in your environment.

```bash
md2blogger --url https://myblog.blogspot.com --md xxx.md
```