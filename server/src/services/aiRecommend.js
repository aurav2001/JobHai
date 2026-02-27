/**
 * AI Job Recommendation Service
 * Uses cosine similarity between candidate skills and job skills
 * No external ML service required - pure JavaScript implementation
 */

const cosineSimilarity = (vecA, vecB) => {
    const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0, magA = 0, magB = 0;
    for (const key of keys) {
        const a = vecA[key] || 0;
        const b = vecB[key] || 0;
        dotProduct += a * b;
        magA += a * a;
        magB += b * b;
    }
    if (!magA || !magB) return 0;
    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

const buildSkillVector = (skills) => {
    const vec = {};
    if (!skills || !skills.length) return vec;
    skills.forEach((skill) => {
        const key = skill.toLowerCase().trim();
        vec[key] = (vec[key] || 0) + 1;
    });
    return vec;
};

/**
 * @param {string[]} candidateSkills - Array of candidate skill strings
 * @param {Array} jobs - Array of job documents with skills[] field
 * @param {number} topN - Number of recommendations to return
 * @returns {Array} - Sorted array of { job, score }
 */
const recommendJobs = (candidateSkills, jobs, topN = 10) => {
    if (!candidateSkills || candidateSkills.length === 0) return jobs.slice(0, topN).map(j => ({ job: j, score: 0 }));

    const candidateVec = buildSkillVector(candidateSkills);
    const scored = jobs.map((job) => {
        const jobVec = buildSkillVector(job.skills || []);
        const score = cosineSimilarity(candidateVec, jobVec);
        return { job, score };
    });

    // Sort by score descending, then by recency
    scored.sort((a, b) => {
        if (Math.abs(b.score - a.score) < 0.01) {
            return new Date(b.job.createdAt) - new Date(a.job.createdAt);
        }
        return b.score - a.score;
    });

    return scored.slice(0, topN);
};

module.exports = { recommendJobs };
