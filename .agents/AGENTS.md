# Deployment & Version Control Workflow

When making code changes in this workspace, follow this Branching Workflow to ensure changes are deployed as Preview URLs first, without breaking the live production site on the `main` branch.

## Rule: Always Use Preview Branches
1. **Branch Out**: Do not commit directly to `main` for feature work or bug fixes. Run `git checkout -b <branch-name>` to create a new branch.
2. **Make Changes**: Implement the requested changes and test them if possible.
3. **Commit and Push**: Run `git add`, `git commit`, and `git push -u origin <branch-name>`. (The user will approve these via the run_command prompt).
4. **Vercel Preview**: Inform the user that Vercel is generating a Preview URL for the branch and ask them to test it.
5. **Merge to Main**: Once the user confirms the Preview looks good, merge the branch into `main` and push to deploy to production.
