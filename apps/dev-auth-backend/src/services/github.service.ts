import { Octokit } from 'octokit';

export class GitHubService {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    async pushFile(owner: string, repo: string, filePath: string, content: string, message: string, branch: string = 'main') {
        try {
            // Get the current file's SHA if it exists
            let sha: string | undefined;
            try {
                const { data } = await this.octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: filePath,
                    ref: branch
                });
                if (!Array.isArray(data)) {
                    sha = data.sha;
                }
            } catch (error) {
                // File doesn't exist yet, which is fine
            }

            // Create or update the file
            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: filePath,
                message,
                content: Buffer.from(content).toString('base64'),
                sha,
                branch
            });

            return { success: true, message: `Successfully pushed ${filePath} to ${owner}/${repo}` };
        } catch (error: any) {
            if (error.status === 404) {
                console.error(`GitHub repo not found: ${owner}/${repo}`);
                throw new Error(`Repository '${owner}/${repo}' not found. Please create it first using the 'github_create_repo' action.`);
            }
            console.error('GitHub Push Error:', error.message);
            throw new Error(`GitHub Sync Failed: ${error.message}`);
        }
    }

    async createRepo(name: string, description: string = 'Created by JARVIS.OS') {
        try {
            const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
                name,
                description,
                private: false // Default to public for now
            });
            return data;
        } catch (error: any) {
            throw new Error(`Repo Creation Failed: ${error.message}`);
        }
    }
}
