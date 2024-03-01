import axios from "axios";

const getBlogId = async function (blogUrl, authResult) {
    try {
        let response = await axios.get("https://www.googleapis.com/blogger/v3/blogs/byurl?url=" + blogUrl, {
            headers: {
                'Authorization': `Bearer ${authResult.AccessToken}`
            }
        });
        return response.data.id;
    } catch (error) {
        if(error.response.data.error.code === 404) {
            return Promise.reject(new Error(`The blog '${blogUrl}' could not be found.`));
        }
    }

}

const findSimilarPostsByTitle = async function (blogId, title, authResult) {
    let response = await axios.get(`https://blogger.googleapis.com/v3/blogs/${blogId}/posts/search?q=${title}&fetchBodies=false&orderBy=UPDATED`, {
        headers: {
            'Authorization': `Bearer ${authResult.AccessToken}`
        }
    });

    let candidates = response.data.items ? response.data.items.filter(item => item.title === title) : [];
    if (candidates.length > 0) {
        return candidates[candidates.length - 1].id;
    }
    return null;
}

const insertPost = async function (blogId, blogPost, authResult) {
    await axios.post(`https://blogger.googleapis.com/v3/blogs/${blogId}/posts?isDraft=false`, {
        kind: "blogger#post",
        content: blogPost.Content,
        title: blogPost.Title,
        labels: blogPost.Tags,
        published: blogPost.Date
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.AccessToken}`
        }
    });
}

const updatePostContent = async function (blogId, postId, blogPost, authResult) {
    await axios.patch(`https://blogger.googleapis.com/v3/blogs/${blogId}/posts/${postId}`, {
        content: blogPost.Content,
        labels: blogPost.Tags,
        published: blogPost.Date
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.AccessToken}`
        }
    });
}

const postToBlog = async function (blogUrl, blogPost, authResult) {
    let blogId = await getBlogId(blogUrl, authResult);
    let existingPostId = await findSimilarPostsByTitle(blogId, blogPost.Title, authResult)
    if (existingPostId) {
        await updatePostContent(blogId, existingPostId, blogPost, authResult);
    }
    else {
        await insertPost(blogId, blogPost, authResult);
    }
}

export default postToBlog;