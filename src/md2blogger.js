import authentication from "./authentication.js";
import chalk from 'chalk';
import conversion from "./conversion.js";
import postToBlog from "./posting.js";

const md2blogger = async function(mdFile, blogUrl) {
    try {
        let [blogPost, authResult] = await Promise.all([conversion(mdFile), authentication()]);
        await postToBlog(blogUrl, blogPost, authResult);
        console.log(chalk.green("Post completed!"))
    } catch (error) {
        console.log(chalk.red("ERROR: " + error.message));
    }

}

export default md2blogger;