import authentication from "./authentication.js";
import postToBlog from "./posting.js";
import conversion from "./conversion.js";

const md2blogger = async function(mdFile, blogUrl) {
    try {
        let [blogPost, authResult] = await Promise.all([conversion(mdFile), authentication()]);
        await postToBlog(blogUrl, blogPost, authResult);
        console.log("Post completed!")
    } catch (error) {
        console.log(error.message)
    }

}

export default md2blogger;