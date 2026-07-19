const axios = require("axios");

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.JUDGE0_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
};

const languageMap = {
    "C++": 54,
    "c++": 54,
    "cpp": 54,
    "Java": 62,
    "java": 62,
    "JavaScript": 63,
    "javascript": 63,
    "Python": 71,
    "python": 71,
};

const getLanguageById = (language) => {
    const id = languageMap[language];
    if (!id) throw new Error(`Unsupported language: ${language}`);
    return id;
};

const submitBatch = async (submissions) => {
    try {
        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch?base64_encoded=false`,
            { submissions },
            { headers: JUDGE0_HEADERS }
        );
        return response.data;
    } catch (err) {
        console.error("Judge0 batch submit error:", err.message);
        throw new Error("Failed to submit code to Judge0");
    }
};

const submitToken = async (tokens) => {
    try {
        const tokenString = tokens.join(",");
        // Poll until all results are ready
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            const response = await axios.get(
                `${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=false&fields=stdin,expected_output,stdout,status_id,stderr,time,memory,token`,
                { headers: JUDGE0_HEADERS }
            );

            const results = response.data.submissions;
            const allDone = results.every(r => r.status_id !== 1 && r.status_id !== 2);

            if (allDone) {
                return results;
            }

            // Wait 1 second before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error("Judge0 submission timed out");
    } catch (err) {
        console.error("Judge0 token fetch error:", err.message);
        throw new Error("Failed to fetch results from Judge0");
    }
};

module.exports = { getLanguageById, submitBatch, submitToken };
