# md2blogger

md2blogger is a CLI tool that helps the maintanence of a blog hosted in [Blogger service](https://www.blogger.com/).

You can store yout blog posts in the [markdown](https://www.markdownguide.org/) format and leave to md2blogger the burden of converting them to HTML and posting them to your blog.

## Features

- Authentication with your Google account
- Integration with the Blogger API to automate the posting process
- Syntax highlighter for code samples
- Definition of the date of the blog post and its tags
- Generation of HTML divs with custom CSS classes


## How to install it

This tool depends on [NodeJS](https://nodejs.org/en/about) to be executed. Please follow the [instructions](https://nodejs.org/en/download/) to download it and install it in your environment.

After that, you can install this CLI using the following command:

```bash
npm install --save-dev md2blogger
```

## How to use it

Write your blog posts in markdown format, like in the example below;

```
---
title: This is a markdown blog tool being tested!
date: '2024-02-01T00:00:00.000-03:00'
tags: 
- tag1
- tag2
---
# Hello world!

This is an example!!!

::: note custom-css
**IMPORTANT:** This is an special note as a div with a custom class named 'custom-css'
:::

```

There are a few important things to considering when creating your blog posts in markdown:
- You need to create an section with the post metadata. It begins and ends with the ```---``` and contains some information (in the YAML format):
  - **title** - it's the post title and it's very important that it does not change after the post is publish for the first time. This field is used to validate if md2blogger needs to create a new post or update an existing one. If changed, a new post will be created and you'll have to delete the old one manually.
  - **date** - it's the date you want the blog post to have.
  - **tags** - it's a optional list of tags (or labels) you want for your blog post.
- The ```::: note ... :::``` is a special markdown element, interpreted only by md2blogger, that you can use to create div elements with a custom css class. This is useful if you want notes, alerts and warnings to be displayed with a different visual.

After the blog post is written considering these constraints, you'll only need to save it and run the command below to make md2blogger convert it to HTML and post it for you, passing:
- The url of you blog (for example, https://myblog.blogspot.com)
- The relative path of the md file you've just created.

```bash
md2blogger --url https://myblog.blogspot.com --md xxx.md
```

### Authentication

If it's the fist time you're using this tool, a new browser tab will be opened where you can authenticate and grant the permission needed by md2blogger to manage your blog. Don't worry, the authentication data is not stored in any remote server, or sent to anyone: it's only stored locally.

If you want, you can revoke the permission given to md2blogger any time you want accessing Google's [Third-party apps & services](https://myaccount.google.com/connections). You're in control of your data.

## Missing features

We couldn't make md2blogger deal with **image uploads**, so if you blog post needs an image, currently the only option is to upload it manually using Blogger's UI then referencing the full path of the image. We're working in a solution to overcome this limitation.