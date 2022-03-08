/**
 * Fetch text implementation
 * 
 * @param {string} url 
 * @param {Function} success 
 * @param {Function} failure 
 */
const fetchText = (url, success, failure) => {
    fetch(url).then(response => response.text())
        .then(data => success(data)).catch((error) => {
            failure(error);
        });
}

export default fetchText;